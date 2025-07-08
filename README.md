# Price Comparison Tool

A web application that compares product prices across multiple e-commerce websites.

## How to Run

### Prerequisites
- Node.js (v18 or higher)
- OpenAI API Key

### Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Go to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

### Sample Curl

```curl
curl --location 'https://comparison-ai-tool.vercel.app/api/price' \
--header 'Content-Type: application/json' \
--data '{"query":"Nothing Phone (3A)","country":"US"}'
```

### Find Audio-Video Working proofs here
https://drive.google.com/drive/folders/1PTkxRXP2q8eH9gJeZy-cXCd-lY8ogvr7
