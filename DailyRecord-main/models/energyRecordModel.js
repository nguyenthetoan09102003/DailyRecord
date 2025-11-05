const mongoose = require('mongoose');

const energyRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },       // ngày ghi nhận
  machine: { type: String, required: true },  // tên máy
  totalKwh: { type: Number, required: true },// chỉ số hiện tại
  consumption: { type: Number, required: true } // tiêu thụ trong ngày
});

module.exports = mongoose.model('EnergyRecord', energyRecordSchema);
