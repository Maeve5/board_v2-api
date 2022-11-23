const jwt = require('jsonwebtoken');
const jwtKey = require('../config/secretKey');
const moment = require('moment');

// 토큰 만료 시간 계산
exports.expTime = function(verifiedToken) {
	// 토큰 만료 시간
	const exp = moment(verifiedToken.exp * 1000);
	// 현재 시간
	const today = moment();
	// 토큰 만료까지 남은 시간
	const expTime = {
		day: moment.duration(exp.diff(today)).days(),
		hour: moment.duration(exp.diff(today)).hours(),
		minute: moment.duration(exp.diff(today)).minutes(),
		second: moment.duration(exp.diff(today)).seconds()
	};

	return expTime;
}

// 토큰 발급
exports.jwtSign = function(user, exp) {
	const token = jwt.sign({
		type: 'JWT',
		userKey: user.userKey,
		name: user.name,
		id: user.id,
	}, jwtKey, {
		expiresIn: exp,
		issuer: '발급자'
	});

	return token;
}