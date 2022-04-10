import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import validator from "validator"

const saltRounds = 14
const jwtSecretKey = 'superSecureSecret'

const schema = new mongoose.Schema({
  firstName: {type: String, trim: true, maxlength: 64, required: true},
  lastName: {type: String, trim: true, maxlength: 64},
  email: {
    type: String,
    trim: true,
    maxlength: 512,
    required: true,
    unique: true,
    set: value => value.toLowerCase(),
    validate: { // is not working
      validator: value => validator.isEmail(value),
      message: props => `${props.value} is not a valid email address.`
    }
  },
  password: {type: String, trim: true, maxlength: 70, required: true},

},
{
  timestamps: true
  })

schema.methods.generateAuthToken = function() {
  const payload = {uid: this._id}
  return jwt.sign(payload, jwtSecretKey, { expiresIn: '1h', algorithm: 'HS256' })
}

schema.statics.authenticate = async function(email, password) {
  const user = await this.findOne({email: email})

  const badHash = `$2b$${saltRounds}$invalidusernameaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
  const hashedPassword = user ? user.password : badHash
  const passwordDidMatch = await bcrypt.compare(password, hashedPassword)

  return passwordDidMatch ? user : null
}

schema.pre('save', async function(next) {
  // Only encrypt if the password property is being changed.
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, saltRounds)
  next()
})

schema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.__v
  return obj
}

schema.plugin(uniqueValidator, { // its is not working
  message: props =>
    props.path === 'email'
      ? `The email address '${props.value}' is already registered.`
      : `The ${props.path} must be unique. '${props.value}' is already in use.`
})

const Model = mongoose.model('User', schema) 

export default Model