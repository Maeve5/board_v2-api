const multer = require('multer');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		console.log('storageDestination1', req);
		console.log('storageDestination2', file);
		console.log('storageDestination3', cb);
		cb(null, '../img')
	},
	filename: (req, file, cb) => {
		console.log('storageFilename1', req);
		console.log('storageFilename2', file);
		console.log('storageFilename3', cb);
		cb(null, file.fieldname+' '+Date.now()+' '+file.originalname)
	}
})

const upload =  multer({ storage: storage });

module.exports = upload;