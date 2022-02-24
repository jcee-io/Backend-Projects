const express = require('express');
const bodyParser = require('body-parser');

const app = express();


app.use('/public', express.static(__dirname + '/public'));
app.use('/scripts', express.static(__dirname + '/scripts'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('cors')());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});
app.listen(process.env.PORT || 8080);