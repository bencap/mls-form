const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const clubSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    scores: Array,
    id: String,
    club: String,
    GD: Number,
    xGD: Number,
    GA: Number,
    xGA: Number,
    GF: Number,
    xGF: Number,
    PF: Number,
    MP: Number,
    W: Number,
    D: Number,
    L: Number,

  },
  {
    collection: 'fixtures'
  }
);

const Club = mongoose.model('Club', clubSchema);

module.exports = Club;