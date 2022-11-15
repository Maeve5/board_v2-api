const db = require('../../config/database');

exports.login = async (req, res, next) => {
	const { id, password } = req.body;
	const conn = await db.getConnection();

	try {

		if (!id) {
			res.locals.status = 400;
			res.locals.data = { message: 'id를 입력해주세요.' };
			next();
			return false;
		}
		if (!password) {
			res.locals.status = 400;
			res.locals.data = { message: '비밀번호를 입력해주세요.' };
			next();
			return false;
		}

		const result = await conn.query(`SELECT * FROM user_tb WHERE isDelete='N' AND id=?`, [id]);
		// console.log(result[0]);
		// res.send(result[0][0]);
		const data = result[0][0];
		throw { message: `${data}` };
	}
	catch (error) {
		console.log('error', error);
		res.status(500).send(error);
	}
	finally {
		await conn.release();
	}
}