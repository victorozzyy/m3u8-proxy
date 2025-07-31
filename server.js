const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;
const outputDir = path.join(__dirname, "output");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

app.use("/output", express.static(outputDir));

app.get("/hls", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("URL obrigatória: ?url=http://...");

  const outputPath = path.join(outputDir, "playlist.m3u8");

  // Limpa antes
  fs.readdirSync(outputDir).forEach(file => fs.unlinkSync(path.join(outputDir, file)));

  const ffmpegArgs = [
    "-i", url,
    "-c:v", "copy",
    "-c:a", "aac",
    "-f", "hls",
    "-hls_time", "10",
    "-hls_list_size", "5",
    "-hls_flags", "delete_segments",
    outputPath
  ];

  const ffmpeg = spawn("ffmpeg", ffmpegArgs);

  ffmpeg.stderr.on("data", data => {
    console.log("[FFmpeg]", data.toString());
  });

  ffmpeg.on("close", code => {
    console.log(`FFmpeg finalizado com código ${code}`);
  });

  res.send(`
    <h3>🔁 Transcodificando...</h3>
    <p>Quando pronto, abra: <a href="/output/playlist.m3u8">/output/playlist.m3u8</a></p>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ FFmpeg HLS Proxy ativo em http://localhost:${PORT}`);
});
