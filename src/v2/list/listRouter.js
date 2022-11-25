const express = require('express');
const apiStart = require('../../middleware/apiStart');
const apiEnd = require('../../middleware/apiEnd');
const verify = require('../../middleware/verify');
const storage = require('../../middleware/storage');
const upload = require('../../middleware/upload');
const listRouter = express.Router();

// 게시글 목록 조회
listRouter.get('/', apiStart, require('./gets').gets, apiEnd);
// 게시글 조회
listRouter.get('/:listKey', apiStart, verify, require('./get').get, apiEnd);
// 게시글 작성
// listRouter.post('/', apiStart, verify, upload.single('img'), require('./insert').insert, apiEnd);
listRouter.post('/', apiStart, verify, require('./insert').insert, apiEnd);
// 게시글 수정
listRouter.patch('/:listKey', apiStart, verify, require('./update').update, apiEnd);
// 게시글 삭제
listRouter.delete('/:listKey', apiStart, verify, require('./delete').delete, apiEnd);


module.exports = listRouter;