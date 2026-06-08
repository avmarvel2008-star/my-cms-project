const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://my-cms-project-black.vercel.app"
  ]
}));

app.use(express.json());

const postRoutes = require('./routes/posts');
app.use('/api/posts', postRoutes);

// Add these two lines right here:
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('CMS Backend is running!');
});

app.listen(process.env.PORT, () => {
  console.log('Server started on port 5000');
});