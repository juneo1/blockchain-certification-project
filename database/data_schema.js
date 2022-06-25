/**
 * 데이터베이스 스키마를 정의하는 모듈
 */

var Schema = {};

Schema.createSchema = function(mongoose) {

	// 스키마 정의
	var DataSchema = mongoose.Schema({
			email: {type : String, 'default' : '' }
			//, name: {type:  String, index: 'hashed', ref : 'user6'}
			, filename: {type: String, 'default' : 'defaultname'}
			, filesize: {type: String}
			, hash: {type : String, 'default' : 'hashtest'}
			, txid: {type : String}
			, txData: {type : String}
			, timestamp: {type : String}
			, created_at: {type: Date, index: {unique: false}, 'default': Date.now}
		  , updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
			, upload_at : {type: String, 'default' : Date.now}
	});


	// 스키마에 인스턴스 메소드 추가
	DataSchema.methods = {
		saveData: function(callback) {		// 내용 저장
			var self = this;

			this.validate(function(err) {
				if (err) return callback(err);

				self.save(callback);
			});
		}
	}

	console.log('DataSchema 정의함.');

	return DataSchema;
	};

	// module.exports에 PostSchema 객체 직접 할당
	module.exports = Schema;
