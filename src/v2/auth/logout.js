const db = require('../../config/database');

exports.logout = async (req, res, next) => {
	// '/v2/auth/logout'

	// body
	const { userKey } = req.body;
	// db 연결
	const conn = await db.getConnection();

	try {
		// 로그인 상태 변경
		const sql = `
			UPDATE
				user_tb
			SET isLogin='N'
			WHERE userKey=${conn.escape(userKey)}
		`;
		await conn.query(sql);

		// 쿠키 삭제
		res.cookie('board_cookie', '', { domain: 'localhost', maxAge: -1, httpOnly: true });

		res.locals.status = 200;
		next();
	}
	
	catch (err) {
		console.log('error', error);
		res.locals.status = 500;
		res.locals.data = { message: '[01] 시스템 오류가 발생했습니다.' };
		next();
		return false;
	}
	finally {
		await conn.release();
	}
};