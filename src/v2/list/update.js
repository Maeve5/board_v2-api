const db = require('../../config/database');

exports.update = async (req, res, next) => {
	// `/v2/list/:listKey`

	// body
	const { title, description } = req.body;
	// query
	const listKey = req.params.listKey;
	// db 연결
	const conn = await db.getConnection();

	try {

		if (!listKey) {
			res.locals.status = 400;
			res.locals.data = { message: '잘못된 접근입니다.' };
			next();
			return false;
		}
		if (!title) {
			res.locals.status = 400;
			res.locals.data = { message: '제목을 입력해주세요.' };
			next();
			return false;
		}
		if (!description) {
			res.locals.status = 400;
			res.locals.data = { message: '내용을 입력해주세요.' };
			next();
			return false;
		}

		const sql = `
			UPDATE
				list_tb
			SET
				title=${conn.escape(title)}
				, description=${conn.escape(description)}
			WHERE isDelete='N' AND rowKey=${conn.escape(listKey)}
		`;
		await conn.query(sql);

		res.locals.status=200;
		next();
	} 
	catch (error) {
		console.log('error', error);
		res.locals.status = 500;
		res.locals.data = { message: '[01] 시스템 오류가 발생했습니다.' };
		next();
	}
	finally {
		await conn.release();
	}
};