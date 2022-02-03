require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
//const { request, response } = require('express')

app.use(express.static('build'))
app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  const date = new Date()
  Person.find({})
    .then(persons => {
      response.send(
        `   <div>
                Phonebook has info for ${persons.length} people
                <p>${date}</p>
            </div>`
      )
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  //const id = Number(request.params.id)
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        console.log('404')
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  //const id = Number(request.params.id)
  //persons = persons.filter(p => p.id !== id)
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

/*
const generateID = () => {
    return Math.floor(Math.random() * 1000000)
}*/

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log(body)
  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }
  else if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }
  /*
    else if (persons.find(p => p.name === body.name)) {
        return response.status(400).json({
            error: `${body.name} has already been added`
        })
    }
    */

  const person = new Person({
    name: body.name,
    number: body.number,
    //id: generateID()
  })

  //persons = persons.concat(person)
  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})