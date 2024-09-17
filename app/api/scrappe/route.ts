import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScrapeResponse {
  success: boolean;
  content?: string;
  error?: string;
}

// Web scraping logic with error handling
async function scrapeWebsite(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);

    // Remove unwanted tags
    $('script, style').remove();

    // Clean the text
    const rawText = $('body').text().replace(/\s+/g, ' ').trim();

    return rawText;
  } catch (error) {
    console.error('Error scraping website:', error.message);
    return null;
  }
}

// Define the POST handler for the scrape API
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    const content = await scrapeWebsite(url);

    if (content) {
      return NextResponse.json({ success: true, content }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: 'Failed to scrape website' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
