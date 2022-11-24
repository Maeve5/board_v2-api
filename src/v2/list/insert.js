const db = require('../../config/database');
const Global = global;

exports.insert = async (req, res, next) => {
	// `/v2/list`

	console.log(req);
	
	// body
	const { title, description } = req.body;
	// token
	const user = Global.decoded;
	// db 연결
	const conn = await db.getConnection();

	try {
		// 값이 없을 때
		if (!title) {
			res.locals.status = 400;
			res.locals.data = { message: '제목을 입력해주세요.' };
			next();
			return false;
		}
		if (!description) {
			res.locals.status = 400;
			res.locals.data = { message: '내용을 입력해주세요.' };
			next();
			return false;
		}

		// 게시글 등록
		const sql = `
			INSERT INTO list_tb (
				title
				, description
				, createdTime
				, userKey
			) VALUES (
				${conn.escape(title)}
				, ${conn.escape(description)}
				, NOW()
				, ${conn.escape(user.userKey)}
			)
		`;
		await conn.query(sql);

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