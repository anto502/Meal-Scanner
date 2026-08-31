const MODEL = 'gemini-2.0-flash';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const PROMPT = `Analyze this food photo. Return ONLY valid JSON with no markdown fences and no extra text, in exactly this shape:
{"items":[{"name":"food name","portion_estimate":"e.g. 1 cup / 150 g","calories":0,"protein_g":0,"carbs_g":0,"fat_g":0}],"total_calories":0,"confidence":"high|medium|low"}
If the portion size is unclear, assume an average adult portion. Identify each distinct food item separately.`;

export async function scanMeal(apiKey, base64Image) {
  const res = await fetch(`${URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: 'image/jpeg', data: base64Image } }] }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return parseJson(raw);
}

function parseJson(raw) {
  const text = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(text);
  } catch (e) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) return JSON.parse(text.slice(start, end + 1));
    throw new Error('AI response could not be read. Try another photo.');
  }
}
