const express = require('express');
const minify = require('express-minify');

const datasets = require('./datasets.json');
const DB = datasets.map(obj => {
  return {
    id: obj.id,
    picture: obj.picture
  };
});

const app = express();

const logRequests = (req, res, next) => {
  const { ip, method, originalUrl } = req;
  console.log(`${ip} ${method} ${originalUrl}`);
  next();
};

app.use(minify({ cache: __dirname + '/cache' }));
app.use(express.static(__dirname + '/public'));
app.use(logRequests);

app.get('/api/pictures', (req, res) => {
  let { lastId, itemPerPage } = req.query;
  if (itemPerPage === undefined) {
    itemPerPage = 10;
  }

  if (lastId === undefined) {
    res.json(DB.slice(0, itemPerPage));
    return;
  }

  const idx = DB.findIndex(obj => obj.id === lastId);
  if (idx === -1) {
    res.sendStatus(400);
    return;
  }
  res.json(DB.slice(idx + 1, itemPerPage));
});

app.post('/api/pictures', (req, res) => {
  const { id, picture } = JSON.parse(req.body);
  if (id === undefined || picture === undefined) {
    req.sendStatus(400);
    return;
  }

  DB.push({ id, picture });
  // TODO: save file
});

app.delete('/api/pictures/:id', (req, res) => {
  const idx = DB.findIndex(obj => obj.id === req.param.id);
  if (idx === -1) {
    res.sendStatus(404);
    return;
  }

  DB = DB.splice(idx, 1);
  // TODO: save file
});

app.listen(4242, () => {
  console.log('App listening on port 4242');
});
