const apiEnd = async (req, res, next) => {
	try {
		res.status(res.locals.status === 0 ? 500 : res.locals.status).send(res.locals.data);
	}
	catch (error) {
		res.locals.error = error;
		res.status(500).send({ message: '[03]시스템 오류가 발생했습니다.'})
	}
};

module.exports = apiEnd;