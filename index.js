require('dotenv').config()
const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(morgan(function(tokens, req, res) {
    const body = JSON.stringify(req.body)
    return [
        tokens.method(req,res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),'-',
        tokens['response-time'](req, res), 'ms',
        body
    ].join(' ')
}))


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


const generateId = () => {
    
    let max = 1000000000
    return Math.floor(Math.random() * max);
  }


app.get('/info', (request, response) => {

  Person.find({}).then(persons => {
    let count = persons.length
    let text1 = `<p>Phonebook has info for ${count} people</p>`
    let date = new Date()
    let text2 = `<p>${date.toString()}<p>`
    response.send(text1.concat(text2))
  })

})


app.get('/api/persons', (request, response) => {

  Person.find({}).then(persons => {
    response.json(persons)
  })

})


app.get('/api/persons/:id', (request, response, next) => {
    
    Person.findById(request.params.id).then( person => {
      response.json(person)
    })
})


app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
      .then( result => {
        response.status(204).end()
      })
      .catch( error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (body.name === undefined || body.number === undefined){
    response.status(400).json({error:"content missing"})
  }

  Person.find({name:body.name})
    .then( person => {
      if(person.length > 0){

        const newPerson = {
          name: body.name,
          number: body.number,
        }
      
        Person.findByIdAndUpdate(person[0].id, newPerson, { new: true })
          .then(updatedPerson => {
            response.json(updatedPerson)
          })
          .catch(error => next(error))

      } else {

        const person = new Person({
          name: body.name,
          number: body.number
        })
      
        person.save().then( savedPerson => {
          response.json(savedPerson)
        })
        .catch(error => next(error))

      }
    })

})


app.put('/api/persons/:id', (request, response, next) => {
  const {name, number} = request.body

  const person = {
    name: name,
    number: number,
  }

  Person.findByIdAndUpdate(
    request.params.id,
    {name, number},
    { new: true, runValidators: true, context:'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({"error": error.message})
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})