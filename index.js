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

class Exercise
{
  constructor(_username, _description, _duration, _date = null)
  {
    this.username = _username;
    this.description = _description;
    this.duration = _duration;
    this._id = generateId();

    if (_date != null)
    {
      this.date = _date;
    }
    else
    {
      this.date = Date.now();
    }

    exercises.push(this);
  }
}

class User
{
  constructor(_username)
  {
    this.username = _username;
    this._id = generateId();
    users.push(this);
  }
}

class Log
{
  constructor(_username, _logEntryArray)
  {
    this.username = _username;
    this.count = _logEntryArray.length;
    this._id = generateId();
    this.log = _logEntryArray;
    logs.push(this);
  }
}

class LogEntry
{
  constructor(_description, _duration, _date = null)
  {
    this.description = _description;
    this.duration = _duration

    if (_date != null)
    {
      this.date = _date;
    }
    else
    {
      this.date = Date.now();
    }
  }
}

function generateId()
{
  return uuidv4();
}

app.post('/api/users', (req, res) => {
  let username = req.body.username;

  res.json(new User(username));
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/:_id/exercises', (req, res) => {
  let _id = req.params._id;
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;

  let user = getUserById(_id);
  let exercise = new Exercise(user.username, description, duration, date);
  let userExercises = getUserExercises(user);

  res.json(exercise);
  
  /*
  res.json({
    user,
    exercises: userExercises
  });
  */
});

function getUserById(_id)
{
  // find the user
  let user;

  for (let usr of users)
  {
    if (usr._id == _id)
    {
      user = usr;
      return;
    }
  }

  return user;
}

function getUserExercises(user)
{
  // get a list of associated exercises
  let userExercises = [];

  for (let ex of exercises)
  {
    if (ex.username == user.username)
    {
      userExercises.push(ex);
    }
  }

  return userExercises;
}

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
