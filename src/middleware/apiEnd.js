const apiEnd = async (req, res, next) => {
	try {
		res.status(res.locals.status === 0 ? 500 : res.locals.status).send(res.locals.data);
		console.log('1');
	}
	catch (error) {
		res.locals.error = error;
		console.log('2');
		res.status(500).send({ message: '[02] 시스템 오류가 발생했습니다.'})
	}
};

module.exports = apiEnd;