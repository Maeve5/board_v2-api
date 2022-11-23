const Global = global;
const jwt = require('jsonwebtoken');
const jwtKey = require('../config/secretKey');
const moment = require('moment');

const verify = async (req, res, next) => {

	// 유저 정보
	let accToken = req.cookies?.board_accCookie;
	let refToken = req.cookies?.board_refCookie;

	// 현재 시간
	const today = moment();

	// try {

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
			const verify = jwt.verify(accToken, jwtKey);
			// access 토큰 만료 시간
			const exp = moment(verify.exp * 1000);
			// access 토큰 만료까지 남은 시간
			const expTime = {
				hour: moment.duration(exp.diff(today)).hours(),
				minute: moment.duration(exp.diff(today)).minutes(),
				second: moment.duration(exp.diff(today)).seconds()
			};
			console.log('accExpTime', expTime.hour + '시간' + expTime.minute + '분' + expTime.second + '초');

			// access 토큰 만료 30m 전 토큰 재발급
			if (expTime.hour === 0 && expTime.minute < 30) {
				accToken = jwt.sign({
					type: 'JWT',
					userKey: verify.userKey,
					name: verify.name,
					id: verify.id,
				}, jwtKey, {
					expiresIn: '10s',
					issuer: '발급자'
				});

				// access 토큰값 쿠키 생성
				res.cookie('board_accCookie', accToken, { domain: 'localhost', maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
			}
			console.log('accToken1', accToken);
			Global.decoded = { userKey: verify.userKey, name: verify.name, id: verify.id };
			next();
		}
		catch (error) {
			console.log('error111', error);

			// access 토큰 만료
			if (error.message === 'jwt expired') {

				try {
					// refresh 토큰 검증
					const verify = jwt.verify(refToken, jwtKey);
					// refresh 토큰 만료 시간
					const exp = moment(verify.exp * 1000);
					// refresh 토큰 만료까지 남은 시간
					const expTime = {
						day: moment.duration(exp.diff(today)).days(),
						hour: moment.duration(exp.diff(today)).hours(),
						minute: moment.duration(exp.diff(today)).minutes(),
						second: moment.duration(exp.diff(today)).seconds()
					};
					console.log('refExpTime', expTime.day + '일' + expTime.hour + '시간' + expTime.minute + '분' + expTime.second + '초');

					// access 토큰 재발급
					accToken = jwt.sign({
						type: 'JWT',
						userKey: verify.userKey,
						name: verify.name,
						id: verify.id,
					}, jwtKey, {
						expiresIn: '10s',
						issuer: '발급자'
					});

					// 쿠키 생성
					res.cookie('board_accCookie', accToken, { domain: 'localhost', maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });

					// refresh 토큰 만료 1h 전 토큰 재발급
					if (expTime.day === 0 && expTime.hour === 0) {
						refToken = jwt.sign({
							type: 'JWT',
							userKey: verify.userKey,
							name: verify.name,
							id: verify.id,
						}, jwtKey, {
							expiresIn: '11s',
							issuer: '발급자'
						});

						// 쿠키 생성
						res.cookie('board_refCookie', refToken, { domain: 'localhost', maxAge: 1000 * 60 * 60 * 24 * 7 * 52, httpOnly: true });
					}
					console.log('accToken2', accToken);
					console.log('refToken2', refToken);
					Global.decoded = { userKey: verify.userKey, name: verify.name, id: verify.id };
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