// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
// const { User } = require('./database/models');

const userRoutes = require("./routes/user.routes");

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3001;

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello' });
})

app.use('/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server successfully started on port ${PORT}`)
})