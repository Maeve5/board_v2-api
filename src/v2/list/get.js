const db = require('../../config/database');
const Global = global;

exports.get = async (req, res, next) => {
	// `/v2/list/:listKey`

	// params
	const listKey = req.params.listKey;
	// token
	const user = Global.decoded;
	// db 연결
	const conn = await db.getConnection();

	try {
		let sql = `
			SELECT
				L.rowKey
				, L.title
				, L.description
				, L.userKey
				, U.id
				, U.name
			FROM list_tb L
			LEFT JOIN user_tb U ON L.userKey = U.userKey
			WHERE L.isDelete='N' AND U.isDelete='N'
		`;

		// 게시글 조회
		if (listKey) {
			sql += `AND L.rowKey=${conn.escape(listKey)}`;
		}

		const result = await conn.query(sql);
		const post = result[0][0];

		// 게시글 조회 실패
		if (!post) {
			res.locals.status = 400;
			res.locals.data = { message: '존재하지 않는 게시글입니다.' };
			next();
			return false;
		}

		res.locals.status = 200;
		res.locals.data = {...post};
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