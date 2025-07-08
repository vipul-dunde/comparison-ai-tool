# Price Comparison Tool Demo

## Quick Start Guide

### 1. Setup Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Edit `.env.local` with your actual API key:

```bash
OPENAI_API_KEY=sk-your-openai-key-here
```

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Test the Web Interface

1. Open your browser to `http://localhost:3000`
2. Enter a product query (e.g., "iPhone 16 Pro, 128GB")
3. Click "Search Prices"
4. Your country will be auto-detected and displayed

### 4. Test the API Directly

#### iPhone Search
```bash
curl -X POST http://localhost:3000/api/price \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 16 Pro, 128GB"
  }'
```

#### Headphones Search
```bash
curl -X POST http://localhost:3000/api/price \
  -H "Content-Type: application/json" \
  -d '{
    "query": "boAt Airdopes 311 Pro"
  }'
```

## Expected API Response

```json
{
  "country": "United States",
  "countryCode": "US",
  "currency": "USD",
  "results": [
    {
      "link": "https://www.amazon.com/apple-iphone-16-pro/dp/B0CHX1W5Y9",
      "price": 999.99,
      "currency": "USD",
      "productName": "Apple iPhone 16 Pro 128GB Natural Titanium"
    },
    {
      "link": "https://www.ebay.com/itm/apple-iphone-16-pro-128gb",
      "price": 1049.99,
      "currency": "USD",
      "productName": "Apple iPhone 16 Pro 128GB - Factory Unlocked"
    },
    {
      "link": "https://www.walmart.com/ip/Apple-iPhone-16-Pro-128GB/123456789",
      "price": 1099.99,
      "currency": "USD",
      "productName": "Apple iPhone 16 Pro, 128GB, Natural Titanium"
    }
  ]
}
```

## How It Works

1. **User Input**: Product query only
2. **Country Detection**: Auto-detects user's country from IP address
3. **AI Web Search**: OpenAI performs intelligent web search across relevant retailers
4. **AI Price Extraction**: OpenAI extracts structured price data
5. **Price Sorting**: Results sorted by price (lowest first)
6. **Formatted Response**: Clean, structured JSON response with country info

## Supported Countries & Domains

- **US**: Amazon.com, eBay.com, Walmart.com
- **India**: Amazon.in, Flipkart.com
- **UK**: Amazon.co.uk, eBay.co.uk, Argos.co.uk
- **Canada**: Amazon.ca, eBay.ca, Walmart.ca
- **Australia**: Amazon.com.au, eBay.com.au, Catch.com.au

## Error Handling

The tool handles various error scenarios:

- Unsupported country detection
- Missing API keys
- OpenAI API failures
- Price extraction errors
- Network timeouts
- IP geolocation failures

## Performance Notes

- OpenAI web search provides comprehensive results
- AI-powered matching ensures relevance
- Automatic country detection for faster UX
- Graceful degradation if detection fails
- Comprehensive error reporting

## Next Steps

1. **Add More Countries**: Extend `COUNTRY_DOMAINS` mapping
2. **Add More Retailers**: Include additional e-commerce sites
3. **Implement Caching**: Cache results for frequently searched items
4. **Add Filters**: Price range, ratings, availability filters
5. **Historical Data**: Track price changes over time 