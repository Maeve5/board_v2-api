const express = require('express');
const authRouter = express.Router();

// 로그인
authRouter.post('/login', require('./login').login);
// 로그아웃
authRouter.post('/logout', require('./logout').logout);
// 토큰 확인
authRouter.post('/token', require('./token').token);

module.exports = authRouter;