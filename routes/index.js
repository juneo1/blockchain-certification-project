

/*#######################################################################
* #          메인 구현 기능                                              #
* #####################################################################*/

var hash_module = require('./hash.js');
var stamp_module = require('./stamp.js');
var getId_module = require('./getid.js');
var pdf_module = require('./pdf.js');
var QRCode = require('qrcode')

const multer = require('multer');
var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})

// 저장시간위한 설정
var moment = require('moment');
var nowTime = moment().format('YYYY-MM-DD HH:mm') //현재 시간


//  파일선택  화면
var mynew = function (req, res) {
  res.render('upload');
}

// 계정에서 등록한 파일목록 화면
var mypage = function (req, res) {
  var database = req.app.get('database');
  database.DataModel.find({ "email": req.user.email }, function (err, results) {
    if (err) return res.json(err);

    if (results) {
      var curLength = results.length;
      for (var i = 0; i < results.length; i++) {
        var curFilename = results[i]._doc.filename;
        var curStampTime = results[i]._doc.created_at;
      }
      var filepath = "location.href='/fileinfo/"
      res.render('list', { result: results, fp: filepath });

    }
    else {
      //res.render('list', { fn : '아직 등록된 파일이 없습니다. 등록해보세요! '});
    }
  })
}

// 파일 업로드 위한 설정
var upload = multer({ storage: _storage }).single('userfile');

// 파일 업로드 화면
var myupload = function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      return
    }
    res.cookie('filename', req.file.originalname, { signed: true });
    res.cookie('filesize', req.file.size, { signed: true });
    var filename = __dirname + '/../' + req.file.path;

    hash_module.hash(filename, function (hashResult) {
      res.cookie('hash', hashResult, { signed: true });
      res.redirect('/hash')
    })
  })
}

// 파일 해쉬값 출력 화면
var hash = function (req, res) {
  var pfilename = req.signedCookies.filename;
  //res.render('coin2', {si:req.cookies.hash} ); //쿠기 사용해서 해시값 불러옴
  var phash = req.signedCookies.hash;
  console.log('filename : ' + pfilename + ' hash : ' + phash);
  res.render('hash', { fn: pfilename, ha: phash })
}

// 원본비교 화면 이동 선택 창
var checknew = function (req, res) {
  res.render('checkupload');
}

// 원본비교 화면 설정
var checkupload = function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      return
    }
    res.cookie('filename', req.file.originalname, { signed: true });
    res.cookie('filesize', req.file.size, { signed: true });
    var filename = __dirname + '/../' + req.file.path;

    hash_module.hash(filename, function (hashResult) {
      res.cookie('chash', hashResult, { signed: true });
      res.redirect('/checkhash')
    })

  })
}

// 해시값 확인 함수
var checkhash = function (req, res) {
  var filename = req.signedCookies.filename;
  var hash = req.signedCookies.chash;        //확인하고자 하는 파일의 해시
  var temphash = req.signedCookies.temphash; //블록안의 해시
  var check;
  var database = req.app.get('database');
  var objId = req.signedCookies.objId

  // 업로드 화면에서 비교 선택할 때,
  if (objId == -1) {
    if (hash == temphash) {
      check = "Hash is correct! - 파일이 일치합니다"
    } else {
      check = "Hash is not correct! - 파일이 일치하지 않습니다"
    }
    res.render('checkhash', { fn: filename, ha: hash, th: temphash, co: check })
  }
  // 저장된 파일 비교 할 때,
  else {
    database.DataModel.findOne({ _id: objId }, function (err, result) {
      //console.log(result);
      if (err) return res.json(err);

      if (result._id == objId) {
        if (hash == result.txData) {
          check = "Hash is correct! - 파일이 일치합니다"
        } else {
          check = "Hash is not correct! - 파일이 일치하지 않습니다"
        }
        res.render('checkhash', { fn: filename, ha: hash, th: result.txData, co: check })
      }
      else { }
    })
  }
}

