const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
  ]

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

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  console.log(id);
  const person = persons.find(person => {
    console.log(person, person.id, typeof person.id, id, typeof id, person.id === id);
    return person.id === id
  })
  //const this_person = persons.find(person => person.id === id)
  console.log(person);
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
  
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
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

  if (persons.find((p) => p.name === body.name)) {
    return response.status(400).json({
        error: 'name must be unique'
    })
  }
  const person = {
    name: body.name,
    number: body.number,
    id: generateID()
  }

  persons = persons.concat(person)

  console.log(person)
  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
