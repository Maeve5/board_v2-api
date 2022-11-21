const Global = global;
const jwt = require('jsonwebtoken');
const jwtKey = require('../config/secretKey');

const verify = async (req, res, next) => {

	try {
		// 유저 정보
		const accToken = req.cookies.board_accCookie;
		const refToken = req.cookies.board_refCookie;

		// 토큰이 없을 때
		if (!accToken || accToken === 'null' || !refToken || refToken === 'null') {
			res.locals.status = 400;
			res.locals.data = { message: '로그인이 필요합니다.' }
			next();
			return false;
		}

		// 토큰 확인
		else {
			Global.decoded = jwt.verify(accToken, jwtKey);
			// decoded {
			// 	type: 'JWT',
			// 	userKey: 3,
			//  name: 'c1',
			// 	id: 'c',
			// 	iat: 1668653497,
			// 	exp: 1668739897,
			// 	iss: '발급자'
			// }

			next();
		}
	}
	catch (error) {
		console.log(error);
		// 만료된 토큰
		if (error.message === 'jwt expired') {
			res.locals.status = 419;
			res.locals.data = { message: '토큰이 만료되었습니다.' };
			next();
			return false;
		}
		// 유효하지 않은 토큰 (비밀키 불일치)
		else {
			res.locals.status = 401;
			res.locals.data = { message: '토큰이 유효하지 않습니다.' };
			next();
			return false;
		}
	}
};

module.exports = verify;