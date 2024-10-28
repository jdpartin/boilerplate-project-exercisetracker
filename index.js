const express = require('express')
const app = express()
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');

require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const users = [];
const exercises = [];
const logs = [];

class Exercise {
  constructor(_username, _description, _duration, _date = null) {
    this.username = _username;
    this.description = _description;
    this.duration = parseInt(_duration);

    if (isValidDate(_date)) {
      this.date = new Date(_date).toDateString();
    } else {
      this.date = new Date().toDateString();
    }

    exercises.push(this);

    let user = getUserByUsername(_username);
    let log = findOrCreateUserLog(user);

    log.addExercise(this);
  }
}

function findOrCreateUserLog(user) {
  let log = logs.find(_log => _log.username === user.username);

  if (!log) {
    log = new Log(user.username, []);
    logs.push(log);
  }

  return log;
}

class User {
  constructor(_username) {
    this.username = _username;
    this._id = generateId();
    users.push(this);
  }
}

class Log {
  constructor(_username, _exerciseArray) {
    this.username = _username;
    this.count = _exerciseArray.length;
    this.log = _exerciseArray;
    this.date = Date.now();
  }

  addExercise(exercise) {
    this.log.push(exercise);
    this.count = this.log.length;
  }
}

function generateId() {
  return uuidv4();
}

app.post('/api/users', (req, res) => {
  let username = req.body.username;

  res.json(new User(username));
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  let _id = req.params._id;
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;

  let user = getUserById(_id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  let exercise = new Exercise(user.username, description, duration, date);

  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: parseInt(exercise.duration),
    date: exercise.date
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  let user = getUserById(req.params._id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let log = getLogForUser(user);
  let logEntries = log.log;

  let start = req.query.start;
  let end = req.query.end;
  let limit = req.query.limit;

  if (start) {
    let startDate = new Date(start);
    logEntries = logEntries.filter(lg => new Date(lg.date) >= startDate);
  }

  if (end) {
    let endDate = new Date(end);
    logEntries = logEntries.filter(lg => new Date(lg.date) <= endDate);
  }

  if (limit) {
    logEntries = logEntries.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    _id: user._id,
    count: logEntries.length,
    log: logEntries
  });
});

function isValidDate(dateString) {
  return !isNaN(Date.parse(dateString));
}

function getLogForUser(user) {
  return logs.find(lg => lg.username === user.username);
}

function getUserById(_id) {
  return users.find(usr => usr._id === _id);
}

function getUserByUsername(username) {
  return users.find(usr => usr.username === username);
}

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
