export default async function handler(req, res) {
  try {
    // Extract the part after /api/coinpaprika
    const externalPath = req.url.split("/api/coinpaprika")[1];
    console.log(
      `Fetching from Coinpaprika: https://api.coinpaprika.com${externalPath}`,
    );
    console.log(
      `reqqqqq`, req.url,
    );
    const response = await fetch(`https://api.coinpaprika.com${externalPath}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in coinpaprika API route:", error);
    res.status(500).send("Error fetching data");
  }
}
