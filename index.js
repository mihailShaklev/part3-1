const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
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

    let count = persons.length
    let text1 = `<p>Phonebook has info for ${count} people</p>`
    let date = new Date()
    let text2 = `<p>${date.toString()}<p>`
    response.send(text1.concat(text2))

})

app.get('/api/persons', (request, response) => {

  response.json(persons)

})

app.get('/api/persons/:id', (request, response) => {
    
    let id = Number(request.params.id)
    let person = persons.find(person => person.id === id)

    if (person){

        response.json(person)

    } else {
        
        response.status("404").send('Person not found.')
    }
})

app.delete('/api/persons/:id', (request, response) => {
    
    let id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()

})

app.post('/api/persons', (request, response) => {

    const body = request.body
    const name = request.body.name
    
    if (!body.name){
        return response.status(400).json({"error":"Missing person`s name."})
    }

    if (!body.number){
        return response.status(400).json({"error":"Missing person`s number."})
    }

    let nameInDB = persons.filter(person => person.name === name)

    if (nameInDB.length > 0){
        return response.status(400).json({"error":"Name must be unique."})
    }

    const person = {
      id: generateId(),
      name: body.name,
      number: body.number,
    }
  
    persons = persons.concat(person)
    response.json(person)

  })

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
