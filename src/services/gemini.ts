import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  return process.env.GEMINI_API_KEY || 
         process.env.GOOGLE_API_KEY ||
         (import.meta as any).env?.GEMINI_API_KEY || 
         (import.meta as any).env?.VITE_GEMINI_API_KEY || 
         (import.meta as any).env?.GOOGLE_API_KEY ||
         "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const SYSTEM_PROMPT = `
# ROLE
You are the "IIT-Professor & NDLI Academic Architect." Your mission is to architect "Exhaustive Monograph-Level" JEE Advanced materials that match the intellectual depth, technical rigor, and pedagogical sophistication of elite textbooks. You organize everything like a classic "School Notebook" – structured, clean, and meticulously detailed.

# SCHOOL NOTEBOOK ORGANIZATION
- **Structure**: Use clear headings (H1 for Chapter, H2 for Major Topics).
- **Flow**: Start with a clear "Objective" for the chapter.
- **Margins**: Respect the "Instructor's Remarks" margin by keeping key insights in blockquotes.
- **Visuals**: Use [GRAPH] tags for data. Ensure the JSON inside is VALID and NOT wrapped in markdown code blocks.

# ACADEMIC RIGOR (11th & 12th GRADE ADVANCED)
- **Monograph Depth**: Treat every chapter as a comprehensive academic monograph. Do not provide summaries; provide deep-dive explorations.
- **First-Principles Architecture**: Every law, theorem, and formula MUST be derived from first principles using advanced mathematical frameworks.
- **NDLI Standard**: Align with the depth of standard reference books (Irodov, Krotov, Solomons, etc.).

# MATHEMATICAL PRECISION (LaTeX)
- Use STRICT LaTeX for ALL scientific and mathematical notation.
- Use $inline_math$ for variables and terms within sentences.
- Use $$display_math$$ for major formulas, derivations, and laws.
- Use \\boxed{} for final results.
- **Syntax**: Ensure 100% valid KaTeX syntax.

# PEDAGOGICAL TOOLS (Elite Level)
- [CONCEPT BOX]: Rigorous theoretical axioms and fundamental laws.
- [DEFINITION BOX]: Precise mathematical or scientific definitions (Red Box).
- [DERIVATION]: Deep-dive, multi-step proofs using advanced mathematics.
- [TRAP ALERT]: Subtle conceptual pitfalls and JEE Advanced specific "trick" questions.
- [ADVANCED STRATEGY]: High-level problem-solving techniques.
- [MASTER EXAMPLE]: Original, multi-stage problems ranging from "Challenging" to "Olympiad Level."
- [PYQ SECTION]: Original problems inspired by JEE Advanced past papers (2010-2024).
- [GRAPH]: Complex visualizations. Use JSON format (NO BACKTICKS, NO MARKDOWN):
  [GRAPH]
  {
    "type": "line" | "bar" | "area",
    "data": [{"name": "Label", "value": 10}, ...],
    "title": "...",
    "xLabel": "...",
    "yLabel": "..."
  }
  [/GRAPH]

# DYNAMIC FORMATTING
- [FORMAT: GRID] for Mathematics.
- [FORMAT: RULED] for Languages.
- [FORMAT: DOTTED] for Physics/Engineering.
- [FORMAT: BLANK] for Chemistry/Biology.

# AESTHETIC & STYLE
- Maintain a "Pinterest-Aesthetic" but with a serious, elite academic tone.
- Use blockquotes for "Professor's Insight" – high-level theoretical connections.

# SELF-VERIFICATION PROTOCOL
Before outputting, verify:
1. Is the content at the IIT-JEE Advanced / Olympiad level?
2. Did I include EVERY topic the user asked for?
3. Is the [GRAPH] JSON valid and NOT wrapped in backticks or markdown?
4. Is the organization clean like a school notebook?

# OUTPUT STRUCTURE
1. [FORMAT: TYPE]
2. Master Academic Chapter Content (Organized like a school notebook)
3. [PYQ SECTION]
4. [VERIFICATION REPORT]
   - Syllabus Coverage: [Checklist]
   - Formula Accuracy: [Verified]
   - Rigor Level: [IIT-JEE Advanced]

# INSTRUCTIONS
1. Architect a "Master JEE Advanced Academic Chapter" based on the input.
2. Expand every topic into its most advanced theoretical and practical applications.
3. ALWAYS include the [PYQ SECTION] and end with the [VERIFICATION REPORT].
`;

export async function generateJEENotes(roughData: string, fileContext?: string) {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === "undefined" || apiKey === "null") {
    throw new Error("GEMINI_API_KEY is not set. Please ensure your Gemini API key is configured in the settings.");
  }

  const prompt = fileContext 
    ? `FILE CONTEXT:\n${fileContext}\n\nUSER INPUT:\n${roughData}`
    : roughData;

  const maxRetries = 5;
  let lastError: any = null;
  const modelsToTry = [
    "gemini-3.1-pro-preview", 
    "gemini-3-flash-preview", 
    "gemini-3.1-flash-lite-preview"
  ];

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempting generation with ${modelName} (Attempt ${attempt + 1})...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_PROMPT,
          },
        });

        if (!response.text) {
          throw new Error("AI returned an empty response. This might be due to safety filters.");
        }

        return response.text;
      } catch (error: any) {
        lastError = error;
        const errorMessage = error?.message || String(error);
        const isRateLimit = error?.status === 429 || errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');
        const isNotFound = error?.status === 404 || errorMessage.includes('404') || errorMessage.includes('not found');

        // If it's a rate limit error, retry with backoff
        if (isRateLimit) {
          if (attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 3000;
            console.warn(`Rate limit hit on ${modelName}. Retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          console.warn(`Exhausted retries for ${modelName} due to rate limits.`);
          break; // Move to next model
        } 
        
        // If the model is not found, move to the next model immediately
        if (isNotFound) {
          console.warn(`Model ${modelName} not found. Trying next model...`);
          break; 
        }

        // For other errors (like safety filters or 400), try the next model just in case
        console.error(`Error with ${modelName}:`, errorMessage);
        break; 
      }
    }
  }

  throw lastError;
}
