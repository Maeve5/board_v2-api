const db = require('../../config/database');

exports.delete = async (req, res, next) => {
	// `/v2/list/:listKey`

	// query
	const listKey = req.params.listKey;
	// db 연결
	const conn = await db.getConnection();

	try {
		const sql = `
			UPDATE
				list_tb
			SET
				isDelete='Y'
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