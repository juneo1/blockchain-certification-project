
/*
 * 설정 파일
 */

module.exports = {
	server_port: 3000,
	db_url: 'mongodb://localhost:27017/local',
	db_schemas: [
	    {file:'./user_schema', collection:'users6', schemaName:'UserSchema', modelName:'UserModel'},
		  {file:'./data_schema', collection:'data6', schemaName:'DataSchema', modelName:'DataModel'},
	],
	route_info: [
	   {file:'./index', path:'/new', method:'mynew', type:'get'}
	   ,{file:'./index', path:'/mypage', method:'mypage', type:'get'}
	   ,{file:'./index', path:'/upload', method:'myupload', type:'post'}
	   ,{file:'./index', path:'/hash', method:'hash', type:'get'}
	   ,{file:'./index', path:'/checknew', method:'checknew', type:'get'}
	   ,{file:'./index', path:'/checkupload', method:'checkupload', type:'post'}
	   ,{file:'./index', path:'/checkhash', method:'checkhash', type:'get'}
	   ,{file:'./index', path:'/stampid', method:'stampid', type:'get'}
	   ,{file:'./index', path:'/fileinfo/:id', method:'fileinfo', type:'get'}
	   ,{file:'./index', path:'/download', method:'download', type:'get'}
		 ,{file:'./index', path:'/saveinfo', method:'saveinfo', type:'get'}
		 ,{file:'./index', path:'/fileinfo', method:'cfileinfo', type:'get'}
		 ,{file:'./index', path:'/remove', method:'remove', type:'get'}
		 ,{file:'./index', path:'/certDownload', method:'certDownload', type: 'get'}
	]
}
