const Global = global;
const db = require("../../config/database");
const bcrypt = require('bcrypt');

const password = async (req, res, next) => {
	// `/v2/user/password`

	// body
	let { password } = req.body;
	// token
	const user = Global.decoded;
	// db 연결
	const conn = await db.getConnection();

	try {
		// 비밀번호가 없을 때
		if (!password) {
			res.locals.status = 400;
			res.locals.data = { message: '비밀번호를 입력해주세요.' };
			next();
			return false;
		}

		// 비밀번호 조회
		const sql1 = `
			SELECT
				password
			FROM user_tb
			WHERE isDelete='Y' AND userKey=${conn.escape(user.userKey)}
		`;

		// 비밀번호 확인
		const pwCheck = bcrypt.compareSync(password, user.password);

		// 비밀번호 확인 실패
		if (!pwCheck) {
			res.locals.status = 400;
			res.locals.data = { message: '비밀번호가 일치하지 않습니다. 다시 한 번 확인해주세요.' };
			next();
			return false;
		}

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

module.exports = password;