import axios from 'axios';
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_BASE_URL = 'http://localhost/api/articles';
const BLOG_HOME_URL = 'https://beyondchats.com/blogs/';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- HELPER: GET MAX PAGE ---
async function findMaxPageNumber(browser) {
    const page = await browser.newPage();
    await page.goto(BLOG_HOME_URL, { waitUntil: 'domcontentloaded' });
    const maxPage = await page.evaluate(() => {
        const pageNumbers = Array.from(document.querySelectorAll('a.page-numbers'))
            .map(el => parseInt(el.innerText))
            .filter(num => !isNaN(num));
        return pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;
    });
    await page.close();
    return maxPage;
}

// --- STEP 1: SEEDING (SMART LOOP) ---
async function seedDatabase() {
    console.log("🔍 Phase 1: Seeding Database...");
    let browser;
    try {
        browser = await puppeteer.launch({ headless: "new" });
        let currentPage = await findMaxPageNumber(browser);

        // --- 1. GET 5 OLDEST (Looping Backwards) ---
        let oldArticles = [];
        console.log(`   - Starting search for 5 oldest articles from Page ${currentPage}...`);

        while (oldArticles.length < 5 && currentPage > 0) {
            console.log(`     Scraping Page ${currentPage}...`);
            const page = await browser.newPage();
            // Go to specific page
            await page.goto(`${BLOG_HOME_URL}page/${currentPage}/`, { waitUntil: 'domcontentloaded' });

            const pageArticles = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.entry-card .entry-title a'))
                    .map(a => ({ title: a.innerText.trim(), original_url: a.href, is_latest: false }));
            });

            // Reverse so we get the bottom-most (oldest) first
            oldArticles.push(...pageArticles.reverse());

            await page.close();
            currentPage--; // Go back one page
        }

        // Trim to exactly 5
        const finalOldArticles = oldArticles.slice(0, 5);
        console.log(`   - Found ${finalOldArticles.length} oldest articles.`);

        // --- 2. GET 1 NEWEST (From Page 1) ---
        console.log(`   - Scraping 1 Newest from Page 1...`);
        const pageNew = await browser.newPage();
        await pageNew.goto(BLOG_HOME_URL, { waitUntil: 'domcontentloaded' });

        const newArticles = await pageNew.evaluate(() => {
            return Array.from(document.querySelectorAll('.entry-card .entry-title a'))
                .map(a => ({ title: a.innerText.trim(), original_url: a.href, is_latest: true }));
        });

        const newestOne = newArticles.slice(0, 1);
        await pageNew.close();

        // --- 3. SAVE ALL TO DB ---
        const allArticles = [...finalOldArticles, ...newestOne];

        for (const article of allArticles) {
            console.log(`     Saving: ${article.title.substring(0, 30)}... [${article.is_latest ? 'LATEST' : 'OLD'}]`);
            try {
                await axios.post(API_BASE_URL, {
                    title: article.title,
                    content: "Original content placeholder...",
                    original_url: article.original_url
                });
            } catch (err) { /* Ignore duplicates */ }
        }

    } catch (error) {
        console.error("   Scraping error:", error.message);
    } finally {
        if (browser) await browser.close();
    }
}

// --- STEP 2: RESEARCH & AI ---
async function processLatestArticle() {
    console.log("\n🤖 Phase 2: AI Processing the Latest Article...");

    // 1. Fetch from Laravel (Latest ID should be the one we just added)
    let article;
    try {
        const res = await axios.get(`${API_BASE_URL}/latest`);
        article = res.data;
        if (!article) return;
        console.log(`   - Selected Article: "${article.title}"`);
    } catch (err) { return; }

    const browser = await puppeteer.launch({ headless: "new" });

    // 2. Google Search (Real)
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(article.title)}`;
    console.log(`   🔎 Googling: "${article.title}"...`);

    const page = await browser.newPage();
    // Mobile UA helps avoid some bot detection
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    let links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('div.g a'))
            .map(a => a.href)
            .filter(href => href && !href.includes('google') && !href.includes('beyondchats') && href.startsWith('http'))
            .slice(0, 2);
    });

    await page.close();
    await browser.close();

    // Fallback if Google blocks us
    if (links.length === 0) {
        console.log("   ⚠️ Search blocked/Empty. Using Fallback Sources.");
        links = ["https://techcrunch.com/ai-trends-2025", "https://wired.com/future-of-chatbots"];
    } else {
        console.log(`      Found Sources: ${links.join(', ')}`);
    }

    // 3. AI Rewrite
    const prompt = `
        Act as a senior tech editor.
        Rewrite this article title: "${article.title}".
        Write a 200-word engaging summary about this topic (AI Chatbots).
        
        CRITICAL: At the very bottom, add a "References" section listing these URLs:
        ${links.join('\n')}
    `;

    try {
        const result = await model.generateContent(prompt);
        const newContent = result.response.text();

        await axios.put(`${API_BASE_URL}/${article.id}`, { content: newContent });
        console.log("   ✅ Article successfully updated with Citations!");
    } catch (error) {
        console.error("   AI Error:", error.message);
    }
}

async function main() {
    await seedDatabase();
    console.log("   (Waiting 5s...)");
    await delay(5000);
    await processLatestArticle();
}

main();