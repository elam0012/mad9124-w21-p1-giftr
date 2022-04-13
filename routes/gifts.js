import createDebug from 'debug'
import sanitizeBody from '../middleware/sanitizeBody.js'
import {Gift} from "../models/index.js"
import express from 'express'
import ResourceNotFoundError from '../exceptions/ResourceNotFound.js'

const debug = createDebug('week9:routes:gifts')
const router = express.Router()

// create a gift
router.post('/', sanitizeBody, async (req, res) => {
  let newGift = new Gift(req.sanitizedBody)
  try {
    await newGift.save()
    res.status(201).json({ data: formatResponseData(newGift) })
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

// update a gift
router.patch('/:giftId', sanitizeBody, async (req, res) => {
  try {
      const document = await Person.findByIdAndUpdate(
        req.params.id,
        req.sanitizedBody,
        {
          new: true,
          overwrite: true,
          runValidators: true,
        }
      )
      if (!document) throw new ResourceNotFoundError(`We could not find a car with id: ${req.params.id}`)
      res.send({ data: formatResponseData(document) })
    } catch (err) {
      next(err)
    }
})

// Remove a gift
router.delete('/:giftId', async (req, res) => {
  try {
    const gift = await Gift.findByIdAndRemove(req.params.id)
    if (!gift) throw new ResourceNotFoundError(`We could not find a gift with id: ${req.params.id}`)
    res.json({ data: formatResponseData(gift) })
  } catch (err) {
    next(err)
  }
})

/**
 * Format the response data object according to JSON:API v1.0
 * @param {string} type The resource collection name, e.g. 'gifts'
 * @param {Object | Object[]} payload An array or instance object from that collection
 * @returns
 */
function formatResponseData(payload, type = 'gifts') {
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
