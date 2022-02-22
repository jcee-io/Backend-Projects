const express = require('express');
const dns = require('dns');
const bodyParser = require('body-parser');
const multer = require('multer');
const parse = require('url-parse');

const upload = multer({ dest: './uploads/'});
const app = express();
const storedURLs = [];
const storedUsers = [];

app.use('/public', express.static(__dirname + '/public'));
app.use('/scripts', express.static(__dirname + '/scripts'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('cors')());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

//************************************************************************
// PROJECT 5: FILE METADATA MICROSERVICE

app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  const { originalname: name, mimetype: type, size } = req.file;
  
  res.json({ name, type, size });
});

// **********************************************************************
// PROJECT 4: EXERCISE TRACKER

app.route('/api/users')
  .post((req, res) => {
    console.log(req.body);
    const user = {
      username: req.body.username,
      _id: String(storedUsers.length),
      log: [],
    };

    storedUsers.push(user);
    res.json(user);
  })
  .get((req, res) => {
    const user = storedUsers[0];
    res.json(storedUsers);
  })

app.post('/api/users/:_id/exercises', (req, res) => {
  const user = storedUsers[req.params._id];
  req.body.duration = Number(req.body.duration);
  req.body.date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString(),
  user.log.push(req.body);

  res.json({
    username: user.username,
    ...req.body,
    _id: user._id
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const user = storedUsers[req.params._id];
  let log = user.log
  console.log(req.query);
  if(req.query.from) {
    const from = new Date(req.query.from);

    log = log.filter(exercise => {
      const date = new Date(exercise.date);

      return date > from;
    });
  }

  if(req.query.to) {
    const to = new Date(req.query.to);

    log = log.filter(exercise => {
      const date = new Date(exercise.date);

      return date < to;
    });
  }

  if(req.query.limit) {
    log = log.slice(0, req.query.limit);
  }

  console.log({log: log, count: user.log.length });
  
  res.json({log: log, count: user.log.length });
});
// **********************************************************************
// PROJECT 3: URL SHORTENER

app.post('/api/shorturl', (req, res) => {
  const url = parse(req.body.url);
  
  dns.lookup(url.hostname, (err, address) => {
    if(err || (url.protocol !== 'http:' && url.protocol !== 'https:')) {

      if(err || url.protocol) {
        res.json({ error: 'invalid url' });
        return;
      }
    }
    storedURLs.push(req.body.url);
    res.json({ "original_url": req.body.url, "short_url": storedURLs.length - 1 });
  });
  
});

app.get('/api/shorturl/:shortid', (req, res) => {
  const url = storedURLs[req.params.shortid];

  if(!url) {
    res.sendStatus(404);
    return;
  }

  res.redirect(url);
});
// *********************************************************************
// PROJECT 2: REQUEST HEADER PARSER

const formatWhoAmI = (req, res, next) => {
  res.whoami = {
    ipaddress: req.ip,
    language: req.headers["accept-language"],
    software: req.headers["user-agent"]
  };
  next();
};

app.get('/api/whoami', formatWhoAmI, (req, res) => {
  res.json(res.whoami)
});

// *********************************************************************

// **********************************************************************************
// PROJECT 1: Timestamp Microservice
// Uses /api or /api/:date (could be unix time or date format), returns unix and utc times
const formatDateRequest = (req, res, next) => {
    let time = new Date(req.params.data);

    if(time.toGMTString() === 'Invalid Date' && Number(req.params.data)) {
      time = new Date(Number(req.params.data));
    }

    req.time = {
      unix: time.getTime(),
      utc: time.toGMTString(),
    };

    if(req.time.utc === 'Invalid Date') {
      req.time = { error: 'Invalid Date'};
    }
    next();
  };

app.get('/api/:data', formatDateRequest, (req, res) => {
  res.json(req.time);
});

app.get('/api', (req, res) => {
  const time = new Date();

  res.json({
    unix: time.getTime(),
    utc: time.toGMTString(),
  })
});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});
app.listen(process.env.PORT || 8080);