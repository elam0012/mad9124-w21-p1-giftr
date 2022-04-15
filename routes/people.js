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
  const collection = await Person.find({owner: req.user._id}).select('-gifts')
  res.send({ data: collection })
})

// get details for a person
router.get('/:id', authenticate, validate, async (req, res, next) => {
  try {
    // const person = await Person.findById(req.params.id)
    const document = await Person.findById(req.params.id)//.populate("gifts")
    if (JSON.stringify(document.owner) === JSON.stringify(req.user._id)) {
      if (!document) throw new ResourceNotFoundError(`We could not find a car with id: ${req.params.id}`)
      res.json({ data:document })
    } else {
        res.status(500).send({
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
  let newDocument = new Person(req.sanitizedBody)
  try {
    await newDocument.save()
    res.status(201).json({ data: newDocument })
  } catch (err) {
    debug(err)
    res.status(500).send({
      errors: [
        {
          status: '500',
          title: 'Server error',
          description: 'Problem saving document to the database. check the person data format.',
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
      if (JSON.stringify(person.owner) === JSON.stringify(req.user._id)) {
        const document = await Person.findByIdAndUpdate(
        req.params.id,
        req.sanitizedBody,
        {
          new: true,
          overwrite,
          runValidators: true,
        }
      )
      if (!document) throw new ResourceNotFoundError(`We could not find a person with id: ${req.params.id}`)
      res.send({ data: document })
      } else {
        res.status(500).send({
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
      const document = await Person.findByIdAndRemove(req.params.id)
      if (!document) throw new ResourceNotFoundError(`We could not find a person with id: ${req.params.id}`)
      res.send({ data:document})
    } else {
        res.status(500).send({
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
