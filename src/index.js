const express = require('express');
const ip = require('ip');
const app = express();

// request req.body 셋팅
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// 쿠키 생성
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// CORS 설정
const cors = require('cors');
app.use(
  cors({
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    origin: true,
    credentials: true
  })
);

// 라우터 설정
app.use('/v2', require('./v2/router'));

app.all('*', (req, res, next) => {
  console.log('req', req);
  if (res.status) {
    res.status(404);
  }
  res.json({ message: "BOARD API" });
});

app.listen(8083, () => {
  console.log(ip.address() + ' :: start');
});
