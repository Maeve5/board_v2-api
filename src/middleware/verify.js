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

			// access 토큰, 만료 시간
			const [accVerify, accExpTime] = utils.decode(accToken);
			console.log('accExpTime', accExpTime.hour + '시간' + accExpTime.minute + '분' + accExpTime.second + '초');
			// console.log('accExpTime', accExpTime.total);

			// refresh 토큰, 만료 시간
			const [refVerify, refExpTime] = utils.decode(refToken);
			console.log('refExpTime', refExpTime.day + '일' + refExpTime.hour + '시간' + refExpTime.minute + '분' + refExpTime.second + '초');
			// console.log('refExpTime', refExpTime.total);

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


			
			// access 토큰만 만료
			if (accExpTime.total <= 0 && refExpTime.total > 0) {
				// refresh 토큰 검증
				const verify = jwt.verify(refToken, jwtKey);
				// access 토큰 재발급
				accToken = utils.jwtSign(verify, accExp);
				// access 토큰값 쿠키 생성
				res.cookie('board_accCookie', accToken, { domain: 'localhost', maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
			}

			// refresh 토큰 만료 시 로그아웃
			if (refExpTime.total <= 0 ) {
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

				res.locals.status = 419;
				res.locals.data = { message: '로그인 시간이 만료되었습니다. 다시 로그인 해주세요.' };
				next();
				return false;
			}



			// access 토큰 검증
			jwt.verify(accToken, jwtKey);
			// refresh 토큰 검증
			jwt.verify(refToken, jwtKey);



			// access 토큰 만료 5m 전 토큰 재발급
			if (accExpTime.hour === 0 && accExpTime.minute < 5) {
				// access 토큰 재발급
				accToken = utils.jwtSign(accVerify, accExp);
				// access 토큰값 쿠키 생성
				res.cookie('board_accCookie', accToken, { domain: 'localhost', maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
				// console.log('accToken2 >> ', accToken);
			}

			// refresh 토큰 만료 1h 전 토큰 재발급
			if (refExpTime.day === 0 && refExpTime.hour === 0) {
				// refresh 토큰 재발급
				refToken = utils.jwtSign(refVerify, refExp);
				// 쿠키 생성
				res.cookie('board_refCookie', refToken, { domain: 'localhost', maxAge: 1000 * 60 * 60 * 24 * 7 * 4, httpOnly: true });
				// 재발급한 refresh 토큰 DB 저장
				const sql1 = `
					UPDATE
						user_tb
					SET refreshToken=${conn.escape(refToken)}
					WHERE userKey=${conn.escape(refVerify.userKey)}
				`;
				await conn.query(sql1);
				// console.log('refToken2 >> ', refToken);
			}
			

		
			// 사용자 정보
			Global.decoded = { userKey: accVerify.userKey, name: accVerify.name, id: accVerify.id };
			next();
		}
		catch (error) {
			console.log('verifyError >> ', error);
			// 유효하지 않은 토큰 (비밀키 불일치)
			res.locals.status = 401;
			res.locals.data = { message: '로그인이 유효하지 않습니다.' };
			next();
			return false;
		}
	}
};

module.exports = verify;