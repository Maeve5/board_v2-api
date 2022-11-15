const mysql = require('mysql');

const db = mysql.createPool({
	host: '127.0.0.1',
	port: '3306',
	user: 'root',
	password: '12341234',
	database: 'prj_board',
	connectionLimit: 1000
});

module.exports = db;