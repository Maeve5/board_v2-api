const jwt = require('jsonwebtoken');
const jwtKey = require('../../config/secretKey');
const moment = require('moment');

exports.token = async (req, res, next) => {

	try {
		// 유저 정보
		const accToken = req.headers.authorization;

		// 비회원
		if (!accToken || accToken === 'null') {
			res.locals.status = 200;
			res.locals.data = { isLogin: false }
			next();
		}

		// 회원
		else {
			// 토큰 검증
			const verify = jwt.verify(accToken, jwtKey);
			console.log(verify);
			const exp = moment(verify.exp*1000);
			console.log('exp', exp);
			const today = moment();
			console.log('today', today);
			const beforeExp = exp.subtract(1,'hours');
			
			// 엑세스 토큰 만료 한시간 전 ~ 만료 시간
			if ( moment(beforeExp).isSameOrBefore(today) && moment(exp).isAfter(today) ) {
				// res.locals.data = { message: '로그인 상태를 유지하시겠습니까?' };
			}

			if (error.message === 'jwt expired') {
				console.log('hi');
			}

			// 엑세스 토큰 만료
			// if ()

			res.locals.status = 200;
			res.locals.data = { isLogin: true, token: accToken, userKey: verify.userKey, userName: verify.name };
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