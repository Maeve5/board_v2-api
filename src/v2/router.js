const express = require('express');
const baseRouter = express.Router();

// 권한 관련
baseRouter.use('/auth', require('./auth/authRouter'));
// 게시글 관련
// baseRouter.use('/list', require('./list/listRouter'));
// 회원 관련
// baseRouter.use('/user', require('./user/userRouter'));

module.exports = baseRouter;