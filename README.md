# X-Rayted 🔍 (also called as LabelScan)
**Scan it before you trust it.**

X-Rayted is a camera-first, AI-powered web application that helps users understand what they are consuming or using by scanning product labels or ingredient lists. Instead of manually researching complex scientific terms, users get instant, explainable insights into product safety.

## Problem

Consumers are often told to “read the label,” but ingredient lists frequently contain scientific or unfamiliar terms. Even educated users struggle to interpret them, and researching each ingredient individually is time-consuming and impractical. As a result, people make decisions with incomplete information or ignore labels altogether.

## 💡 Solution

X-Rayted removes this friction by allowing users to:
- **Scan product labels using the camera**
- **Upload images of ingredient lists**
- Instantly receive a **clear safety assessment**:  
  **Safe**, **Caution**, or **Risk**
- Understand *why* a product may be risky through **ingredient-level explanations**

The system is designed to be **category-agnostic**, working across food, medicine, personal care, and everyday household products — even without barcodes.

## ✨ Key Features

- 📸 **Camera-first scanning** (no barcode dependency)
- 🖼️ **Image upload support**
- 🔄 **Multiple scans & batch uploads**
- 🧠 **AI-powered ingredient analysis**
- 📊 **Explainable risk classification**
- 📂 **Scan history & report storage**
- 📤 **Shareable safety reports**
- ⚠️ **Legal & safety alerts related to brands**
- 📱 **Mobile-first experience**

## How It Works

1. The user scans or uploads an image of a product label or ingredient list.
2. The frontend sends the image to the backend API.
3. **Gemini** analyzes the image using multimodal reasoning to:
   - Extract visible text and context
   - Identify ingredients and product category
   - Assess safety risks
   - Generate structured, explainable insights
4. The backend returns structured results to the frontend.
5. Results are displayed clearly and stored for history and sharing.

##  Tech Stack

### Frontend
- **React** (TypeScript)
- **Vite**
- HTML / CSS
- Web Camera API
- Deployed on **Google Cloud Run**

### Backend
- **Node.js**
- REST APIs
- **Gemini API** for multimodal image analysis
- Persistent storage for scan history
- Deployed on **Google Cloud Run**

### Infrastructure
- **Docker**
- **Google Cloud Build**
- **Google Artifact Registry**

## Project Status

This project was built as a functional prototype and is deployed as a live, containerized web application. It demonstrates a scalable architecture and can be extended to additional categories and features.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
