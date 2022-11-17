const db = require('../../config/database');

exports.gets = async (req, res, next) => {
	// `/v2/list`
	// 파라미터
	const { pageSize, currentPage } = req.query

	// db 연결
	const conn = await db.getConnection();

	try {

		const sql = `
			SELECT T.* FROM(
				SELECT
					L.rowKey
					, L.title
					, L.description
					, DATE_FORMAT(L.createdTime, '%Y-%m-%d %H:%i') AS createdTime
					, L.userKey
					, U.name
				FROM list_tb L
				LEFT JOIN user_tb U ON L.userKey = U.userKey
				WHERE L.isDelete='N' AND U.isDelete='N'
				ORDER BY L.rowKey DESC
			) T
		`;
		
		const result = await conn.query(sql);
		const length = result[0].length;

		let sql1 = sql;
		if (pageSize && currentPage) {
			sql1 += `LIMIT ${pageSize*(currentPage-1)}, ${pageSize}`
		}
		const result1 = await conn.query(sql1);
		const list = result1[0];
		
		res.locals.status = 200;
		res.locals.data = {list, length};
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