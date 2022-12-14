const apiStart = async (req, res, next) => {
	// console.log('apiStart', req);
	try {
		res.locals.status = 0;
		res.locals.data = null;
		next();
	}
	catch (error) {
		res.locals.error = error;
		res.status(500).json({ message: '[00] 시스템 오류가 발생했습니다.'});
	}
};

module.exports = apiStart;