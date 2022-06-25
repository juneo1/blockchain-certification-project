

/*#######################################################################
* #          PassPort 라우팅 함수 정의                                   #
* #####################################################################*/

module.exports = function(router, passport) {
    console.log('user_passport 호출됨.');

    // 홈 화면
    router.route('/main').get(function(req, res) {
        console.log('/main 패스 요청됨.');

        console.log('req.user의 정보');
        console.dir(req.user);

        // 인증 안된 경우
        if (!req.user) {
            console.log('사용자 인증 안된 상태임.');
            res.render('index', {login_success:false});
        } else {
            console.log('사용자 인증된 상태임.');
            res.render('index', {login_success:true});
        }
    });

    // 로그인 화면
    router.route('/login').get(function(req, res) {
        console.log('/login 패스 요청됨.');
        res.render('login', {message: req.flash('loginMessage')});
    });

    // 회원가입 화면
    router.route('/signup').get(function(req, res) {
        console.log('/signup 패스 요청됨.');
        res.render('signup', {message: req.flash('signupMessage')});
    });

    // 프로필 화면
    router.route('/profile').get(function(req, res) {
        console.log('/profile 패스 요청됨.');

        // 인증된 경우, req.user 객체에 사용자 정보 있으며, 인증안된 경우 req.user는 false값임
        console.log('req.user 객체의 값');
        console.dir(req.user);

        // 인증 안된 경우
        if (!req.user) {
            console.log('사용자 인증 안된 상태임.');
            res.redirect('/');
        } else {
            console.log('사용자 인증된 상태임.');
            console.log('/profile 패스 요청됨.');
            console.dir(req.user);

            if (Array.isArray(req.user)) {
                res.render('profile', {user: req.user[0]._doc});
            } else {
                res.render('profile', {user: req.user});
            }
        }
    });

    // 로그아웃
    router.route('/logout').get(function(req, res) {
        console.log('/logout 패스 요청됨.');
        req.logout();
        res.redirect('/main');
    });

    // 로그인 인증
    router.route('/login').post(passport.authenticate('local-login', {
        successRedirect : '/mypage',
        failureRedirect : '/login',
        failureFlash : true
    }));

    // 회원가입 인증
    router.route('/signup').post(passport.authenticate('local-signup', {
        successRedirect : '/main',
        failureRedirect : '/signup',
        failureFlash : true
    }));
};
