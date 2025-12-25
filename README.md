# BeyondChats Assessment - Content Intelligence System

> A full-stack automated content pipeline that scrapes legacy blog posts, archives them, and uses GenAI to research and rewrite the latest content with citations.

## 🏗️ Architecture & Workflow

This Monorepo consists of three distinct microservices working in harmony:

### 1. Backend (Laravel 11 + Docker)
- Acts as the central **"Source of Truth"** database (MySQL).
- Provides RESTful APIs (`GET`, `POST`, `PUT`) to manage article states.
- Runs in a containerized environment via **Laravel Sail**.

### 2. Intelligence Service (Node.js + Puppeteer + Gemini 2.0)
- **The Archivist**: Navigates to the oldest pages of the target blog (e.g., Page 15) to archive historical data.
- **The Researcher**: Identifies the latest article, performs a Google Search (headless browser) to find external sources, and extracts relevant context.
- **The Editor**: Uses **Google's Gemini 2.0 Flash Lite** to rewrite the article based on new research and appends citations.

### 3. Frontend (React + Vite + Tailwind)
- A modern, responsive dashboard to visualize the pipeline.
- Features **Dark Mode**, **Skeleton Loaders**, and **Glassmorphism UI**.
- Distinguishes between "Original" (Archived) and "AI Enhanced" (Processed) content.

---

## 🚀 Setup Instructions

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Running)
- [Node.js](https://nodejs.org/) (v18+)

### 1. Start the Backend (Laravel)
The backend is completely dockerized. No local PHP installation is required.

Run these commands in your terminal:
```bash
cd backend

# Install dependencies via Docker container
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php82-composer:latest \
    composer install --ignore-platform-reqs

# Start the containers (Database + App)
./vendor/bin/sail up -d

# Run Database Migrations
./vendor/bin/sail artisan migrate
```
> The API will be available at: `http://localhost/api/articles`

### 2. Run the Intelligence Pipeline
This script will seed the database with the 5 oldest articles and 1 AI-processed new article.

Run these commands:
```bash
cd scraper-service
npm install

# Create .env file and add your key
# GEMINI_API_KEY=your_key_here

# Run the pipeline
node index.js
```
> Watch the console logs to see the scraping, researching, and AI rewriting process in real-time.

### 3. Launch the Frontend Dashboard

Run these commands:
```bash
cd frontend
npm install
npm run dev
```
> Access the Dashboard at: `http://localhost:5173`

---

## 💡 Implementation Details & Decisions

**Why Puppeteer over Guzzle/Cheerio?**
The target website (BeyondChats) utilizes JavaScript for rendering components. Standard PHP scrapers (Guzzle) often fail to capture dynamic content. I utilized **Puppeteer** in a Node.js microservice to control a headless Chrome instance, ensuring robust data extraction regardless of client-side rendering.

**The "5+1" Strategy**
To fulfill the assignment requirements strictly:
1. **Archive**: The script calculates the total pagination depth (e.g., 15 pages) and scrapes backwards to retrieve the true 5 oldest articles.
2. **Enhance**: It then jumps to Page 1 to grab the newest article, performs research, and generates an AI-enhanced version with citations.

**Rate Limit Handling**
The system includes intelligent backoff strategies (30s - 60s delays) to handle Google Gemini API rate limits (`429 Too Many Requests`) gracefully without crashing the pipeline.

---

## ✅ Features Checklist

- [x] Phase 1: Scrape Oldest Articles & Store in DB (Laravel/MySQL)
- [x] Phase 2: Research & Rewrite Latest Article (Node/Gemini)
- [x] Phase 2: External Citations & Source Linking
- [x] Phase 3: Responsive React UI with Dark Mode

---

**Author:** Anushka Tyagi