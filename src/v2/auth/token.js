const jwt = require('jsonwebtoken');
const jwtKey = require('../../config/secretKey');

exports.token = async (req, res, next) => {

	try {
		// 유저 정보
		const token = req.headers.authorization;

		// 비회원
		if (!token || token === 'null') {
			res.locals.status = 200;
			res.locals.data = { isLogin: false }
			next();
		}

		// 회원
		else {
			const verify = jwt.verify(token, jwtKey);
			console.log(verify);

			res.locals.status = 200;
			res.locals.data = { isLogin: true, token: token, userKey: verify.userKey, userName: verify.name };
			next();
		}
	}
	catch (error) {
		console.log(error);
		// 만료된 토큰
		if (error.message === 'jwt expired') {
			return res.status(419).json({ message: '토큰이 만료되었습니다.' });
		}
		// 유효하지 않은 토큰 (비밀키 불일치)
		else {
			return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
		}
	}
};