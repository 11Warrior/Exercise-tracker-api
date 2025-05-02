const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

// ===== Connect to MongoDB =====
mongoose.connect(
  "mongodb+srv://aayushthapa640:LpJ3Z0lHo4EjlHWD@cluster0.kqcucax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
).then(() => console.log('connected to DB'))

// ===== User Schema =====
const UserSchema = mongoose.Schema({
  username: String
})
const User = mongoose.model('User', UserSchema)

// ===== Exercise Schema =====
const exerciseSchema = mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date
})
const Exercise = mongoose.model('Exercise', exerciseSchema)

// ===== Log Schema (optional use) =====
const logSchema = mongoose.Schema({
  username: String,
  count: Number,
  log: [{
    description: String,
    duration: Number,
    date: Date
  }]
})
const Log = mongoose.model('Log', logSchema)

// ===== Routes =====

// Create user
app.post('/api/users', async (req, res) => {
  const { username } = req.body
  const newUser = new User({ username })
  await newUser.save()
  res.json({ username: newUser.username, _id: newUser._id })
})

// Get all users
app.get('/api/users', async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

// Add exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params
  const { description, duration, date } = req.body
  const user = await User.findById(_id)

  const dateObj = date ? new Date(date) : new Date()

  const newExercise = new Exercise({
    username: user.username,
    description,
    duration: parseInt(duration),
    date: dateObj
  })

  await newExercise.save()
  res.json({
    _id,
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date.toDateString()
  })
})

// Get logs
app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params
  const { from, to, limit } = req.query

  const user = await User.findById(_id)
  let exercises = await Exercise.find({ username: user.username })

  if (from) {
    const fromDate = new Date(from)
    exercises = exercises.filter(ex => new Date(ex.date) >= fromDate)
  }

  if (to) {
    const toDate = new Date(to)
    exercises = exercises.filter(ex => new Date(ex.date) <= toDate)
  }

  if (limit) {
    exercises = exercises.slice(0, parseInt(limit))
  }

  const logArray = exercises.map(exercise => ({
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString()
  }))

  res.json({
    username: user.username,
    count: logArray.length,
    _id,
    log: logArray
  })
})

// ===== Start Server =====
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
