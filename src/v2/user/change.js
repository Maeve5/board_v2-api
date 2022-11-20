const db = require('../../config/database');
const bcrypt = require('bcrypt');

exports.change = async (req, res, next) => {
	// `/v2/user/:userKey`

	// body
	const { name, newPassword } = req.body;
	// query
	const userKey = req.params.userKey;
	// db 연결
	const conn = await db.getConnection();

	try {

		if (!userKey) {
			res.locals.status = 400;
			res.locals.data = { message: '잘못된 접근입니다.' };
			next();
			return false;
		}

		if (name) {
			const sql = `
				UPDATE
					user_tb
				SET
					name=${conn.escape(name)}
				WHERE isDelete='N' AND isLogin='Y' AND userKey=${conn.escape(userKey)}
			`;
			await conn.query(sql);
	
			res.locals.status=200;
			next();
		}

		if (newPassword) {
			// 비밀번호 암호화
			const hashingPW = await bcrypt.hash(newPassword, 10);

			// 비밀번호 변경
			const sql1 = `
				UPDATE
					user_tb
				SET
					password=${conn.escape(hashingPW)}
				WHERE isDelete='N' AND isLogin='Y' AND userKey=${conn.escape(userKey)}
			`;
			await conn.query(sql1);
	
			res.locals.status=200;
			next();
		}
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