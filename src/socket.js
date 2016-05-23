module.exports = function (socket) {
	var request = require("request");
	var neo4j = require('neo4j');
	var config = require('./config').default;
	var db = new neo4j.GraphDatabase('http://'+config.neo4jUSER+':'+config.neo4jPASS+'@'+config.neo4jURL);
	var boardList = [];
	var lists = [];
	socket.emit('init', {
		welcome:'Hello world.'
	});
	socket.on('list:boards',function(data,rs){

		db.cypher({
			query:'MATCH (b:Board)-[r:CREATE_BY]->(u:User {id:"'+data.id+'"})  RETURN ID(b),b',
		},function(err,results){
			if (err) console.log(err);
			if(results){
				boardList = [];
				results.forEach(function(item,index){
					boardList.push({id:item['ID(b)'],title:item['b']['properties']['title']});
				});
				rs(boardList);
			}
		});
	});

	socket.on('get:board',function(data,rs){
		db.cypher({
			query:'MATCH (p:Project) WHERE ID(p) = '+data.id+'  RETURN p LIMIT 1',
		},function(err,results){
			if (err) console.log(err);
			if(results[0]){
				rs(results[0]['p']['properties']);
			}else{
				rs(false);
			}
		});
	});

	socket.on('add:board', function (data,fn) {
		db.cypher({
			query: 'MATCH (m:User) WHERE m.id = {id} CREATE (p:Board {title:{name}}) CREATE (p)-[:CREATE_BY {date:{at_create}}]->(m)  RETURN ID(p)',
			params: {
				id:data.id,
				name:data.name,
				at_create:data.at_create
			}
		}, function (err, results) {
			if (err) fn(false);
			fn(results[0]['ID(p)']);
		});
	});

	socket.on('edit:board', function (data,fn) {
		db.cypher({
			query: 'MATCH (b:Board)-[r:CREATE_BY]->(u:User {id:"'+data.uid+'"}) WHERE ID(b) = '+data.bid+' SET b.title = "'+data.name+'" RETURN b'
		}, function (err, results) {
			if (err) console.log(err);
			fn(true);
		});
	});

	socket.on('add:list', function (data,fn) {
		db.cypher({
			query: 'MATCH (u:User) WHERE u.id = "'+data.uid+'" MATCH (b:Board) WHERE ID(b) = '+data.bid+' CREATE (l:List {title:"'+data.name+'",position:'+data.sort+'}) CREATE (l)-[:CREATE_BY {date:"'+data.at_create+'"}]->(u),(l)-[:LIVE_IN]->(b)  RETURN ID(l)'
		}, function (err, results) {
			if (err) fn(false);
			fn(results[0]['ID(l)']);
		});
	});
	socket.on('list:lists',function(data,rs){
		db.cypher({
			query:'MATCH (b:Board)-[c:CREATE_BY]->(u:User {id:"'+data.uid+'"}) WHERE ID(b) = '+data.boardId+'  OPTIONAL MATCH (l:List)-[r:LIVE_IN]->(b) RETURN b.title,ID(l),l ORDER BY l.position',
		},function(err,results){
			if (err) console.log(err);
			if(results){
				lists = [];
				if(results[0]['l']){
					results.forEach(function(item,index){
						lists.push({id:item['l']['_id'],title:item['l']['properties']['title'],position:item['l']['properties']['position']});
					});
				}
				rs({board:results[0]['b.title'],lists:lists});
			}
		});
	});
	socket.on('sort:list', function (data,fn) {
		// console.log(data);
		var process_query = true;
		data.lists.forEach(function(value,index){
			db.cypher({
				query: 'MATCH (l:List)-[r:LIVE_IN]->(b:Board)-[c:CREATE_BY]->(u:User {id:"'+data.uid+'"}) WHERE ID(b) = '+data.bid+'  AND ID(l) = '+value.id+' SET l.position = '+value.position+' RETURN ID(l)'
			}, function (err, results) {
				if (err){
					console.log(err);
					process_query = false;
				}
			});
		});
		if(process_query) fn(true);
	});

	socket.on('disconnect', function () {
		// console.log("Disconnect!");
	});
};