const express = require('express');
const userRouter = express.Router();

// 회원 가입
userRouter.post('/', require('./post').post);
// 내 정보 조회
userRouter.get('/:userKey', verify, password, require('./get').get);
// 내 정보 수정
userRouter.patch('/:userKey', verify, password, require('./patch').patch);
// 회원 탈퇴
userRouter.delete('/:userKey', verify, password, require('./delete').delete);

module.exports = userRouter;