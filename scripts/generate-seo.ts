import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const prisma = new PrismaClient();

function getCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable");
  return JSON.parse(raw);
}

const creds = getCredentials();
const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT || creds.project_id,
  location: "global",
  googleAuthOptions: {
    credentials: {
      client_email: creds.client_email,
      private_key: creds.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  },
});

const TOPICS = [
  "Co oznacza błąd P0300 w BMW E46 i jak go naprawić?",
  "Błąd P0171 - zbyt uboga mieszanka. Przyczyny i rozwiązania",
  "Dlaczego świeci się kontrolka Check Engine? Najczęstsze powody",
  "Metaliczny stukot w silniku diesla na zimno - diagnoza",
  "Dymienie z rury wydechowej na niebiesko - co to oznacza?"
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, match => {
      const map: Record<string, string> = { 'ą':'a', 'ć':'c', 'ę':'e', 'ł':'l', 'ń':'n', 'ó':'o', 'ś':'s', 'ź':'z', 'ż':'z' };
      return map[match] || match;
    })
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const SYSTEM_PROMPT = `Jesteś ekspertem motoryzacyjnym, doświadczonym mechanikiem.
Otrzymujesz temat/słowo kluczowe z zakresu problemów z samochodem (np. kod błędu OBD). 
Twoim zadaniem jest napisanie wyczerpującego, merytorycznego i pomocnego artykułu eksperckiego dla kierowcy. 
Artykuł ma pomóc zdiagnozować problem i wskazać możliwe rozwiązania. 
Zadbaj o doskonałe formatowanie Markdown: użyj nagłówków ## i ###, wypunktowań i pogrubień. 
Bądź profesjonalny, wzbudź zaufanie. Zwracaj się do czytelnika przyjaźnie, z empatią wobec jego problemu z samochodem.
Nie dodawaj tytułu artykułu jako pierwszego nagłówka H1 (My dodamy go w kodzie). Zacznij od razu od merytorycznego wstępu.`;

async function generateArticle(topic: string) {
  console.log(`\nGenerating article for: "${topic}"...`);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using 2.5-flash or 3.5-flash depending on vertex availability
      contents: topic,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });

    const content = response.text;
    
    if (!content) {
      throw new Error("Empty response from the model.");
    }

    const slug = generateSlug(topic);

    console.log(`Saving article to database with slug: ${slug}`);
    
    await prisma.seoArticle.upsert({
      where: { slug },
      update: {
        title: topic,
        content: content,
      },
      create: {
        slug,
        title: topic,
        content: content,
      }
    });
    
    console.log(`Successfully generated and saved: ${topic}`);
    
  } catch (error) {
    console.error(`Error generating article for topic: ${topic}`, error);
  }
}

async function main() {
  console.log("Starting SEO Article generation...");
  
  for (const topic of TOPICS) {
    await generateArticle(topic);
    // Add a delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log("\nFinished generating all articles!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
