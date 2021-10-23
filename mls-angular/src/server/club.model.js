const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const clubSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    scores: Array,
    id: String,
    club: String
  },
  {
    collection: 'fixtures'
  }
);

const Club = mongoose.model('Club', clubSchema);

module.exports = Club;