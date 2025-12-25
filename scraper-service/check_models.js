import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
    console.log("Checking available Gemini models...");
    try {
        const response = await axios.get(URL);
        const models = response.data.models;

        console.log("\n✅ AVAILABLE MODELS:");
        models.forEach(model => {
            // Only show models that support content generation
            if (model.supportedGenerationMethods.includes("generateContent")) {
                console.log(`   - ${model.name.replace('models/', '')}`);
            }
        });
    } catch (error) {
        console.error("❌ Error fetching models:", error.response ? error.response.data : error.message);
    }
}

listModels();