const EnergyRecord = require('../models/energyRecordModel');
const ExcelJS = require('exceljs');

// 🟩 Trang nhập dữ liệu
exports.getEnergyForm = async (req, res) => {
  const machines = ["PE1","PE2","PE3","PP1","PR1","PR2","PR3","PR4","PR5",
                    "PM1","PM2","PM3","PM4","PM5","PM6","PT1","PT2","PT3","PT4","PT5"]["CB2","PE3","PE1","PC1","PP1","PR1","PR2","PR3","PR4",
                           "PR5","PR6","PM1","PM2","PM3","PM4","PM5","PM6",
                           "PT1","PT2","PT3","PT4","PT5","PC1","PC2","PC3","PC5","PE2",
                           "PB1","PB2","CB1","CD2","PD1","PD2","PS2","PS3","CCV-1","CCV-2",
                           "PI1","PI2","PA1","TI3","TS2","TE3","TC1","TS1","TA1","TD1","TE2","TL1",
                           "TE1","TT1","AS1","AS2","AD1","AC1","Trạm 1","Trạm 2","Trạm 3",
                           "Trạm 4", "Trạm 5", "Trạm 6","Trạm 7","Trạm 8", "Trạm 9","Trạm 10"];
  res.render('energyForm', { machines });
};

// 🟩 Lưu dữ liệu điện năng hằng ngày
exports.saveEnergyData = async (req, res) => {
  try {
    const { date, machines } = req.body;
    const recordDate = new Date(date);
    recordDate.setHours(0,0,0,0);

    for (const [machine, totalKwh] of Object.entries(machines)) {
      const prevRecord = await EnergyRecord.findOne({ machine })
        .sort({ date: -1 })
        .lean();

      const consumption = prevRecord ? Math.max(totalKwh - prevRecord.totalKwh, 0) : 0;

      await EnergyRecord.create({
        date: recordDate,
        machine,
        totalKwh,
        consumption
      });
    }

    res.redirect('/energy/report');
  } catch (err) {
    console.error('Lỗi khi lưu dữ liệu điện năng:', err);
    res.status(500).send('Lỗi khi lưu dữ liệu điện năng');
  }
};


// 🟩 Trang xem báo cáo
exports.getEnergyReport = async (req, res) => {
  const { fromDate, toDate, groupBy } = req.query;
  // groupBy: 'day', 'week', 'month'

  const query = {};
  if (fromDate && toDate) {
    query.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
  }

  const data = await EnergyRecord.find(query).sort({ date: 1 }).lean();

  // Gom dữ liệu theo groupBy
  const grouped = {};

  data.forEach(item => {
    let key;
    const date = new Date(item.date);
    switch(groupBy) {
      case 'week':
        const firstDayOfWeek = new Date(date);
        firstDayOfWeek.setDate(date.getDate() - date.getDay()); // CN đầu tuần
        key = firstDayOfWeek.toLocaleDateString('vi-VN');
        break;
      case 'month':
        key = `${date.getMonth()+1}/${date.getFullYear()}`;
        break;
      default:
        key = date.toLocaleDateString('vi-VN');
    }

    if (!grouped[key]) grouped[key] = {};
    grouped[key][item.machine] = (grouped[key][item.machine] || 0) + item.consumption;
  });

  res.render('energyReport', { grouped, fromDate, toDate, groupBy });
};


// 🟩 Xuất báo cáo ra Excel
exports.exportEnergyExcel = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Energy Report');

    sheet.columns = [
      { header: 'Ngày', key: 'date', width: 15 },
      { header: 'Máy', key: 'machine', width: 10 },
      { header: 'Chỉ số (kWh)', key: 'totalKwh', width: 15 },
      { header: 'Tiêu thụ (kWh)', key: 'consumption', width: 15 }
    ];

    const records = await EnergyRecord.find().sort({ date: -1, machine: 1 });
    records.forEach(r => {
      sheet.addRow({
        date: new Date(r.date).toLocaleDateString('vi-VN'),
        machine: r.machine,
        totalKwh: r.totalKwh,
        consumption: r.consumption
      });
    });

    res.setHeader('Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=energy_report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ Lỗi xuất Excel:', err);
    res.status(500).send('Lỗi xuất Excel');
  }
};
