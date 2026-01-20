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

  return new Response(
    JSON.stringify({
      text:
        data.output_text ||
        data.choices?.[0]?.message?.content?.trim() ||
        "Ei saatu vastausta."
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
