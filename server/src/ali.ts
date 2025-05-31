import Together from "together-ai";
import "dotenv/config";

const run = async () => {
  console.log("Starting Together AI example...");
  console.log("API Key:", process.env.TOGETHER_AI_API_KEY);
  const together = new Together({
    apiKey: process.env.TOGETHER_AI_API_KEY,
  });

  try {
    console.log("Starting Together AI example...");

    const response = await together.completions.create({
      model: "meta-llama/Meta-Llama-3-8B-Instruct-Lite",
      prompt: "Write a short story about a robot.",
      stream: true,
    });

    // Stream the response
    for await (const chunk of response) {
      const text = chunk.choices[0]?.text || "";
      process.stdout.write(text); // Print streaming output
    }
  } catch (error) {
    console.error("Error calling Together AI:", error);
  }
};

run();
