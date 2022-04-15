import createDebug from 'debug'
import sanitizeBody from '../middleware/sanitizeBody.js'
import {Person} from "../models/index.js"
import express from 'express'
import ResourceNotFoundError from '../exceptions/ResourceNotFound.js'
import authenticate from '../middleware/auth.js'
import validate from '../middleware/validation.js'

const debug = createDebug('week9:routes:people')
const router = express.Router()

// list all people
router.get('/', authenticate, validate, async (req, res) => {
  const people = await Person.find({owner: req.user._id}).select('-gifts')
  res.send({ data: people })
})

// get details for a person
router.get('/:id', authenticate, validate, async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id)
    const isShared = Boolean(person.sharedWith.includes(req.user._id))
    if (JSON.stringify(person.owner) === JSON.stringify(req.user._id) || isShared) {
      if (!person) throw new ResourceNotFoundError(`We could not find a car with id: ${req.params.id}`)
      res.json({ data:person })
    } else {
        res.status(400).send({
          errors: [
            {
              status: '400',
              title: 'Not authorized',
              description: 'User is not authorized to modify this person',
            },
          ],
        })
      }
  } catch (err) {
    next()
  }
})

// create a person
router.post('/', sanitizeBody, authenticate, validate, async (req, res) => {
  req.sanitizedBody.owner = req.user._id
  let newperson = new Person(req.sanitizedBody)
  try {
    await newperson.save()
    res.status(201).json({ data: newperson })
  } catch (err) {
    debug(err)
    res.status(500).send({
      errors: [
        {
          status: '500',
          title: 'Server error',
          description: 'Problem saving person to the database. check the person data format.',
        },
      ],
    })
  }
})

const update =
  (overwrite = false) =>
  async (req, res, next) => {
    try {
      const person = await Person.findById(req.params.id)
      const isShared = Boolean(person.sharedWith.includes(req.user._id))
      if (JSON.stringify(person.owner) === JSON.stringify(req.user._id) || isShared) {
        const person = await Person.findByIdAndUpdate(
        req.params.id,
        req.sanitizedBody,
        {
          new: true,
          overwrite,
          runValidators: true,
        }
      )
      if (!person) throw new ResourceNotFoundError(`We could not find a person with id: ${req.params.id}`)
      res.send({ data: person })
      } else {
        res.status(400).send({
          errors: [
            {
              status: '400',
              title: 'Not authorized',
              description: 'User is not authorized to modify this person',
            },
          ],
        })
      }
    } catch (err) {
      next()
    }
  }
router.put('/:id', sanitizeBody, authenticate, validate, update(true)) // replace a person
router.patch('/:id', sanitizeBody, authenticate, validate, update(false)) // update a person

// remove a person
router.delete('/:id', authenticate, validate, async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id)
    if (JSON.stringify(person.owner) === JSON.stringify(req.user._id)) {
      const person = await Person.findByIdAndRemove(req.params.id)
      if (!person) throw new ResourceNotFoundError(`We could not find a person with id: ${req.params.id}`)
      res.send({ data:person})
    } else {
        res.status(400).send({
          errors: [
            {
              status: '400',
              title: 'Not authorized',
              description: 'User is not authorized to modify this person',
            },
          ],
        })
      }
  } catch (err) {
    next()
  }
})

export default router
