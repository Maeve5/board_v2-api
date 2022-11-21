const db = require('../../config/database');
const bcrypt = require('bcrypt');

exports.delete = async (req, res, next) => {
	// `/v2/user/userKey`

	// query
	const { password } = req.query;
	// params
	const { userKey } = req.params;
	// db 연결
	const conn = await db.getConnection();

	try {
		if (!password) {
			res.locals.status = 400;
			res.locals.data = { message: '비밀번호를 입력해주세요.' };
			next();
			return false;
		}

		const sql = `
			SELECT
				password
			FROM user_tb
			WHERE isDelete='N' AND userKey=${conn.escape(userKey)}
		`;
		const result = await conn.query(sql);
		const user = result[0][0];

		// 비밀번호 확인
		const pwCheck = bcrypt.compareSync(password, user.password);

		// 비밀번호 확인 실패
		if (!pwCheck) {
			res.locals.status = 400;
			res.locals.data = { message: '비밀번호가 일치하지 않습니다. 다시 한 번 확인해주세요.' };
			next();
			return false;
		}
		
		// 회원 탈퇴 처리
		const sql1 = `
			UPDATE
				user_tb
			SET isDelete='Y' AND isLogin='N'
			WHERE userKey=${conn.escape(userKey)}
		`;
		// const result1 = await conn.query(sql1);

		const sql2 = `
			SELECT
				rowKey
			FROM list_tb
			WHERE isDelete='N' AND userKey=${conn.escape(userKey)}
		`;
		const result2 = await conn.query(sql2);
		const rowKey = result2[0].map((row) => {
			return row.rowKey;
		})
		console.log(rowKey);

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