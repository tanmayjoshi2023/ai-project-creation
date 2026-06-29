require("dotenv").config({ path: ".env.local" });

const { GoogleGenAI } = require("@google/genai");
const { Redis } = require("@upstash/redis");
const { Client } = require("pg");

async function testGemini() {
    try {
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Reply with only: Gemini OK",
        });

        console.log("✅ Gemini API");
        console.log("   ", response.text.trim());
        return true;
    } catch (err) {
        console.log("❌ Gemini API");
        console.log("   ", err.message);
        return false;
    }
}

async function testAlpha() {
    try {
        const key = process.env.ALPHA_VANTAGE_API_KEY;

        const res = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${key}`
        );

        const data = await res.json();

        if (
            data["Global Quote"] ||
            data["Information"] ||
            data["Note"]
        ) {
            console.log("✅ Alpha Vantage");
            return true;
        }

        console.log("❌ Alpha Vantage");
        console.log(data);
        return false;

    } catch (err) {
        console.log("❌ Alpha Vantage");
        console.log(err.message);
        return false;
    }
}

async function testTavily() {
    try {
        const res = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: process.env.TAVILY_API_KEY,
                query: "Apple Stock",
            }),
        });

        const data = await res.json();

        if (data.results) {
            console.log("✅ Tavily");
            return true;
        }

        console.log("❌ Tavily");
        console.log(data);

        return false;

    } catch (err) {
        console.log("❌ Tavily");
        console.log(err.message);
        return false;
    }
}

async function testRedis() {
    try {

        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        await redis.set("healthcheck", "OK");

        const value = await redis.get("healthcheck");

        if (value === "OK") {
            console.log("✅ Upstash Redis");
            return true;
        }

        console.log("❌ Upstash Redis");
        return false;

    } catch (err) {
        console.log("❌ Upstash Redis");
        console.log(err.message);
        return false;
    }
}

async function testDatabase() {
    try {

        const client = new Client({
            connectionString: process.env.DATABASE_URL,
        });

        await client.connect();

        await client.query("SELECT NOW()");

        await client.end();

        console.log("✅ PostgreSQL / Neon");

        return true;

    } catch (err) {

        console.log("❌ PostgreSQL / Neon");
        console.log(err.message);

        return false;
    }
}

function testEnv() {

    console.log("\n========== Environment ==========");

    const vars = [
        "GEMINI_API_KEY",
        "ALPHA_VANTAGE_API_KEY",
        "TAVILY_API_KEY",
        "DATABASE_URL",
        "BETTER_AUTH_SECRET",
        "BETTER_AUTH_URL",
        "NEXT_PUBLIC_APP_URL",
        "UPSTASH_REDIS_REST_URL",
        "UPSTASH_REDIS_REST_TOKEN",
    ];

    let ok = true;

    vars.forEach((v) => {

        if (process.env[v]) {

            console.log(`✅ ${v}`);

        } else {

            console.log(`❌ ${v}`);

            ok = false;
        }

    });

    return ok;
}

async function main() {

    console.log("\n");
    console.log("====================================");
    console.log("      INVESTIQ HEALTH CHECK");
    console.log("====================================");

    let passed = 0;

    let total = 6;

    if (testEnv()) passed++;

    if (await testGemini()) passed++;

    if (await testAlpha()) passed++;

    if (await testTavily()) passed++;

    if (await testRedis()) passed++;

    if (await testDatabase()) passed++;

    console.log("\n====================================");

    console.log(`Passed ${passed}/${total} tests`);

    if (passed === total) {

        console.log("🎉 Everything is working.");

    } else {

        console.log("⚠️ Some services need attention.");

    }

    console.log("====================================");
}

main();