export const config = {
  runtime: "edge"
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Only POST allowed", { status: 405 });
  }

  const { text, tone } = await req.json();

  const SYSTEM_PROMPT = `
Toimit Tilastokeskuksen viestinnän apurina.
Muokkaat annetun sometekstin äänensävyyn, joka on:

- ${tone}

Säilytä faktat ja ydin. Kirjoita suomeksi.
`;

  const payload = {
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text }
    ]
  };

  const openaiRes = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  const data = await openaiRes.json();

  // UUSI RESPONSES-API: poimitaan teksti oikeasta kohdasta
  const outputText =
    data.output?.[0]?.content?.[0]?.text?.trim() ||
    "Ei saatu vastausta.";

  return new Response(
    JSON.stringify({ text: outputText }),
    { headers: { "Content-Type": "application/json" } }
  );
}
