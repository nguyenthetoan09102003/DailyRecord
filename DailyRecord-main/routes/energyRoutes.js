const express = require('express');
const router = express.Router();
const energyController = require('../controllers/energyController');

// Hiển thị form nhập dữ liệu điện năng
router.get('/', energyController.getEnergyForm);

// Lưu dữ liệu điện năng hàng ngày
router.post('/save', energyController.saveEnergyData);

// Hiển thị báo cáo
router.get('/report', energyController.getEnergyReport);

// Xuất báo cáo Excel
router.get('/export', energyController.exportEnergyExcel);

module.exports = router;
