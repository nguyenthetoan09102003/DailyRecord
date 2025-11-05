const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const mongoose = require('mongoose');

//Routes


const assignmentRoutes = require('./routes/assignmentRoutes');
const queryRoutes = require('./routes/queryRoutes');

const energyRoutes = require('./routes/energyRoutes');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.redirect('/assignments'));
app.use('/query', queryRoutes);
app.use('/energy', energyRoutes);
app.use('/assignments', assignmentRoutes);


mongoose.connect('mongodb://localhost:27017/DailyRecord', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB error:', err));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
