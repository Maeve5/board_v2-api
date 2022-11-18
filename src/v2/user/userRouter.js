const express = require('express');
const apiStart = require('../../middleware/apiStart');
const apiEnd = require('../../middleware/apiEnd');
const verify = require('../../middleware/verify');
const password = require('../../middleware/password');
const userRouter = express.Router();

// 회원 가입
userRouter.post('/', apiStart, require('./join').join, apiEnd);
// 회원 정보 조회
userRouter.get('/:userKey', apiStart, verify, password, require('./get').get, apiEnd);
// 회원 정보 수정
// userRouter.patch('/:userKey', apiStart, verify, password, require('./patch').patch, apiEnd);
// 회원 탈퇴
// userRouter.delete('/:userKey', apiStart, verify, password, require('./delete').delete, apiEnd);

module.exports = userRouter;