export const express = require('express');
const cors = require('cors');
const imageRoutes = require('./routes/imageRoutes');

require('dotenv').config();

    const app = express();
    const port = process.env.PORT || 8080;

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/api/images', imageRoutes);

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });