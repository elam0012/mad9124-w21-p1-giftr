import mongoose from 'mongoose'
import {giftSchema} from "./index.js"

const schema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 254, required: true },
  birthDate: { type: Date, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sharedWith: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], 
  gifts: [giftSchema],
  imageUrl: {type: String, maxlength: 1024} 
},
{
  timestamps: true
})

const Model = mongoose.model('Person', schema)

export default Model