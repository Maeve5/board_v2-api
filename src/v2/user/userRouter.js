const express = require('express');
const userRouter = express.Router();

userRouter.get('/', require('./get').get);

module.exports = userRouter;