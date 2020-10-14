// eslint-disable-next-line no-undef
const express = require('express');
const app = express();

// app.use(express.static('public'));
app.use(express.static('dist'));

const port = 3000;
// eslint-disable-next-line no-unused-vars
const server = app.listen(port);
