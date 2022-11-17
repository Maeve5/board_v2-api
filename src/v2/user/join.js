const db = require('../../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtKey = require('../../config/secretKey');

exports.join = async (req, res, next) => {
	// `/v2/user`

	// body
	const { name, id, password } = req.body;
	// db 연결
	const conn = await db.getConnection();

	try {

		if (!name) {
			res.locals.status = 400;
			res.locals.data = { message: '이름을 입력해주세요.' };
			next();
			return false;
		}
		if (!id) {
			res.locals.status = 400;
			res.locals.data = { message: 'id를 입력해주세요.' };
			next();
			return false;
		}
		if (!password) {
			res.locals.status = 400;
			res.locals.data = { message: '비밀번호를 입력해주세요.' };
			next();
			return false;
		}

		// id 중복조회
		const sql1 = `
			SELECT
				id
			FROM user_tb
			WHERE isDelete='N' AND id=${conn.escape(id)}
		`;
		const result1 = await conn.query(sql1);

		if (result1[0].length !== 0) {
			res.locals.status = 400;
			res.locals.data = { message: '사용중인 id입니다. 다른 id를 입력해주세요.' };
			next();
			return false;
		}

		// 비밀번호 암호화
		const hashingPW = await bcrypt.hash(password, 10);

		// 회원가입
		const sql2 = `
			INSERT INTO user_tb (
				id
				, name
				, password
			) VALUES (
				${conn.escape(id)}
				, ${conn.escape(name)}
				, ${conn.escape(hashingPW)}
			)
		`;
		await conn.query(sql2);

		res.locals.status = 200;
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
}