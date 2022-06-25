

/*#######################################################################
* #          블록체인 등기를 위한 스탬프 생성                             #
* #####################################################################*/

// coinstack sdk
var CoinStack = require('coinstack-sdk-js');
var accessKey = "";
var secretKey = "";
var client = new CoinStack(accessKey, secretKey);

// bitcoin wallet info
var privateKey =""
var address = ""

var stamp = function(hash, callback){
  var txBuilder = client.createTransactionBuilder(); //트랜잭션 생성
  txBuilder.setInput(address);
  txBuilder.setDataOutput(hash); //블록에 등록할 해시값
  txBuilder.buildTransaction(function(err, tx) {
     if (err) return console.error(err);
      tx.sign(privateKey)
      var rawTx = tx.serialize()
      console.log(tx);
      console.log(rawTx);
      // send tx
      client.sendTransaction(rawTx, function(err) {
          if (null != err) {
              console.log("failed to send tx"+err);
          }
         var transactionId = CoinStack.Transaction.fromHex(rawTx).getHash();
         console.log("트랜잭션 ID : "+transactionId);
         callback(transactionId);
      });
  });
}

exports.stamp = stamp;
