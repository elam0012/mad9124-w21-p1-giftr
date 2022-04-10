

import User from '../../models/User.js'
import sanitizeBody from '../../middleware/sanitizeBody.js'
import createDebug from 'debug'
import express from 'express'

const debug = createDebug('week8:auth')
const router = express.Router()

// Register a new user
router.post('/users', sanitizeBody, async (req, res) => {
  try {
    const newUser = new User(req.sanitizedBody)

    const itExists = Boolean(await User.countDocuments({email: newUser.email}))
    if (itExists) {
      return res.status(400).send({
        errors: [
          {
            status: '400',
            title: 'Validation Error',
            detail: `Email address '${newUser.email}' is already registered.`,
            source: {pointer: '/data/attributes/email'}
          }
        ]
      })
    }

    await newUser.save()
    res.status(201).send({data: newUser})
  } catch (err) {
    debug('Error saving new user: ', err.message)
    res.status(500).send({
      errors: [
        {
          status: '500',
          title: 'Server error',
          description: 'Problem saving document to the database.'
        }
      ]
    })
  }
})

// Login a user and return an authentication token.
router.post('/tokens', sanitizeBody, async (req, res) => {
  const {email, password} = req.sanitizedBody
  const user = await User.authenticate(email, password)

  if (!user) {
    return res.status(401).send({
      errors: [
        {
          status: '401',
          title: 'Incorrect username or password.'
        }
      ]
    })
  }

  res.status(201).send({data: {token: user.generateAuthToken()}})
})

export default router