
'use server';
/**
 * @fileOverview Generates a personalized roast based on user-provided social media information.
 *
 * - generateSocialRoast - A function that generates the roast.
 * - GenerateSocialRoastInput - The input type for the generateSocialRoast function.
 * - GenerateSocialRoastOutput - The return type for the generateSocialRoast function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';
import Handlebars from 'handlebars';

const GenerateSocialRoastInputSchema = z.object({
  platform: z.string().describe('The social media platform (e.g., Instagram, Twitter, TikTok).'),
  username: z.string().describe('The username on the social media platform.'),
  biography: z.string().describe('The biography from the social media profile.'),
  intensity: z
    .number()
    .min(1)
    .max(10)
    .default(5)
    .describe('The intensity of the roast, from 1 (gentle) to 10 (harsh).'),
  language: z.enum(['en', 'es']).default('en').describe('The language for the roast (en or es).'),
});
export type GenerateSocialRoastInput = z.infer<typeof GenerateSocialRoastInputSchema>;

// Output schema is the same as the general roast
const GenerateSocialRoastOutputSchema = z.object({
  roast: z.string().describe('The generated roast.'),
});
export type GenerateSocialRoastOutput = z.infer<typeof GenerateSocialRoastOutputSchema>;

export async function generateSocialRoast(input: GenerateSocialRoastInput): Promise<GenerateSocialRoastOutput> {
  return generateSocialRoastFlow(input);
}

const rawPrompts = {
  en: `You are a professional roast comedian. You will generate a roast in English based on the following social media profile information:

Platform: {{{platform}}}
Username: {{{username}}}
Biography: {{{biography}}}

The intensity of the roast should be adjusted based on the intensity level, from 1 (gentle) to 10 (harsh). The current intensity is {{{intensity}}}.

Write a roast that is tailored to the person's social media persona. Consider common stereotypes associated with the platform if relevant, but focus on the provided username and biography. The roast should be funny, engaging, and deliver a humorous critique. The roast must be at least 60 words long. Respond in English.
`,
  es: `Eres un comediante profesional de roasts. Generarás un roast en español basado en la siguiente información del perfil de redes sociales:

Plataforma: {{{platform}}}
Nombre de usuario: {{{username}}}
Biografía: {{{biography}}}

La intensidad del roast debe ajustarse según el nivel de intensidad, de 1 (suave) a 10 (fuerte). La intensidad actual es {{{intensity}}}.

Escribe un roast que se adapte a la persona y su perfil en redes sociales. Considera los estereotipos comunes asociados con la plataforma si es relevante, pero céntrate en el nombre de usuario y la biografía proporcionados. El roast debe ser divertido, atractivo y ofrecer una crítica humorística. El roast debe tener un mínimo de 60 palabras. Responde en español.
`,
};

// Compile templates once at module load
const compiledTemplates = {
  en: Handlebars.compile(rawPrompts.en),
  es: Handlebars.compile(rawPrompts.es),
};

const generateSocialRoastPrompt = ai.definePrompt({
  name: 'generateSocialRoastPrompt',
  input: {schema: GenerateSocialRoastInputSchema},
  output: {schema: GenerateSocialRoastOutputSchema},
  prompt: (input: GenerateSocialRoastInput) => {
    const selectedCompiledTemplate = compiledTemplates[input.language];
    return selectedCompiledTemplate(input);
  },
});

const generateSocialRoastFlow = ai.defineFlow(
  {
    name: 'generateSocialRoastFlow',
    inputSchema: GenerateSocialRoastInputSchema,
    outputSchema: GenerateSocialRoastOutputSchema,
  },
  async input => {
    const {output} = await generateSocialRoastPrompt(input);
    return output!;
  }
);
