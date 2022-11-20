const express = require('express');
const apiStart = require('../../middleware/apiStart');
const apiEnd = require('../../middleware/apiEnd');
const verify = require('../../middleware/verify');
const userRouter = express.Router();

// 회원 가입
userRouter.post('/join', apiStart, require('./join').join, apiEnd);
// 비밀번호 확인
userRouter.post('/password', apiStart, verify, require('./password').password, apiEnd);
// 회원 정보 조회
userRouter.get('/:userKey', apiStart, verify, require('./get').get, apiEnd);
// 회원 정보 수정
// userRouter.patch('/:userKey', apiStart, verify, require('./patch').patch, apiEnd);
// 회원 탈퇴
// userRouter.delete('/:userKey', apiStart, verify, require('./delete').delete, apiEnd);

module.exports = userRouter;