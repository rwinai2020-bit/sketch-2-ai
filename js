export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { image } = req.body;
  const replicateApiKey = process.env.REPLICATE_API_KEY;

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${replicateApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      version: "c508e1f3c806... (isi dengan versi model ControlNet-scribble)",
      input: {
        prompt: "a digital painting of a cute futuristic school building, Pixar style",
        image: image,
      }
    })
  });

  const json = await response.json();

  // Poll status
  const getResult = async () => {
    const status = await fetch(`https://api.replicate.com/v1/predictions/${json.id}`, {
      headers: { Authorization: `Token ${replicateApiKey}` }
    });
    const statusJson = await status.json();
    if (statusJson.status === "succeeded") return statusJson.output[0];
    if (statusJson.status === "failed") return null;
    await new Promise(r => setTimeout(r, 3000));
    return await getResult();
  };

  const outputUrl = await getResult();
  if (outputUrl) res.json({ output: outputUrl });
  else res.status(500).json({ error: "Failed to generate" });
}
