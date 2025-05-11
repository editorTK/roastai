
'use server';
/**
 * @fileOverview Generates a personalized roast based on user-provided information.
 *
 * - generateRoast - A function that generates the roast.
 * - GenerateRoastInput - The input type for the generateRoast function.
 * - GenerateRoastOutput - The return type for the generateRoast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import Handlebars from 'handlebars';

const GenerateRoastInputSchema = z.object({
  name: z.string().describe('The name of the person to roast.'),
  occupation: z.string().describe('The occupation of the person to roast.'),
  hobbies: z.string().describe('The hobbies of the person to roast.'),
  quirks: z.string().describe('Any quirks or unusual habits of the person to roast.'),
  extras: z.string().optional().describe('Any additional details or anecdotes about the person to make the roast more specific and complete.'),
  intensity: z
    .number()
    .min(1)
    .max(10)
    .default(5)
    .describe('The intensity of the roast, from 1 (gentle) to 10 (harsh).'),
  language: z.enum(['en', 'es']).default('en').describe('The language for the roast (en or es).'),
});
export type GenerateRoastInput = z.infer<typeof GenerateRoastInputSchema>;

const GenerateRoastOutputSchema = z.object({
  roast: z.string().describe('The generated roast.'),
});
export type GenerateRoastOutput = z.infer<typeof GenerateRoastOutputSchema>;

export async function generateRoast(input: GenerateRoastInput): Promise<GenerateRoastOutput> {
  return generateRoastFlow(input);
}

const rawPrompts = {
  en: `You are a professional roast comedian. You will generate a roast in English based on the following information about the person:

Name: {{{name}}}
Occupation: {{{occupation}}}
Hobbies: {{{hobbies}}}
Quirks: {{{quirks}}}
{{#if extras}}
Additional Information: {{{extras}}}
{{/if}}

The intensity of the roast should be adjusted based on the intensity level, from 1 (gentle) to 10 (harsh). The current intensity is {{{intensity}}}.

Write a roast that is tailored to the person and their information. The roast should be funny, engaging, and deliver a humorous critique. The roast must be at least 60 words long. Respond in English.
`,
  es: `Eres un comediante profesional de roasts. Generarás un roast en español basado en la siguiente información sobre la persona:

Nombre: {{{name}}}
Ocupación: {{{occupation}}}
Pasatiempos: {{{hobbies}}}
Manías: {{{quirks}}}
{{#if extras}}
Información Adicional: {{{extras}}}
{{/if}}

La intensidad del roast debe ajustarse según el nivel de intensidad, de 1 (suave) a 10 (fuerte). La intensidad actual es {{{intensity}}}.

Escribe un roast que se adapte a la persona y su información. El roast debe ser divertido, atractivo y ofrecer una crítica humorística. El roast debe tener un mínimo de 60 palabras. Responde en español.
`,
};

// Compile templates once at module load
const compiledTemplates = {
  en: Handlebars.compile(rawPrompts.en),
  es: Handlebars.compile(rawPrompts.es),
};

const generateRoastPrompt = ai.definePrompt({
  name: 'generateRoastPrompt',
  input: {schema: GenerateRoastInputSchema},
  output: {schema: GenerateRoastOutputSchema},
  prompt: (input: GenerateRoastInput) => {
    const selectedCompiledTemplate = compiledTemplates[input.language];
    return selectedCompiledTemplate(input); 
  },
});


const generateRoastFlow = ai.defineFlow(
  {
    name: 'generateRoastFlow',
    inputSchema: GenerateRoastInputSchema,
    outputSchema: GenerateRoastOutputSchema,
  },
  async input => {
    const {output} = await generateRoastPrompt(input);
    return output!;
  }
);

