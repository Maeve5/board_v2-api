const db = require('../../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtKey = require('../../config/secretKey');
const Global = global;

exports.change = async (req, res, next) => {
	// `/v2/user/:userKey`

	// body
	const { name, newPassword } = req.body;
	// query
	const userKey = req.params.userKey;
	// token
	let token = Global.decoded;
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
		
		// 이름 변경
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

		// 비밀번호 변경
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