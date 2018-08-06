const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  place: { type: String, required: true },
});

placeSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Places', placeSchema);