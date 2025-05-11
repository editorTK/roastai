
'use server';

import type { ClipAnalyzeResponse } from '@/types/clip-types';

const CLIP_API_URL = process.env.CLIP_API_URL || 'http://localhost:8000/analyze';

/**
 * Uploads an image to the CLIP API and gets a roast prompt.
 * @param imageBlob The image blob to analyze.
 * @param filename The filename for the blob in FormData.
 * @param language The language for CLIP analysis.
 * @returns A promise that resolves to the roast prompt.
 */
export async function analyzeImageWithCLIP(imageBlob: Blob, filename: string, language: 'en' | 'es'): Promise<string> {
  const formData = new FormData();
  formData.append('image', imageBlob, filename);
  formData.append('language', language); // Pass language to CLIP API

  try {
    const response = await fetch(CLIP_API_URL, {
      method: 'POST',
      body: formData,
      // Headers like 'Content-Type: multipart/form-data' are usually set automatically by fetch with FormData.
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('CLIP API Error Response:', errorBody);
      throw new Error(`CLIP API request failed with status ${response.status}: ${errorBody}`);
    }

    const data: ClipAnalyzeResponse = await response.json();
    if (!data.roast_prompt) {
        throw new Error('Invalid response structure from CLIP API: roast_prompt missing.');
    }
    return data.roast_prompt;
  } catch (error) {
    console.error('Error calling CLIP API:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to analyze image with CLIP: ${error.message}`);
    }
    throw new Error('Failed to analyze image with CLIP due to an unknown error.');
  }
}
