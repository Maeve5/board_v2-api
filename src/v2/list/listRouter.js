const express = require('express');
const verify = require('../../middleware/verify');
const listRouter = express.Router();

// 게시글 목록 조회
listRouter.get('/', require('./gets').gets);
// 게시글 조회
listRouter.get('/:listKey', verify, require('./get').get);
// 게시글 작성
listRouter.post('/', verify, require('./post').post);
// 게시글 수정
listRouter.patch('/', verify, require('./patch').patch);
// 게시글 삭제
listRouter.delete('/', verify, require('./delete').delete);


module.exports = listRouter;