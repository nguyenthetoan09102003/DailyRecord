const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

router.get('/', assignmentController.getAssignments);
router.post('/save', assignmentController.saveAssignment);
router.get('/export', assignmentController.exportExcel);
router.post('/save-multi', assignmentController.saveMulti);
module.exports = router;
