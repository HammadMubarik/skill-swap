const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getEmbedding(text) {
  const res = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: text,
  });
  return res.data.data[0].embedding;
}

module.exports = { getEmbedding };
