const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId },
  active: false
});

sessionSchema.set('toObject', {
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    ret.sessionId = ret._id;
    delete ret._id; // delete `_id`
    return ret;
  }
});

module.exports = mongoose.model('NewSession', sessionSchema);