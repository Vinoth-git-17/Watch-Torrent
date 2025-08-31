import express, { json } from "express";
import WebTorrent from "webtorrent";
import cors from "cors";
const app = express();
const client = new WebTorrent();

app.use(json());
// Enable CORS
app.use(cors());

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
  })
);

// Test Route
app.get("/", (req, res) => {
  res.send("Watch Torrent is Running...");
});

app.post("/add-torrent", (req, res) => {
  const { magnetURI } = req.body;

  if (!magnetURI) {
    return res.status(400).json({ error: "Magnet URI is required" });
  }

  const torrent = client.add(magnetURI, { announce: true });
  const GB_IN_BYTES = Math.pow(1024, 3);
  torrent.on("metadata", () => {
    // Torrent is valid, and metadata is available
    const details = {
      name: torrent.name,
      infoHash: torrent.infoHash,
      size: torrent.length / GB_IN_BYTES,
    };
    res.json(details);
  });

  torrent.on("error", (err) => {
    // Handle errors, such as invalid magnet URI
    res.json({ error: `Failed to fetch torrent metadata: ${err.message}` });
  });
});

// TODO: Need to implement download torrent file
app.post("/download-torrent", (req, res) => {
  const { magnetURI } = req.body;

  if (!magnetURI) {
    return res.status(400).json({ error: "Magnet URI is required" });
  }

  client.add(magnetURI, (torrent) => {
    const file = torrent.files.find(
      (f) => f.name.endsWith(".mp4") || f.name.endsWith(".mkv")
    );
    if (!file) return res.status(404).json({ error: "No video file found" });

    res.json({ name: file.name, size: file.length });
  });
});

app.get("/stream/:hash", async (req, res) => {
  const torrent = await client.get(req.params.hash);
  if (!torrent) return res.status(404).json({ error: "Torrent not found" });

  const file = torrent.files.find(
    (f) => f.name.endsWith(".mp4") || f.name.endsWith(".mkv")
  );
  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }
  const range = req.headers.range;
  if (!range) {
    return res.status(400).send("Requires Range header");
  }

  const positions = range.replace(/bytes=/, "").split("-");
  const start = parseInt(positions[0], 10);
  const total = file.length;
  const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
  const chunksize = end - start + 1;

  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${total}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunksize,
    "Content-Type": file.name.endsWith(".mp4") ? "video/mp4" : "video/mkv",
  });

  const stream = file.createReadStream({ start, end });

  stream.on("error", (streamErr) => {
    console.error("Stream error:", streamErr);
    if (!res.headersSent) {
      res.status(500).end("Stream error: " + streamErr.message);
    } else {
      res.end();
    }
  });

  stream.pipe(res);

  res.on("close", () => {
    stream.destroy(); // Ensure stream is destroyed if response is closed
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
