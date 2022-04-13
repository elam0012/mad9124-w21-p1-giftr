import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: { type: String, trim: true,minlength: 4, maxlength: 64, required: true },
  price: {type: Number, min: 100, default: 1000}, // make sure
  imageUrl: {type: String, maxlength: 1024},
  store: Object,
  storeName: {type: String, maxlength: 254},
  storeProductURL: {type: String, maxlength: 1024}
})
const Model = mongoose.model('Car', schema)

export default Model
