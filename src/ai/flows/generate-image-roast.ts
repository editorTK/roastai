
'use server';
/**
 * @fileOverview Generates a personalized roast based on an uploaded image.
 * It can use a Python-based CLIP service for image analysis if enabled,
 * otherwise, it uses simulated analysis.
 *
 * - generateImageRoast - A function that generates the roast from an image.
 * - GenerateImageRoastInput - The input type for the generateImageRoast function.
 * - GenerateImageRoastOutput - The return type for the generateImageRoast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import Handlebars from 'handlebars';
import { analyzeImageWithCLIP } from '@/services/clip-service';

// Determine if CLIP integration is enabled via environment variable
const CLIP_ENABLED = process.env.NEXT_PUBLIC_CLIP_ENABLED === 'true';

const GenerateImageRoastInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo/image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  intensity: z
    .number()
    .min(1)
    .max(10)
    .default(5)
    .describe('The intensity of the roast, from 1 (gentle) to 10 (harsh).'),
  language: z.enum(['en', 'es']).default('en').describe('The language for the roast (en or es).'),
  acceptTerms: z.boolean().describe('Indicates if the user accepted the terms and conditions.'),
});
export type GenerateImageRoastInput = z.infer<typeof GenerateImageRoastInputSchema>;

const GenerateImageRoastOutputSchema = z.object({
  roast: z.string().describe('The generated roast based on the image.'),
});
export type GenerateImageRoastOutput = z.infer<typeof GenerateImageRoastOutputSchema>;


export async function generateImageRoast(input: GenerateImageRoastInput): Promise<GenerateImageRoastOutput> {
  // Manual validation for acceptTerms
  if (input.acceptTerms !== true) {
    // This error message can be enhanced with i18n if needed, similar to client-side.
    const errorMessage = input.language === 'es' 
      ? "Debes aceptar los términos y condiciones para generar un roast de imagen." 
      : "You must accept the terms and conditions to generate an image roast.";
    throw new Error(errorMessage);
  }
  return generateImageRoastFlow(input);
}

// Helper function to convert Data URI to Blob and extract filename
// This needs to run on the server, hence using Buffer.
function dataURItoBlob(dataURI: string): { blob: Blob, filename: string, mimeType: string } {
  const parts = dataURI.split(',');
  if (parts.length !== 2) {
    throw new Error('Invalid Data URI format');
  }
  const metaPart = parts[0]; // e.g., "data:image/jpeg;base64"
  const base64Data = parts[1];

  const mimeMatch = metaPart.match(/:(.*?);/);
  if (!mimeMatch || mimeMatch.length < 2) {
    throw new Error('Could not extract MIME type from Data URI');
  }
  const mimeType = mimeMatch[1]; // e.g., "image/jpeg"
  
  const byteString = Buffer.from(base64Data, 'base64');
  const blob = new Blob([byteString], { type: mimeType });
  
  const extension = mimeType.split('/')[1] || 'bin';
  const filename = `image.${extension}`;

  return { blob, filename, mimeType };
}


const simulateClipAnalysis = (lang: 'en' | 'es'): string => {
  const keywords_en = ["a generic selfie", "someone trying to look cool", "a person posing with questionable fashion sense", "an attempt at being an influencer", "a low-quality snapshot"];
  const keywords_es = ["un selfie genérico", "alguien intentando parecer guay", "una persona posando con un sentido de la moda cuestionable", "un intento de ser influencer", "una instantánea de baja calidad"];
  
  const selectedKeywords = lang === 'es' ? keywords_es : keywords_en;
  const randomKeyword = selectedKeywords[Math.floor(Math.random() * selectedKeywords.length)];

  if (lang === 'es') {
    return `La imagen parece ser de ${randomKeyword}. Basándonos en esto, el sujeto podría ser un poco predecible o estar esforzándose demasiado.`;
  }
  return `The image appears to be of ${randomKeyword}. Based on this, the subject might be a bit predictable or trying too hard.`;
};


const rawPrompts = {
  en: `You are a professional roast comedian. You will generate a roast in English based on an analysis of the provided image and the user's desired intensity.
The image has been analyzed and the following was noted: {{{imageAnalysisContext}}}

Image: {{media url=imageDataUri}}

The intensity of the roast should be adjusted based on the intensity level, from 1 (gentle) to 10 (harsh). The current intensity is {{{intensity}}}.

Write a roast that is tailored to the image's content and the analysis. The roast should be funny, engaging, and deliver a humorous critique. The roast must be at least 60 words long. Respond in English.
`,
  es: `Eres un comediante profesional de roasts. Generarás un roast en español basado en un análisis de la imagen proporcionada y la intensidad deseada por el usuario.
La imagen ha sido analizada y se ha observado lo siguiente: {{{imageAnalysisContext}}}

Imagen: {{media url=imageDataUri}}

La intensidad del roast debe ajustarse según el nivel de intensidad, de 1 (suave) a 10 (fuerte). La intensidad actual es {{{intensity}}}.

Escribe un roast que se adapte al contenido de la imagen y al análisis. El roast debe ser divertido, atractivo y ofrecer una crítica humorística. El roast debe tener un mínimo de 60 palabras. Responde en español.
`,
};

const compiledTemplates = {
  en: Handlebars.compile(rawPrompts.en),
  es: Handlebars.compile(rawPrompts.es),
};

// Define an extended schema type for internal use by the prompt
type ExtendedGenerateImageRoastInput = GenerateImageRoastInput & { imageAnalysisContext: string };
const ExtendedGenerateImageRoastInputSchema = GenerateImageRoastInputSchema.extend({
  imageAnalysisContext: z.string().describe('Contextual information derived from image analysis.')
});


const generateImageRoastPrompt = ai.definePrompt({
  name: 'generateImageRoastPrompt',
  input: { schema: ExtendedGenerateImageRoastInputSchema },
  output: { schema: GenerateImageRoastOutputSchema },
  prompt: (input: ExtendedGenerateImageRoastInput) => {
    const selectedCompiledTemplate = compiledTemplates[input.language];
    return selectedCompiledTemplate(input);
  },
});

const generateImageRoastFlow = ai.defineFlow(
  {
    name: 'generateImageRoastFlow',
    inputSchema: GenerateImageRoastInputSchema,
    outputSchema: GenerateImageRoastOutputSchema,
  },
  async (input) => {
    let imageAnalysisForPrompt: string;

    if (CLIP_ENABLED && input.imageDataUri) {
      try {
        const { blob, filename } = dataURItoBlob(input.imageDataUri);
        imageAnalysisForPrompt = await analyzeImageWithCLIP(blob, filename, input.language);
      } catch (clipError) {
        console.error("CLIP analysis failed, falling back to simulation:", clipError);
        // Fallback to simulated analysis if CLIP fails
        imageAnalysisForPrompt = `CLIP analysis attempt failed. Falling back to simulated analysis: ${simulateClipAnalysis(input.language)}`;
      }
    } else {
      imageAnalysisForPrompt = simulateClipAnalysis(input.language);
    }
    
    const extendedInput: ExtendedGenerateImageRoastInput = { ...input, imageAnalysisContext: imageAnalysisForPrompt };
    const { output } = await generateImageRoastPrompt(extendedInput);
    return output!;
  }
);
