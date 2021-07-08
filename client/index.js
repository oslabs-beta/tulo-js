const express = require('express');
const path = require('path');
const PORT = 5500;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, './static')));

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'index.html'));
});

app.get('/offline.html', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'offline.html'));
});

app.get('/service-worker.js', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'service-worker.js'));
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));
