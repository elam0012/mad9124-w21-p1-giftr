import createDebug from 'debug'
import sanitizeBody from '../middleware/sanitizeBody.js'
import {Gift} from "../models/index.js"
import express from 'express'
import ResourceNotFoundError from '../exceptions/ResourceNotFound.js'
import authenticate from '../middleware/auth.js'

const debug = createDebug('week9:routes:gifts')
const router = express.Router()

// create a gift
router.post('/', sanitizeBody, async (req, res) => {
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
router.patch('/:giftId', sanitizeBody, async (req, res, next) => {
  try {
    // console.log(req.params.giftId)
      const document = await Gift.findByIdAndUpdate(
        req.params.giftId,
        req.sanitizedBody,
        {
          new: true,
          overwrite: false,
          runValidators: true,
        }
      )
      console.log(req.sanitizedBody)
      if (!document) throw new ResourceNotFoundError(`We could not find a gift with id: ${req.params.giftId}`)
      res.send({ data: document })
    } catch (err) {
      next()
    }
})

// router.patch('/users/me', sanitizeBody, authenticate, async (req, res, next) => {
//   try {
//       const document = await User.findByIdAndUpdate(
//         req.user._id,
//         req.sanitizedBody,
//         {
//           new: true,
//           overwrite: false,
//           runValidators: true,
//         }
//       )
//       if (!document) throw new ResourceNotFoundError(`We could not find a car with id: ${req.params.id}`)
//       res.send({ data: "password updated successfully"})
//     } catch (err) {
//       next()
//     }
// })

// Remove a gift
router.delete('/:giftId', async (req, res, next) => {
  try {
    const gift = await Gift.findByIdAndRemove(req.params.giftId)
    if (!gift) throw new ResourceNotFoundError(`We could not find a gift with id: ${req.params.giftId}`)
    res.json({ data:gift })
  } catch (err) {
    next()
  }
})

export default router