// 블록체인 등기 함수 , 트랜잭션 발생 함수
var stampid = function (req, res) {
  var hash = req.signedCookies.hash;

  stamp_module.stamp(hash, function (stampResult) {
    res.cookie('stampid', stampResult, { signed: true });
    res.redirect('/saveinfo')
  })
}

// 블록체인 등기 함수 , 트랜잭션 발생 함수 (임시 - 고정값)
// 트랜잭션 발생 값이 비싸서 테스트동안은 하드코딩
// var stampid = function(req, res){
//    var hash = req.signedCookies.hash;
//    var transactionId = "0427a48b51e55d07090b32b538a63b84e93586887c04a2af803d7883111d0e4c"
//    res.cookie('stampid', transactionId, {signed:true});
//    res.redirect('/saveinfo')
// }

// 등록된 파일 출력화면 함수
var coofileinfo = function (req, res) {
  var tranid = req.signedCookies.stampid;

  res.cookie('objId', -1, { signed: true }); // 디비 안들어가게 할라고

  getId_module.getId(tranid, function (idResult) {

    var outputs = idResult.outputs[0].data; //파일 해시값 뽑아옴
    res.cookie('temphash', outputs, { signed: true });

    var rtime = idResult.time;

    var homepage = 'http://watch.blocko.io/tx/';
    var member = {
      hash: req.signedCookies.hash,
      filename: req.signedCookies.filename,
      filesize: req.signedCookies.filesize,

      data: outputs,
      tx: tranid,
      time: rtime,


    };
    if (member.filesize >= 1048576) {
      member.filesize = (member.filesize / 1048576).toFixed(1) + 'MB';
    } else {
      member.filesize = (member.filesize / 1024).toFixed(1) + 'KB';
    }

    // 증명서 생성
    pdf_module.pdf(member);

    var tempfile = '/uploads/' + member.filename; //화면에 표시해주려고
    var cut1 = tempfile.indexOf('.jpg');
    var cut2 = tempfile.indexOf('.png');
    var cut3 = tempfile.indexOf('.PNG');
    var cut4 = tempfile.indexOf('.JPG');
    var cut5 = tempfile.indexOf('.gif');
    var cut6 = tempfile.indexOf('.GIF');

    var showfile;
    if (cut1 == -1 && cut2 == -1 && cut3 == -1 && cut4 == -1 && cut5 == -1 && cut6 == -1) {
      showfile = '/img/' + 'noimage.png'; //이미지 확장자가 아닐경우에
    }
    else {
      showfile = tempfile; //이미지 확장자일 경우
    }
    res.render('cfileinfo', { ha: member.hash, fn: member.filename, fs: member.filesize, si: member.tx, da: member.data, st: member.time, hp: homepage, sf: showfile });
  })
}

// DB 등록을 위한 함수
var saveinfo = function (req, res) {
  var tranid = req.signedCookies.stampid;
  var puser = req.user.email;

  getId_module.getId(tranid, function (idResult) {
    var outputs = idResult.outputs[0].data; //파일 해시값 뽑아옴
    res.cookie('temphash', outputs, { signed: true });

    var rtime = idResult.time;
    var member = {
      hash: req.signedCookies.hash,
      filename: req.signedCookies.filename,
      filesize: req.signedCookies.filesize,

      data: outputs,
      tx: tranid,
      time: rtime

    };
    if (member.filesize >= 1048576) {
      member.filesize = (member.filesize / 1048576).toFixed(1) + 'MB';
    } else {
      member.filesize = (member.filesize / 1024).toFixed(1) + 'KB';
    }

    QRCode.toFile('./img/' + member.tx + '.png', 'http://watch.blocko.io/tx/' + member.tx, function (err) {
      if (err) throw err
      console.log('done')
    })


    var database = req.app.get('database');
    var data = new database.DataModel({
      email: puser
      , hash: member.hash
      , filename: member.filename
      , filesize: member.filesize
      , txid: member.tx
      , txData: member.data
      , timestamp: member.time
      , upload_at: nowTime
    });

    data.saveData(function (err, result) {
      if (err) {
        console.log('DB데이터 추가 에러');
      }
      console.log('DB데이터 추가함');
    })

    res.redirect('/fileinfo');
  })
}

