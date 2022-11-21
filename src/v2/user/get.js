const db = require("../../config/database");

exports.get = async (req, res, next) => {
	// `/v2/user/:userKey`
	
	// params
	const { userKey } = req.params;
	// db 연결
	const conn = await db.getConnection();

	try {
		// 값이 없을 때
		if (!userKey) {
			res.locals.status = 400;
			res.locals.data = { message: '잘못된 접근입니다.' };
			next();
			return false;
		}

		// 회원정보 조회
		const sql = `
			SELECT
				*
			FROM user_tb
			WHERE isDelete='N' AND userKey=${conn.escape(userKey)}
		`;

		const result = await conn.query(sql);
		const user = result[0][0];

		res.locals.status = 200;
		res.locals.data = user;
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