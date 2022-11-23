const Global = global;
const jwt = require('jsonwebtoken');
const jwtKey = require('../config/secretKey');
const accExp = require('../config/accExpTime');
const refExp = require('../config/refExpTime');
const utils = require('../modules/utils');

const verify = async (req, res, next) => {

	// 유저 정보
	let accToken = req.cookies?.board_accCookie;
	let refToken = req.cookies?.board_refCookie;

	// 토큰이 없을 때
	if (!accToken || accToken === 'null' || !refToken || refToken === 'null') {
		res.locals.status = 400;
		res.locals.data = { message: '로그인이 필요합니다.' };
		console.log('noToken');
		next();
		return false;
	}

	// 토큰 확인
	else {

		try {
			// access 토큰 검증
			const accVerify = jwt.verify(accToken, jwtKey);
			// access 토큰 만료까지 남은 시간
			const accExpTime = utils.expTime(accVerify);

			console.log('accExpTime', accExpTime.hour + '시간' + accExpTime.minute + '분' + accExpTime.second + '초');

			// access 토큰 만료 30m 전 토큰 재발급
			if (accExpTime.hour === 0 && accExpTime.minute < 30) {
				accToken = utils.jwtSign(accVerify, accExp);

				// access 토큰값 쿠키 생성
				res.cookie('board_accCookie', accToken, { domain: 'localhost', maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
			}
			console.log('accToken1', accToken);
			Global.decoded = { userKey: accVerify.userKey, name: accVerify.name, id: accVerify.id };
			next();
		}
		catch (error) {
			console.log('error111', error);

			// access 토큰 만료
			if (error.message === 'jwt expired') {

				try {
					// refresh 토큰 검증
					const refVerify = jwt.verify(refToken, jwtKey);
					// refresh 토큰 만료까지 남은 시간
					const refExpTime = utils.expTime(refVerify);

					console.log('refExpTime', refExpTime.day + '일' + refExpTime.hour + '시간' + refExpTime.minute + '분' + refExpTime.second + '초');

					// access 토큰 재발급
					accToken = utils.jwtSign(refVerify, accExp);

					// 쿠키 생성
					res.cookie('board_accCookie', accToken, { domain: 'localhost', maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });

					// refresh 토큰 만료 1h 전 토큰 재발급
					if (refExpTime.day === 0 && refExpTime.hour === 0) {
						refToken = utils.jwtSign(refVerify, refExp);

						// 쿠키 생성
						res.cookie('board_refCookie', refToken, { domain: 'localhost', maxAge: 1000 * 60 * 60 * 24 * 7 * 52, httpOnly: true });
					}
					console.log('accToken2', accToken);
					console.log('refToken2', refToken);
					Global.decoded = { userKey: refVerify.userKey, name: refVerify.name, id: refVerify.id };
					next();
				}
				catch (error) {
					console.log('error3', error);
					// refresh 토큰 만료
					if (error.message === 'jwt expired') {
						// 쿠키 삭제
						res.cookie('board_accCookie', '', { domain: 'localhost', maxAge: -1, httpOnly: true });
						res.cookie('board_refCookie', '', { domain: 'localhost', maxAge: -1, httpOnly: true });

						res.status(419).json({ isLogin: false, message: '로그인 시간이 만료되었습니다.' });
						return false;
					}
					// 유효하지 않은 토큰 (비밀키 불일치)
					else {
						console.log('error33');
						throw new Error();
					}
				}

			}
			// 유효하지 않은 토큰 (비밀키 불일치)
			else {
				console.log('error111error');
				// if (error.message === 'jwt expired') {
				// 		res.status(419).json({ message: '로그인 시간이 만료되었습니다.' });
				// 		return false;
				// 	}
				throw new Error();
			}
		}
	}
	// }
	// catch (error) {
	// 	console.log('d', error);
	// 	// 만료된 토큰
	// 	if (error.message === 'jwt expired') {
	// 		res.locals.status = 419;
	// 		res.locals.data = { message: '로그인 시간이 만료되었습니다.' };
	// 		next();
	// 		return false;
	// 	}
	// 	// 유효하지 않은 토큰 (비밀키 불일치)
	// 	else {
	// 		res.locals.status = 401;
	// 		res.locals.data = { message: '로그인이 유효하지 않습니다.' };
	// 		next();
	// 		return false;
	// 	}
	// }
};

module.exports = verify;