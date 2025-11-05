const Assignment = require('../models/assignmentModel');
const ExcelJS = require('exceljs');

exports.getAssignments = async (req, res) => {
    const assignments = await Assignment.find().sort({ date: -1 });
    res.render('assignments', { assignments });
}

exports.saveAssignment = async (req, res) => {
    const {date, shift, task, members} = req.body;
    await Assignment.create({ 
        date, 
        shift, 
        task, 
        members: Array.isArray(members) ? members : [members]
         });
    res.redirect('/assignments');
};

exports.saveMulti = async (req, res) => {
  try {
    const { assignments } = req.body;

    await Assignment.insertMany(assignments.map(a => ({
      date: a.date,
      shift: a.shift,
      machine: a.machine,  // 🆕 thêm dòng này
      task: a.task,
      members: a.members
    })));

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.exportExcel = async (req, res) => {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Assignments');

  const assignments = await Assignment.find().lean();

  // Cấu trúc nhóm theo ngày, ca, thành viên
  const grouped = {};
  assignments.forEach(item => {
    const dateStr = new Date(item.date).toLocaleDateString('vi-VN');
    const shiftStr = item.shift === 'morning' ? 'Sáng' : 'Tối';

    item.members.forEach(member => {
      const key = `${dateStr}_${shiftStr}_${member}_${item.machine}`;
      if (!grouped[key]) {
        grouped[key] = {
          date: dateStr,
          shift: shiftStr,
          member,
          machine: item.machine,
          tasks: new Set()
        };
      }
      grouped[key].tasks.add(item.task);
    });
  });

  sheet.columns = [
    { header: 'Ngày', key: 'date', width: 15 },
    { header: 'Ca', key: 'shift', width: 10 },
    { header: 'Thành viên', key: 'member', width: 25 },
    { header: 'Máy', key: 'machine', width: 15 },
    { header: 'Công việc', key: 'tasks', width: 70 }
  ];

  Object.values(grouped).forEach(g => {
    sheet.addRow({
      date: g.date,
      shift: g.shift,
      member: g.member,
      machine: g.machine,
      tasks: Array.from(g.tasks).join(', ')
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=assignments.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};





