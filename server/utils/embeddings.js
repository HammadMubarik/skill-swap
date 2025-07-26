const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Helper function to get embedding for a skill string
async function getEmbedding(text) {
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
        model: "text-embedding-3-small",
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("OpenAI error:", errorData);
      throw new Error("Failed to fetch embedding from OpenAI");
    }

    const data = await res.json();
    return data.data[0].embedding;
  } catch (err) {
    console.error("Embedding fetch error:", err.message);
    throw err;
  }
}

module.exports = { getEmbedding };
