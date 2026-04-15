# EduReport GH 🎓
**Ghana SBA & Terminal Report System — Official GES Format**

A free tool for Ghanaian teachers (Lower Primary, Upper Primary, JHS) to:
- Enter SBA scores (4 tasks × 15 marks) and exam scores
- Auto-scale, grade, and rank students per GES/NaCCA standards
- Generate AI-written remarks for every student
- Print official GES-format terminal report cards

---

## 🚀 Deploy in 10 Minutes

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Add your API key (local only)
Create a `.env` file in the project root:
```
CLAUDE_API_KEY=sk-ant-your-real-key-here
```
> ⚠️ This file is in `.gitignore` — it will NEVER be pushed to GitHub.

### Step 3 — Test locally
```bash
npm run dev
```
Open `http://localhost:5173` — the app should run fully.

> **Note on local AI remarks:** The `/api/generate` proxy only runs on Vercel.
> Locally, the app uses smart fallback remarks automatically. All grading works perfectly offline.

### Step 4 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial EduReport GH deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/edureport-gh.git
git push -u origin main
```

### Step 5 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Import your `edureport-gh` repository
4. Under **Environment Variables**, add:
   - **Name:** `CLAUDE_API_KEY`
   - **Value:** `sk-ant-your-real-api-key`
5. Click **Deploy**

✅ You get a live link like `https://edureport-gh.vercel.app`

---

## 📲 Share with Teachers
Send this message to your teacher WhatsApp groups:
> "Free tool for Ghanaian teachers — enter your SBA and exam scores, it automatically grades, ranks students, generates AI remarks, and prints the official GES report card. Try it: [your-vercel-link]"

---

## 📁 Project Structure
```
edureport-gh/
├── api/
│   └── generate.js        ← Secure Vercel serverless proxy (hides API key)
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx             ← Full application (6-step wizard + report cards)
│   ├── main.jsx
│   └── index.css
├── .env.example            ← Template — copy to .env and add your key
├── .gitignore              ← Keeps .env and node_modules out of GitHub
├── index.html
├── package.json
├── vercel.json             ← Vercel routing config
└── vite.config.js
```

---

## 🔐 Security
- The Claude API key lives **only on Vercel** as an environment variable
- The frontend calls `/api/generate` (your own server), never Anthropic directly
- Students' data never leaves the user's browser session

---

## 🇬🇭 GES Alignment
- SBA scaled: (raw /60) × 50
- Exam scaled: (raw /100) × 50
- Total: 50:50 combination (out of 100)
- Grades: L1 Advance (≥80%) through L6 Below Standard (<50%)
- Report card columns match official GES format exactly
