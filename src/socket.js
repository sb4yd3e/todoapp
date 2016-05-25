module.exports = function (socket) {
	var request = require("request");
	var neo4j = require('neo4j');
	var config = require('./config').default;
	var db = new neo4j.GraphDatabase('http://'+config.neo4jUSER+':'+config.neo4jPASS+'@'+config.neo4jURL);
	var boardList = [];
	var lists = [];
	var cards = [];
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
	socket.on('add:card',function(data,rs){
		db.cypher({
			query:'MATCH (u:User) WHERE u.id = "'+data.uid+'" MATCH (l:List) WHERE ID(l) = '+data.lid+' CREATE (c:Card {title:"'+data.title+'",description:"",position:'+data.sort+'}) CREATE (u)<-[:CREATE_BY {date:"'+data.at_create+'"}]-(c)-[:LIVE_IN]->(l) RETURN ID(c)',
		},function(err,results){
			if (err) console.log(err);
			// console.log(results);
			rs(results[0]['ID(c)']);
		});
	});
	socket.on('list:card',function(data,rs){
		db.cypher({
			query:'MATCH (c:Card)-[n:LIVE_IN]->(l:List)-[n2:LIVE_IN]->(b:Board) WHERE ID(b) = '+data.bid+' RETURN c,ID(l) ORDER BY c.position ASC',
		},function(err,results){
			if (err) console.log(err);
			var res = [];
			if(results[0]){
				results.forEach(function(value,index){
					var push_arr = {
						list_id:value['ID(l)'],data:
						{
							id:value['c']['_id'],
							title:value['c']['properties']['title'],
							description:value['c']['properties']['description'],
							position:value['c']['properties']['position']
						}
					};

					res.push(push_arr);
				});
			}
			// console.log(res);
			rs(res);
		});
	});
	socket.on('get:card',function(data,rs){

		db.cypher({
			query:'MATCH (c:Card) WHERE ID(c) = '+data.cid+'  RETURN c LIMIT 1',
		},function(err,results){
			if (err) console.log(err);
			if(results[0]){
				rs(results[0]['c']['properties']);
			}else{
				rs(false);
			}
		});
	});
	socket.on('delete:card',function(data,rs){
		db.cypher({
			query:'MATCH (u:User)<-[p:CREATE_BY]-(c:Card)-[i:LIVE_IN]->(l:List),(c)<-[ic:LIVE_IN]-(cm:Comment)-[pc:CREATE_BY]->(u) WHERE u.id="'+data.uid+'" AND id(c) = '+data.cid+' DELETE p,i,ic,pc,cm,c',
		},function(err,results){
			if (err) console.log(err);
			rs(true);
		});
	});
	socket.on('save:card',function(data,rs){
		var query = 'MATCH (c:Card) WHERE ID(c) = ' + data.cid;
		switch(data.cmd) {
			case 'title':
			query += ' SET c.title = "'+data.data.title+'" RETURN ID(c)';
			break;
			case 'desc':
			query += ' SET c.detail = "'+data.data.detail+'" RETURN ID(c)';
			break;
		}
		db.cypher({
			query:query,
		},function(err,results){
			if (err) console.log(err);
			if(results[0]){
				rs(true);
			}else{
				rs(false);
			}
		});
	});
	socket.on('add:comment',function(data,rs){
		db.cypher({
			query:'MATCH (u:User) WHERE u.id = "'+data.uid+'" MATCH (l:Card) WHERE ID(l) = '+data.cid+' CREATE (c:Comment {message:"'+data.data+'"}) CREATE (u)<-[:CREATE_BY {date:"'+data.at_create+'"}]-(c)-[:LIVE_IN]->(l) RETURN ID(c),u.firstName,u.id',
		},function(err,results){
			if (err) console.log(err);
			rs(results[0]);
		});
	});
	socket.on('delete:comment',function(data,rs){
		db.cypher({
			query:'MATCH (u:User)<-[p:CREATE_BY]-(c:Comment)-[i:LIVE_IN]->(l:Card) WHERE u.id = "'+data.uid+'" AND ID(c)='+data.cid+' DELETE p,c,i',
		},function(err,results){
			if (err) console.log(err);
			rs(true);
		});
	});
	socket.on('list:comment',function(data,rs){
		db.cypher({
			query:'MATCH (u:User)<-[a:CREATE_BY]-(c:Comment)-[n:LIVE_IN]->(l:Card) WHERE ID(l) = '+data.cid+' RETURN u.firstName,u.id,c,a.date ORDER BY a.date ASC',
		},function(err,results){
			if (err) console.log(err);
			var res = [];
			if(results[0]){
				results.forEach(function(value,index){
					var push_arr = {
						comment_id:value['c']['_id'],
						message:value['c']['properties']['message'],
						uid:value['u.id'],
						user:value['u.firstName'],
						at_create:value['a.date']
					};
					res.push(push_arr);
				});
			}
			rs(res);
		});
	});
	socket.on('disconnect', function () {

	});
};