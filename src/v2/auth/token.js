const db = require('../../config/database');
const jwt = require('jsonwebtoken');
const jwtKey = require('../../config/secretKey');

exports.token = async (req, res, next) => {
	// `/v2/auth/token`

	// 토큰 정보
	let token = req.headers.authorization;
	const refToken = req.body.refToken;
	// db 연결
	const conn = await db.getConnection();

	try {
		// 비회원
		if (!token || token === 'null') {
			console.log('token');
			res.locals.status = 200;
			res.locals.data = { isLogin: false };
			next();
		}

		// 회원
		else {
			// access 토큰 검증
			const verify = jwt.verify(token, jwtKey);
			
			// 사용자 이름 조회
			const sql = `
				SELECT
					name
				FROM user_tb
				WHERE isDelete='N' AND isLogin='Y' AND userKey=${conn.escape(verify.userKey)}
			`;
			const result = await conn.query(sql);
			const name = result[0][0].name;

			res.locals.status = 200;
			res.locals.data = { isLogin: true, token: token, userKey: verify.userKey, userName: name };
			next();
		}
	}
	catch (error) {
		console.log(error);
		// 만료된 토큰
		if (error.message === 'jwt expired') {
			return res.status(419).json({ isLogin: false, message: '토큰이 만료되었습니다.' });
		}
		// 유효하지 않은 토큰 (비밀키 불일치)
		else {
			console.log('error', error);
			return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
		}
	}
};