const Global = global;
const db = require('../config/database');
const jwt = require('jsonwebtoken');
const jwtKey = require('../config/secretKey');
const utils = require('../modules/utils');

const verify = async (req, res, next) => {

	// 토큰
	let accToken = req.cookies?.board_accCookie;
	let refToken = req.cookies?.board_refCookie;

	// console.log('accToken1 >> ', accToken);
	// console.log('refToken1 >> ', refToken);

	// 토큰이 없을 때
	if (!accToken || accToken === 'null' || !refToken || refToken === 'null') {
		if (req.body?.resolvedUrl === '/') {
			next();
		}
		res.locals.status = 400;
		res.locals.data = { message: '로그인이 필요합니다.' };
		console.log('noToken');
		next();
		return false;
	}


	// 토큰 확인
	else {

		// db 연결
		const conn = await db.getConnection();

		try {

			// access 토큰 검증
			accVerify = jwt.verify(accToken, jwtKey);

			// 사용자 정보
			Global.decoded = { userKey: accVerify.userKey, name: accVerify.name, id: accVerify.id };
			next();

		}
		catch (error) {
			console.log('verifyError >> ', error);

			if (error.message === 'jwt expired') {
				try {
					// DB에 저장된 refresh 토큰과 비교
					const sql = `
						SELECT
							refreshToken
						FROM user_tb
						WHERE userKey=${conn.escape(refVerify.userKey)}
					`;
					const result = await conn.query(sql);
					const dbToken = result[0][0].refreshToken;

					if (refToken !== dbToken) {
						res.locals.status = 401;
						res.locals.data = { message: '유효하지 않는 접근입니다.' };
						return false;
					}
					// refresh 토큰 검증
					refVerify = jwt.verify(refToken, jwtKey);

					// access 토큰 재발급
					accToken = utils.jwtSign(refVerify, accExp);
					// access 토큰값 쿠키 생성
					res.cookie('board_accCookie', accToken, { domain: 'localhost', maxAge: 1000 * 60 * 60 * 24, httpOnly: true });

					// 사용자 정보
					Global.decoded = { userKey: refVerify.userKey, name: refVerify.name, id: refVerify.id };
					next();
				}
				catch (error) {
					// refresh 토큰 만료 또는 불일치할 때 로그아웃 처리
					const sql = `
						UPDATE
							user_tb
						SET isLogin='N', refreshToken=null
						WHERE userKey=${conn.escape(userKey)}
					`;
					await conn.query(sql);

					// 쿠키 삭제
					res.cookie('board_accCookie', '', { domain: 'localhost', maxAge: -1, httpOnly: true });
					res.cookie('board_refCookie', '', { domain: 'localhost', maxAge: -1, httpOnly: true });

					res.locals.status = 401;
					res.locals.data = { message: '로그인이 유효하지 않습니다.' };
					next();
					return false;
				}
			}
			res.locals.status = 401;
			res.locals.data = { message: '로그인이 유효하지 않습니다.' };
			next();
			return false;
		}
	}
};

module.exports = verify;