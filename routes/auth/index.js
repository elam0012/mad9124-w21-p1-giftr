import express from 'express'
import sanitizeBody from '../../middleware/sanitizeBody.js'
import debug from 'debug'
import User from "../../models/User.js"
import bcrypt from 'bcrypt'

const saltRounds = 14
const router = express.Router()

// Register a new user
router.post('/users', sanitizeBody, async (req, res) => {
  try {
    let newUser = new User(req.sanitizedBody)
    const itExists = Boolean(await User.countDocuments({ email: newUser.email }))
    if (itExists) {
      return res.status(400).send({
        errors: [
          {
            status: '400',
            title: 'Validation Error',
            detail: `Email address '${newUser.email}' is already registered.`,
            source: { pointer: '/data/attributes/email' }
          }
        ]
      })
    }
    newUser.password = await bcrypt.hash(newUser.password, saltRounds)
    await newUser.save()
    res.status(201).send({ data: newUser })
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

// Login a user and return an authentication token.
// router.post('/tokens', sanitizeBody, async (req, res) => {
//   const { email, password } = req.sanitizedBody
//   const user = await User.findOne({ email: email })
//   if (!user) {
//     return res.status(401).send({ errors: ['we will build this later'] })
//   }

//   const hashedPassword = user.password
//   const passwordDidMatch = await bcrypt.compare(password, hashedPassword)
//   if (!passwordDidMatch) {
//     return res.status(401).send({ errors: ['we will build this later'] })
//   }

//   const token = 'iamatoken'
//   res.status(201).send({ data: { token } })

  // check if the payload.username is valid
  // retrieve the stored password hash
  // compare the payload.password with the hashed password
  // if all is good, return a token
  // if any condition failed, return an error message

  router.post('/tokens', sanitizeBody, async (req, res) => {
  const { email, password } = req.sanitizedBody

  const user = await User.findOne({ email: email })

  const badHash = `$2b$${saltRounds}$invalidusernameaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
  const hashedPassword = user ? user.password : badHash
  const passwordDidMatch = await bcrypt.compare(password, hashedPassword)

  if (!user || !passwordDidMatch) {
    return res.status(401).send({ errors: ['we will build this later'] })
  }

  const token = 'iamatoken'
  res.status(201).send({ data: { token } })
})

export default router