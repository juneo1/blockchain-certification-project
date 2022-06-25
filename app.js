
/*#######################################################################
* #          모듈 Require                                               #
* #####################################################################*/

// Express 기본 모듈 불러오기
var express = require('express')
, http = require('http')
, path = require('path');

// 익스프레스 객체 생성
var app = express();

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, static = require('serve-static')
, errorHandler = require('errorhandler');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');

// 모듈로 분리한 설정 파일 불러오기
var config = require('./config/config');

// 모듈로 분리한 데이터베이스 파일 불러오기
var database = require('./database/database');

// 모듈로 분리한 라우팅 파일 불러오기
var route_loader = require('./routes/route_loader');

// passport 모듈 불러오기
var passport = require('passport')

//LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var validator = require('express-validator');

//
var path = require('path');


/*#######################################################################
* #           기본 속성 설정                                             #
* #####################################################################*/

//===== 서버 변수 설정 및 static으로 public 폴더 설정  =====//
console.log('config.server_port : %d', config.server_port);
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// cookie-parser 설정, 라우터보다 먼저 나와야함
app.use(cookieParser('my key'));

// 세션 설정
app.use(expressSession({
  secret:'my key',
  resave:true,
  saveUninitialized:true
}));

app.use(validator()); // 인증에 사용할 것.


/*#######################################################################
* #                 Passport 사용 설정                                   #
* #####################################################################*/
// Passport의 세션을 사용할 때는 그 전에 Express의 세션을 사용하는 코드가 있어야 함
// 패스포트 초기화
app.use(passport.initialize());

 // 로그인 세션 유지
app.use(passport.session());

// 플래쉬 메시지
app.use(flash());


/*#######################################################################
* #                    View 엔진 설정                                    #
* #####################################################################*/
app.set('views', './views');
app.set('view engine', 'pug');
console.log('뷰 엔진이 pug로 설정되었습니다.');

app.locals.pretty = true;

app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(__dirname + '/bootstraptheme'));


// 경로 설정
app.use('/public', static(path.join(__dirname, 'public')));

app.use('/fileinfo/:id', express.static(__dirname + '/bootstraptheme'));

app.use('/img', express.static(__dirname + '/img'));

app.use('/uploads', express.static(__dirname + '/uploads'));


/*#######################################################################
* #           //===== 라우팅 함수 등록 =====//                           #
* #####################################################################*/

//라우팅 정보를 읽어들여 라우팅 설정
var router = express.Router();

// 라우팅 정보를 읽어들여 라우팅 설정
route_loader.init(app, router);

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
 static: {
   '404': './views/404.html'
 }
});

// 에러핸들러
app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );

// 패스포트 설정
var configPassport = require('./config/passport');
configPassport(app, passport);

// 패스포트 라우팅 설정
var userPassport = require('./routes/user_passport');
userPassport(router, passport);



//===== 서버 시작 =====//

//확인되지 않은 예외 처리 - 서버 프로세스 종료하지 않고 유지함
process.on('uncaughtException', function (err) {
	console.log('uncaughtException 발생함 : ' + err);
	console.log('서버 프로세스 종료하지 않고 유지함.');
	console.log(err.stack);
});

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

// express 서버 객체 종료
app.on('close', function () {
	console.log("Express 서버 객체가 종료됩니다.");
	if (database.db) {
		database.close();
	}
});

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

    // 데이터베이스 초기화
    database.init(app, config);

});

module.exports = app;
