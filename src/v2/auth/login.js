const Global = global;
const db = require('../../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtKey = require('../../config/secretKey');
const utils = require('../../modules/utils');

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

		// 토큰 만료 기간
		Global.accExp = '30h';
		Global.refExp = '14d';

		// 토큰 발급
		const accessToken = utils.jwtSign(user, accExp);
		// jwt.sign({
		// 	type: 'JWT',
		// 	userKey: user.userKey,
		// 	name: user.name,
		// 	id: user.id,
		// }, jwtKey, {
		// 	expiresIn: '5m',
		// 	issuer: '발급자'
		// });

		const refreshToken = utils.jwtSign(user, refExp);
		// jwt.sign({
		// 	type: 'JWT',
		// 	userKey: user.userKey,
		// 	name: user.name,
		// 	id: user.id,
		// }, jwtKey, {
		// 	expiresIn: '6h',
		// 	issuer: '발급자'
		// });
		
		// 쿠키 생성
		res.cookie('board_accCookie', accessToken, { domain: 'localhost', maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
		res.cookie('board_refCookie', refreshToken, { domain: 'localhost', maxAge: 1000 * 60 * 60 * 24 * 7 * 52, httpOnly: true });

		// 로그인 상태 변경
		const sql2 = `
			UPDATE
				user_tb
			SET isLogin='Y', refreshToken=${conn.escape(refreshToken)}
			WHERE userKey=${conn.escape(user.userKey)}
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
};