// 파일 인포 화면
var fileinfo = function (req, res) {
  res.cookie('objId', req.params.id, { signed: true });
  var database = req.app.get('database');
  console.log('fileinfo - req.param.id = ' + req.params.id);
  database.DataModel.findOne({ _id: req.params.id }, function (err, result) {
    if (err) return res.json(err);

    if (result) {

      var homepage = 'http://watch.blocko.io/tx/';
      var tempfile = '/uploads/' + result._doc.filename; //화면에 표시해주려고, 이것도 고쳐야함
      var cut1 = tempfile.indexOf('.jpg');
      var cut2 = tempfile.indexOf('.png');
      var cut3 = tempfile.indexOf('.PNG');
      var cut4 = tempfile.indexOf('.JPG');
      var cut5 = tempfile.indexOf('.gif');
      var cut6 = tempfile.indexOf('.GIF');

      var showfile;
      if (cut1 == -1 && cut2 == -1 && cut3 == -1 && cut4 == -1 && cut5 == -1 && cut6 == -1) {
        showfile = '/img/' + 'noimage.png'; //이미지 확장자가 아닐경우에
      }
      else {
        showfile = tempfile; //이미지 확장자일 경우
      }

      res.render('fileinfo', { result: result, hp: homepage, sf: showfile });
    }
    else {
      //res.render('list', { fn : '아직 등록된 파일이 없습니다. 등록해보세요! '});
    }
  })
}

// 파일 다운로드를 위한 함수
var download = function (req, res) {
  var database = req.app.get('database');
  var objId = req.signedCookies.objId

  if (objId == -1) { //그냥 쿠키일때
    var filename = req.signedCookies.filename;
    var file = __dirname + '/../uploads/' + filename;
    res.download(file);
  }
  else {
    database.DataModel.findOne({ _id: objId }, function (err, result) {
      console.log(result);
      if (err) return res.json(err);

      if (result._id == objId) {
        var filename = result.filename;
        var file = __dirname + '/../uploads/' + filename;
        res.download(file);
      }
      else { }
    })
  }
}

//증명서 다운로드를 위한 함수
var certDownload = function (req, res) {
  var database = req.app.get('database');
  var objId = req.signedCookies.objId

  database.DataModel.findOne({ _id: objId }, function (err, result) {
    var file = __dirname + '/../pdf/' + result.txid + '.pdf';
    res.download(file);
  });
}

// 파일 제거를 위한 함수
var remove = function (req, res) {
  var database = req.app.get('database');
  var objId = req.signedCookies.objId

  console.log(objId);
  if (objId == -1) { //그냥 쿠키일때
    res.redirect('/mypage');
  }

  else {
    database.DataModel.remove({ _id: objId }, function (err) {
      if (err) {
        console.log('데이터 삭제 실패');
      }
      else {
        console.log('데이터 삭제 완료');
      }
      res.redirect('/mypage');
    })
  }
}


module.exports.mypage = mypage;
module.exports.mynew = mynew;
module.exports.myupload = myupload;
module.exports.hash = hash;
module.exports.checknew = checknew;
module.exports.checkupload = checkupload;
module.exports.checkhash = checkhash;
module.exports.stampid = stampid;
module.exports.fileinfo = fileinfo;
module.exports.download = download;
module.exports.saveinfo = saveinfo;
module.exports.cfileinfo = coofileinfo;
module.exports.remove = remove;
module.exports.certDownload = certDownload;
