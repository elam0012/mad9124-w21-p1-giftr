import createDebug from 'debug'
import sanitizeBody from '../middleware/sanitizeBody.js'
import {Gift} from "../models/index.js"
import express from 'express'
import ResourceNotFoundError from '../exceptions/ResourceNotFound.js'
import authenticate from '../middleware/auth.js'
import validate from '../middleware/validation.js'

const debug = createDebug('week9:routes:gifts')
const router = express.Router()

// create a gift
router.post('/', sanitizeBody, authenticate, validate, async (req, res) => {
  let newGift = new Gift(req.sanitizedBody)
  try {
    await newGift.save()
    res.status(201).json({ data: newGift })
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
router.patch('/:giftId', sanitizeBody, authenticate, validate, async (req, res, next) => {
  try {
      const document = await Gift.findByIdAndUpdate(
        req.params.giftId,
        req.sanitizedBody,
        {
          new: true,
          overwrite: false,
          runValidators: true,
        }
      )
      if (!document) throw new ResourceNotFoundError(`We could not find a gift with id: ${req.params.giftId}`)
      res.send({ data: document })
    } catch (err) {
      next()
    }
})

// Remove a gift
router.delete('/:giftId', authenticate, validate, async (req, res, next) => {
  try {
    const gift = await Gift.findByIdAndRemove(req.params.giftId)
    if (!gift) throw new ResourceNotFoundError(`We could not find a gift with id: ${req.params.giftId}`)
    res.json({ data:gift })
  } catch (err) {
    next()
  }
})

export default router
