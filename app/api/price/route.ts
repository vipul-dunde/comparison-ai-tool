import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Types for the API
interface PriceRequest {
  query: string;
  country?: string; // Optional country code (US, IN, UK, CA, AU)
}

interface PriceResult {
  link: string;
  price: number;
  currency: string;
  productName: string;
}

interface CountryInfo {
  country: string;
  currency: string;
  domains: string[];
}

// Country-specific domain mappings
const COUNTRY_DOMAINS: Record<string, CountryInfo> = {
  US: {
    country: 'United States',
    currency: 'USD',
    domains: ['amazon.com', 'ebay.com', 'walmart.com']
  },
  IN: {
    country: 'India',
    currency: 'INR',
    domains: ['amazon.in', 'flipkart.com']
  },
  UK: {
    country: 'United Kingdom',
    currency: 'GBP',
    domains: ['amazon.co.uk', 'ebay.co.uk', 'argos.co.uk']
  },
  CA: {
    country: 'Canada',
    currency: 'CAD',
    domains: ['amazon.ca', 'ebay.ca', 'walmart.ca']
  },
  AU: {
    country: 'Australia',
    currency: 'AUD',
    domains: ['amazon.com.au', 'ebay.com.au', 'catch.com.au']
  }
};

// Initialize OpenAI client function
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Function to search for product prices using OpenAI's web search
async function searchProductPrices(query: string, countryInfo: CountryInfo): Promise<PriceResult[]> {
  try {
    // Create search query with country-specific domains
    const domainsQuery = countryInfo.domains.map(domain => `site:${domain}`).join(' OR ');
    const searchInput = `Find prices for "${query}" on ${domainsQuery}`;

    const client = getOpenAIClient();

    const searchPrompt = `
    You are a web search expert and shopping assistant helping users find the best online prices for specific products in a given country.
    
    - Product to search: "${searchInput}"
    - Country info: ${JSON.stringify(countryInfo)}
    
    Your task:
    1. Use **broad web search** to find this product across **multiple trusted ecommerce platforms, local retailers, and brand websites** specific to the given country.
    2. DO NOT rely only on Amazon or one source — explore other **popular and regionally relevant** platforms (e.g., Flipkart, Croma, TataCliq, Walmart, BestBuy, Newegg, B&H, Reliance Digital, etc., depending on the country).
    3. Match the product **exactly** — including brand, model, version, and storage/specs. Avoid similar or related variants.
    4. Extract **only actual product page links** (not blog posts, search result pages, or generic category links).
    5. Each listing must include clear pricing in the **local currency**, and be available for purchase from a **reputable seller**.
    
    Return 5–10 results sorted by **ascending price**.
    Each result should include:
    - Product Name (as per listing)
    - Price
    - Currency
    - Direct URL (fully qualified link to the exact product page)
    - Seller or Website Name
    
    Search results must be specific to the selected country. Accuracy and relevance are more important than quantity. Prioritize **trustworthiness, correct product match, and diverse sources across the web**.
    `;
    
const webResponse = await client.responses.create({
  model: "gpt-4o-mini",
  input: searchPrompt,
  tools: [{ type: "web_search_preview" }]
});

if (!webResponse.output_text) throw new Error("No search results received.");
console.log("\n\n--------------------------------");
console.log("Web response\n", webResponse.output_text);
console.log("--------------------------------\n\n");

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: `You are a price comparison assistant. Match exactly and extract prices. Input:\n\n${webResponse.output_text}`
    },
    { role: "user", content: searchInput }
  ],
  tools: [
    {
      type: "function",
      function: {
        name: "extract_prices",
        description: "Extract price info from search results",
        parameters: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  link: { type: "string" },
                  price: { type: "number" },
                  currency: { type: "string" },
                  productName: { type: "string" }
                },
                required: ["link", "price", "currency", "productName"]
              }
            }
          },
          required: ["results"]
        }
      }
    }
  ],
  tool_choice: {
    type: "function",
    function: { name: "extract_prices" }
  }
});


    console.log("\n\n--------------------------------");
    console.log("OpenAI response\n", response);
    console.log("--------------------------------\n\n");

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return [];
    }

    const priceData = JSON.parse(toolCall.function.arguments);
    const results = priceData.results || [];

    // Ensure currency matches the country if not specified
    return results.map((result: PriceResult) => ({
      ...result,
      currency: result.currency || countryInfo.currency
    }));

  } catch (error) {
    console.error('OpenAI search failed:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PriceRequest = await request.json();
    const { query, country } = body;

    // Use user-provided country or default to US
    const countryCode = country && COUNTRY_DOMAINS[country.toUpperCase()] 
      ? country.toUpperCase() 
      : 'US';

    console.log("\n\n--------------------------------");
    console.log("countryCode", countryCode);
    console.log("--------------------------------\n\n");

    const countryInfo = COUNTRY_DOMAINS[countryCode];

    console.log("\n\n--------------------------------");
    console.log("countryInfo", countryInfo);
    console.log("--------------------------------\n\n");
    
    if (!countryInfo) {
      return NextResponse.json(
        { error: `Unsupported country: ${countryCode}. Supported countries: ${Object.keys(COUNTRY_DOMAINS).join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`Searching for "${query}" in ${countryInfo.country} (${countryCode})`);

      // Validate required environment variables
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'Missing required environment variables' },
          { status: 500 }
        );
      }

    // Search for product prices using OpenAI
    const prices = await searchProductPrices(query, countryInfo);

    console.log("\n\n--------------------------------");
    console.log("prices", prices);
    console.log("--------------------------------\n\n");
    
    // Sort by price (ascending)
    const sortedPrices = prices.sort((a: PriceResult, b: PriceResult) => a.price - b.price);

    return NextResponse.json({
      country: countryInfo.country,
      countryCode: countryCode,
      currency: countryInfo.currency,
      results: sortedPrices
    });

  } catch (error) {
    console.error('Price comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
} 
