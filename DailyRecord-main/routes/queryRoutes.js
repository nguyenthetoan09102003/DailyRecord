const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

router.get('/', queryController.getQueryPage);
router.get('/filter', queryController.filterAssignments);
router.get('/export', queryController.exportFilteredExcel);

module.exports = router;
