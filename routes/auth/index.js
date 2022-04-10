

import User from '../../models/User.js'
import sanitizeBody from '../../middleware/sanitizeBody.js'
import createDebug from 'debug'
import express from 'express'
import authenticate from '../../middleware/auth.js'

const debug = createDebug('week8:auth')
const router = express.Router()

// Register a new user
router.post('/users', sanitizeBody, (req, res, next) => {
  new User(req.sanitizedBody)
    .save()
    .then(newUser => res.status(201).send({ data: newUser }))
    .catch(next)
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

// Get the currently logged-in user
router.get('/users/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id)
  res.send({ data: user })
})

export default router