const express = require("express");
const path = require("path");
const PORT = 3000;

const app = express();
express.json();

app.use(express.static(path.resolve(__dirname, "./static")));

app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "index.html"));
});

app.get("/index.html", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "index.html"));
});

app.get("/offline.html", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "offline.html"));
});

app.get("/ServiceWorkerGenerator.js", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "ServiceWorkerGenerator.js"));
});

app.get("/service-worker.js", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "service-worker.js"));
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));
