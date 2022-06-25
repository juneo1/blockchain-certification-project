

/*#######################################################################
* #         파일 해쉬화를 위한 함수                                       #
* #####################################################################*/

var fs = require('fs');
var crypto = require('crypto');
var algorithm = 'sha256';

var hash = function(filename, callback){
  var shasum = crypto.createHash(algorithm);
  var s = fs.ReadStream(filename);

  s.on('data', function(data) {
    shasum.update(data)
  })
  s.on('end', function() {
    var hash = shasum.digest('hex')
    console.log(hash);
    callback(hash);
  })
}
exports.hash = hash;
