
/*#######################################################################
* #          Coinstack API , 거래정보 조회                               #
* #####################################################################*/

var CoinStack = require('coinstack-sdk-js');
var accessKey = "";
var secretKey = "";
var client = new CoinStack(accessKey, secretKey);

var getId = function(tranid, callback){
  client.getTransaction(tranid, function(err, result){
    //console.log(result);
    callback(result);
  });
}

exports.getId = getId;
