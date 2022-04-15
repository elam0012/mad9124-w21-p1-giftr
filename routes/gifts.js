import createDebug from 'debug'
import sanitizeBody from '../middleware/sanitizeBody.js'
import {Gift, Person} from "../models/index.js"
import express from 'express'
import ResourceNotFoundError from '../exceptions/ResourceNotFound.js'
import authenticate from '../middleware/auth.js'
import validate from '../middleware/validation.js'

const debug = createDebug('week9:routes:gifts')
const router = express.Router()

// create a gift
router.post('/:id/gifts', sanitizeBody, authenticate, validate, async (req, res) => {
  try {
    let newGift = new Gift(req.sanitizedBody)
    const person = await Person.findById(req.params.id)
    if (JSON.stringify(person.owner) === JSON.stringify(req.user._id)) {
      await newGift.save()
      res.status(201).json({ data: newGift })
      person.gifts.push(newGift)
      await person.save()
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
router.patch('/:id/gifts/:giftId', sanitizeBody, authenticate, validate, async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id)
    if (JSON.stringify(person.owner) === JSON.stringify(req.user._id)) {
      const gift = await Gift.findByIdAndUpdate(
        req.params.giftId,
        req.sanitizedBody,
        {
          new: true,
          overwrite: false,
          runValidators: true,
        }
      )
      person.gifts.id(req.params.giftId).remove()
      person.gifts.push(gift)
      await person.save()
      if (!gift) throw new ResourceNotFoundError(`We could not find a gift with id: ${req.params.giftId}`)
      res.send({ data: gift })
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

// Remove a gift
router.delete('/:id/gifts/:giftId', authenticate, validate, async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id)
    if (JSON.stringify(person.owner) === JSON.stringify(req.user._id)) {
    const gift = await Gift.findByIdAndRemove(req.params.giftId)
    if (!gift) throw new ResourceNotFoundError(`We could not find a gift with id: ${req.params.giftId}`)
    res.json({ data:gift })
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
