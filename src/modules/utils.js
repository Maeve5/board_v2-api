const db = require('../config/database');
const decode = require('jwt-decode');
const jwt = require('jsonwebtoken');
const jwtKey = require('../config/secretKey');
const utils = require('./utils');
const moment = require('moment');

// 토큰 만료 시간 계산
exports.decode = function(token) {
	const verify = decode(token);
	// 토큰 만료 시간
	const exp = moment(verify.exp * 1000);
	// 현재 시간
	const today = moment();
	// 토큰 만료까지 남은 시간
	const expTime = {
		total: exp.diff(today),
		day: moment.duration(exp.diff(today)).days(),
		hour: moment.duration(exp.diff(today)).hours(),
		minute: moment.duration(exp.diff(today)).minutes(),
		second: moment.duration(exp.diff(today)).seconds()
	};

	return [verify, expTime];
};

// 토큰 발급
exports.jwtSign = function(userSet, exp) {
	const token = jwt.sign({
		type: 'JWT',
		userKey: userSet.userKey,
		name: userSet.name,
		id: userSet.id,
	}, jwtKey, {
		expiresIn: exp,
		issuer: '발급자'
	});

	return token;
};