const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

require('dotenv').config()

const Person = require('./models/person')

  const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }
  
  const generateID = () => {
  const randInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  //const maxId = persons.length > 0
  //  ? Math.max(...persons.map(n => n.id))
  //  :0
  //return maxId + 1
  const id = randInt(1, 10000)
  console.log("Generated number: ",id);
  return id
}

morgan.token('body', (req,res) => JSON.stringify(req.body))

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
//app.use(requestLogger)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// app.get('/', (request, response) => {
//  response.send('<h1>Hello World!</h1>')
//})

app.get('/info', (request, response) => {
  const count = persons.length
  const date = new Date(Date.now())
  const dateString = date.toString()
  response.send(`
    <p>Phonebook has info for ${count} people
    <br/>
    ${dateString}</p>
  `)  
})

//app.get('/api/persons', (request, response) => {
//  response.json(persons)
//})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  console.log(id);
  //const person = persons.find(person => {
  //  console.log(person, person.id, typeof person.id, id, typeof id, person.id === id);
  //  return person.id === id
  //})
  //person = Person.findById(id)
  Person.findById(id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))  
  })
  //const this_person = persons.find(person => person.id === id)
  //console.log(person);
  //if (person) {
  //  response.json(person)
  //} else {
  //  response.status(404).end()
  //}
  

//app.delete('/api/persons/:id', (request, response) => {
//  const id = Number(request.params.id)
//  persons = persons.filter(person => person.id !== id)
//
//  response.status(204).end()
//})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body

  console.log(body);

  if (!body.name) {
    return response.status(400).json({
        error: 'name is missing'
    })
  }

  if (!body.number) {
    return response.status(400).json({
        error: 'number is missing'
    })
  }

  //if (persons.find((p) => p.name === body.name)) {
  //  return response.status(400).json({
  //      error: 'name must be unique'
  //  })
  //}
  
  //const person = {
  //  name: body.name,
  //  number: body.number,
  //  id: generateID()
  //}

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  //persons = persons.concat(person)


  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))

  //console.log(person)
  //response.json(person)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    console.log('Caught Cast Error')
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    console.log('Caught Validation Error')
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
