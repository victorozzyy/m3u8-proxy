const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("URL obrigatória: /proxy?url=...");

  try {
    const response = await axios({
      method: "get",
      url: targetUrl,
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "http://example.com"
      }
    });
    res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");
    response.data.pipe(res);
  } catch (err) {
    console.error("Erro ao redirecionar:", err.message);
    res.status(500).send("Erro ao acessar o stream");
  }
});

app.listen(PORT, () => console.log(`✅ Proxy rodando na porta ${PORT}`));
