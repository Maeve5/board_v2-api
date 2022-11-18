const db = require('../../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtKey = require('../../config/secretKey');

exports.login = async (req, res, next) => {
	// `/v2/auth/login`

	// body
	const { id, password } = req.body;
	// db 연결
	const conn = await db.getConnection();

	try {

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

		// id 조회
		const sql1 = `
			SELECT
				*
			FROM user_tb
			WHERE isDelete='N' AND id=${conn.escape(id)}
		`;
		const result1 = await conn.query(sql1);
		const user = result1[0][0];

		// id 조회 실패
		if (!user) {
			res.locals.status = 400;
			res.locals.data = { message: '존재하지 않는 id입니다. 다시 한 번 확인해주세요.' };
			next();
			return false;
		}

		// 비밀번호 확인
		const pwCheck = bcrypt.compareSync(password, user.password);

		// 비밀번호 확인 실패
		if (!pwCheck) {
			res.locals.status = 400;
			res.locals.data = { message: '비밀번호가 일치하지 않습니다. 다시 한 번 확인해주세요.' };
			next();
			return false;
		}

		// 로그인 상태 변경
		const sql2 = `
			UPDATE
				user_tb
			SET isLogin='Y'
			WHERE userKey=${conn.escape(user.userKey)}
		`;
		await conn.query(sql2);

		// 토큰 발급 (24h)
		const token = jwt.sign({
			type: 'JWT',
			userKey: user.userKey,
			id: user.id
		}, jwtKey, {
			expiresIn: '24h',
			issuer: '발급자'
		});
		
		// 쿠키 생성 (1w)
		res.cookie('board_cookie', token, { domain: 'localhost', maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });

		res.locals.status = 200;
		res.locals.data = {name: user.name};
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