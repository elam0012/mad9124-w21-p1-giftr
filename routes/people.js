import createDebug from 'debug'
import sanitizeBody from '../middleware/sanitizeBody.js'
import {Person} from "../models/index.js"
import express from 'express'
import ResourceNotFoundError from '../exceptions/ResourceNotFound.js'

const debug = createDebug('week9:routes:people')
const router = express.Router()

router.get('/', async (req, res) => {
  const collection = await Person.find()
  res.send({ data: formatResponseData(collection) })
})

router.post('/', sanitizeBody, async (req, res) => {
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
          description: 'Problem saving document to the database.',
        },
      ],
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const document = await Person.findById(req.params.id)
    if (!document) throw new ResourceNotFoundError(`We could not find a car with id: ${req.params.id}`)
    res.json({ data: formatResponseData(document) })
  } catch (err) {
    next(err)
  }
})

const update =
  (overwrite = false) =>
  async (req, res) => {
    try {
      const document = await Person.findByIdAndUpdate(
        req.params.id,
        req.sanitizedBody,
        {
          new: true,
          overwrite,
          runValidators: true,
        }
      )
      if (!document) throw new ResourceNotFoundError(`We could not find a car with id: ${req.params.id}`)
      res.send({ data: formatResponseData(document) })
    } catch (err) {
      next(err)
    }
  }
router.put('/:id', sanitizeBody, update(true))
router.patch('/:id', sanitizeBody, update(false))

router.delete('/:id', async (req, res) => {
  try {
    const document = await Person.findByIdAndRemove(req.params.id)
    if (!document) throw new ResourceNotFoundError(`We could not find a car with id: ${req.params.id}`)
    res.send({ data: formatResponseData(document) })
  } catch (err) {
    next(err)
  }
})

/**
 * Format the response data object according to JSON:API v1.0
 * @param {string} type The resource collection name, e.g. 'cars'
 * @param {Object | Object[]} payload An array or instance object from that collection
 * @returns
 */
function formatResponseData(payload, type = 'people') {
  if (payload instanceof Array) {
    return payload.map((resource) => format(resource))
  } else {
    return format(payload)
  }

  function format(resource) {
    const { _id, ...attributes } = resource.toObject()
    return { type, id: _id, attributes }
  }
}

export default router
