const express = require('express');
const apiStart = require('../../middleware/apiStart');
const apiEnd = require('../../middleware/apiEnd');
const verify = require('../../middleware/verify');
const listRouter = express.Router();

// 게시글 목록 조회
listRouter.get('/', apiStart, require('./gets').gets, apiEnd);
// 게시글 조회
// listRouter.get('/:listKey', verify, require('./get').get);
// 게시글 작성
listRouter.post('/', apiStart, verify, require('./insert').insert, apiEnd);
// 게시글 수정
// listRouter.patch('/', verify, require('./update').update);
// 게시글 삭제
// listRouter.delete('/', verify, require('./delete').delete);


module.exports = listRouter;