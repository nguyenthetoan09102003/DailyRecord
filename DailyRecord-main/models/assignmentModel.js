const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  shift: { type: String, enum: ['morning', 'evening'], required: true },
  machine: {type: String, require: true},
  task: { type: String, required: true },
  members: [String]
  });

module.exports = mongoose.model('Assignment', assignmentSchema);
