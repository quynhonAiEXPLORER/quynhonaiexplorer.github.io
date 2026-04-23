// api.js

// ==========================================
// 1. CẤU HÌNH & KHỞI TẠO FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDqGxQYtmt3fH3RmIalBzW-7lH9O6W5cjk",
    authDomain: "quynhonaiexplorer.firebaseapp.com",
    projectId: "quynhonaiexplorer",
    storageBucket: "quynhonaiexplorer.firebasestorage.app",
    messagingSenderId: "1026077912834",
    appId: "1:1026077912834:web:8236d3f76cdd8200075c1b",
};

let auth = null, googleProvider = null, db = null;

try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    googleProvider = new firebase.auth.GoogleAuthProvider();
} catch(e) {
    console.error("Lỗi khởi tạo Firebase:", e);
}

// ==========================================
// 2. CẤU HÌNH & HÀM GỌI GEMINI API
// ==========================================
const GEMINI_API_KEY = 'AIzaSyDZW2-cWXU9EPoTInP1YRY9y9t2_pNmWvM';

function getNextApiKey() {
    return GEMINI_API_KEY;
}

// Hàm fetch API Gemini Text cơ bản
async function fetchSpecialAI(promptText, maxRetries = 3, forceJson = true) {
    const payload = { 
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.7 } 
    };
    
    if (forceJson) {
        payload.generationConfig.responseMimeType = "application/json";
    }
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const currentKey = getNextApiKey();
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${currentKey}`;
        
        try {
            const res = await fetch(API_URL, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
            });

            if (res.status === 503 || res.status === 429) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                continue; 
            }

            const data = await res.json();
            if (data.candidates && data.candidates.length > 0) {
                return data.candidates[0].content.parts[0].text;
            }
            return null;
        } catch(e) { 
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                continue;
            }
            return null; 
        }
    }
    return null;
}

// Hàm fetch API Gemini Vision (Xử lý ảnh)
async function callGeminiVision(promptText, base64Data, customTemp = 0.7, forceJson = false) {
    const payload = {
        contents: [{ parts: [{ text: promptText }, { inlineData: { mimeType: "image/jpeg", data: base64Data } }] }],
        generationConfig: { temperature: customTemp }
    };

    if (forceJson) {
        payload.generationConfig.responseMimeType = "application/json";
    }

    for (let attempt = 0; attempt < 3; attempt++) {
        const currentKey = getNextApiKey();
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${currentKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (res.ok) {
                const data = await res.json();
                if (data.candidates && data.candidates.length > 0) return data.candidates[0].content.parts[0].text;
            }
        } catch (e) { console.error("Gemini Vision Error:", e); }
    }
    return null;
}

// ==========================================
// 3. HÀM GỌI OPEN-METEO API (THỜI TIẾT)
// ==========================================
async function getWeatherData(lat = 13.77, lon = 109.22) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max&timezone=Asia%2FBangkok`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Thời tiết phản hồi lỗi!");
    return await res.json();
}
