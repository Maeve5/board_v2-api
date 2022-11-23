const express = require('express');
const apiStart = require('../../middleware/apiStart');
const apiEnd = require('../../middleware/apiEnd');
const verify = require('../../middleware/verify');
const authRouter = express.Router();

// 로그인
authRouter.post('/login', apiStart, require('./login').login, apiEnd);
// 로그아웃
authRouter.post('/logout', apiStart, require('./logout').logout, apiEnd);
// access 토큰 확인
authRouter.post('/token', apiStart, require('./token').token, apiEnd);
// refresh 토큰 확인
// authRouter.post('/refreshToken', apiStart, require('./refreshToken').token, apiEnd);
// 비밀번호 확인
authRouter.post('/password', apiStart, verify, require('./password').password, apiEnd);

module.exports = authRouter;