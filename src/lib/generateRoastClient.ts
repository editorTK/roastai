// lib/generateRoastClient.ts
import Handlebars from 'handlebars';

export type GenerateRoastInput = {
  name: string;
  occupation: string;
  hobbies: string;
  quirks: string;
  extras?: string;
  intensity: number;
  language: 'en' | 'es';
};

export async function generateRoast(input: GenerateRoastInput): Promise<string> {
  const rawPrompts = {
    en: `You are a professional roast comedian. You will generate a roast in English based on the following information:

Name: {{{name}}}
Occupation: {{{occupation}}}
Hobbies: {{{hobbies}}}
Quirks: {{{quirks}}}
{{#if extras}}
Additional Information: {{{extras}}}
{{/if}}

The intensity of the roast should be adjusted based on the intensity level, from 1 (gentle) to 10 (harsh). The current intensity is {{{intensity}}}.

Write a roast that is tailored to the person and their information. The roast should be funny, engaging, and at least 60 words long. Respond in English.`,

    es: `Eres un comediante profesional de roasts. Generarás un roast en español basado en la siguiente información:

Nombre: {{{name}}}
Ocupación: {{{occupation}}}
Pasatiempos: {{{hobbies}}}
Manías: {{{quirks}}}
{{#if extras}}
Información Adicional: {{{extras}}}
{{/if}}

La intensidad del roast debe ajustarse según el nivel de intensidad, de 1 (suave) a 10 (fuerte). La intensidad actual es {{{intensity}}}.

Escribe un roast que se adapte a la persona y su información. El roast debe ser divertido, atractivo y tener mínimo 60 palabras. Responde en español.`,
  };

  const template = Handlebars.compile(rawPrompts[input.language]);
  const prompt = template(input);

  // @ts-ignore porque Puter.js no tiene tipado aún
  const completion = await puter.ai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
  });

  return completion.choices[0].message.content;
                }
