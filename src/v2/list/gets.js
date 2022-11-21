const db = require('../../config/database');

exports.gets = async (req, res, next) => {
	// `/v2/list`

	// query
	const { pageSize, currentPage, userKey } = req.query
	// db 연결
	const conn = await db.getConnection();

	try {

		let sql = `
			SELECT T.* FROM(
				SELECT
					L.rowKey
					, L.title
					, L.description
					, DATE_FORMAT(L.createdTime, '%Y-%m-%d') AS createdTime
					, L.userKey
					, U.name
				FROM list_tb L
				LEFT JOIN user_tb U ON L.userKey = U.userKey
				WHERE L.isDelete='N' AND U.isDelete='N'
				ORDER BY L.rowKey DESC
			) T
		`;
		
		// 내가 쓴 글 조회
		if (userKey) {
			sql += `WHERE T.userKey=${conn.escape(userKey)}`
		}

		const result = await conn.query(sql);
		const length = result[0].length;

		// 페이지 별 게시글 조회
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