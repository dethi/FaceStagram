const express = require('express');
const minify = require('express-minify');
const shortid = require('shortid');
const bodyParser = require('body-parser');

const datasets = require('./datasets.json');
const DB = datasets.map(obj => {
  return {
    id: obj.id,
    picture: obj.picture
  };
});

const app = express();

app.use(minify({ cache: __dirname + '/cache' }));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(logRequests);

function validUrl(str) {
  const s = str.toLowerCase();
  return s.startsWith('http://') || s.startsWith('https://');
}

function logRequests(req, res, next) {
  const { ip, method, originalUrl } = req;
  console.log(`${ip} ${method} ${originalUrl}`);
  next();
}

app.get('/api/pictures', (req, res) => {
  let { cursor, amount } = req.query;
  if (amount === undefined) {
    amount = 10;
  }
  amount = parseInt(amount);

  if (cursor === undefined) {
    res.json(DB.slice(0, amount));
    return;
  }

  const idx = DB.findIndex(obj => obj.id === cursor);
  if (idx === -1) {
    res.sendStatus(404);
    return;
  }
  res.json(DB.slice(idx + 1, idx + 1 + amount));
});

app.post('/api/pictures', (req, res) => {
  const { picture } = req.body;
  if (picture === undefined || !validUrl(picture)) {
    res.sendStatus(500);
    return;
  }

  const item = { id: shortid.generate(), picture };
  DB.push(item);
  console.log(`info: added ${item.id}`);
  res.sendStatus(200);
});

app.delete('/api/pictures/:id', (req, res) => {
  const idx = DB.findIndex(obj => obj.id === req.params.id);
  if (idx === -1) {
    res.sendStatus(404);
    return;
  }

  DB.splice(idx, 1);
  console.log(`info: deleted ${req.params.id}`);
  res.sendStatus(200);
});

app.listen(4242, () => {
  console.log('App serving on http://localhost:4242');
});
