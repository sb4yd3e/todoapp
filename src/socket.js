module.exports = function (socket) {
	var request = require("request");
	var neo4j = require('neo4j');
	var config = require('./config').default;
	var db = new neo4j.GraphDatabase('http://'+config.neo4jUSER+':'+config.neo4jPASS+'@'+config.neo4jURL);
	var boardList = [];
	var lists = [];
	var cards = [];

	function timeConverter(date){
		var today = new Date(parseInt(date));
		var dd = today.getDate();
		var mm = today.getMonth()+1;

		var yyyy = today.getFullYear();
		if(dd<10){
			dd='0'+dd
		} 
		if(mm<10){
			mm='0'+mm
		} 
		var today = yyyy+'-'+mm+'-'+dd;
		return today;
	};
	socket.emit('init', {
		welcome:'Hello world.'
	});
	socket.on('list:boards',function(data,rs){

		db.cypher({
			query:'MATCH (b:Board)-[r:CREATE_BY]->(u:User)  RETURN ID(b),b',
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
	socket.on('list:join_boards',function(data,rs){

		db.cypher({
			query:'MATCH (u:User {id:"'+data.id+'"})-[j:JOIN]->(b:Board)  RETURN ID(b),b',
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
			query:'MATCH (b:Board)-[c:CREATE_BY]->(u:User) WHERE ID(b) = '+data.boardId+' OPTIONAL MATCH (l:List)-[r:LIVE_IN]->(b) RETURN b.title,ID(l),l ORDER BY l.position',
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
							position:value['c']['properties']['position'],
							start_date:value['c']['properties']['start_date'],
							end_date:value['c']['properties']['end_date']
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
			query:'MATCH (c:Card) WHERE ID(c) = '+data.cid+' OPTIONAL MATCH (u:User)-[j:JOIN]->(c) RETURN c,u',
		},function(err,results){
			if (err) console.log(err);
			if(results[0]){
				var data;
				var mem = [];
				var fullmem = [];
				results.forEach(function(v,i){
					data = v['c']['properties'];
					if(v['u']){
						mem.push(v['u']['properties']['id']);
						fullmem.push({id:v['u']['properties']['id'],fullName:v['u']['properties']['fullName'],avatar:v['u']['properties']['avatar'],email:v['u']['properties']['email']});
					}
				});
				rs({data:data,joinMember:mem,joinMemberFull:fullmem});
			}else{
				rs(false);
			}
		});
	});
	socket.on('delete:card',function(data,rs){
		console.log(data);
		db.cypher({
			query:'MATCH (u:User)<-[p:CREATE_BY]-(c:Card)-[i:LIVE_IN]->(l:List) WHERE u.id="'+data.uid+'" AND id(c) = '+data.cid+' OPTIONAL MATCH (c)<-[ic:LIVE_IN]-(cm:Comment)-[pc:CREATE_BY]->(u)  DELETE p,i,ic,pc,cm,c',
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
			case 'date':
			query += ' SET c.start_date = "'+data.data.start+'", c.end_date = "'+data.data.end+'" RETURN ID(c)';
			break;
			case 'drop':
			query += ' MATCH (u:User)<-[cr:CREATE_BY]-(c)  MATCH (u2:User) WHERE u2.firstName = "'+data.data.user+'" DELETE cr CREATE (c)-[c3:CREATE_BY {at_create:"'+new Date().getTime()+'"}]->(u2) SET c.start_date = "'+data.data.start+'", c.end_date = "'+data.data.end+'" RETURN ID(c)';
			break;
			case 'member':
			if(data.data.typeAction=='add'){
				query += ' MATCH (u:User {id:"'+data.data.uid+'"}) CREATE (u)-[j:JOIN]->(c) RETURN u';
			}else{
				query += ' MATCH (u:User {id:"'+data.data.uid+'"})-[j:JOIN]->(c) DELETE j RETURN ID(u)';
			}
			break;
		}
		db.cypher({
			query:query,
		},function(err,results){
			if (err) console.log(err);
			if(results[0]){
				if(data.cmd==='member' && data.data.typeAction=='add'){
					rs({id:results[0]['u']['properties']['id'],fullName:results[0]['u']['properties']['fullName'],avatar:results[0]['u']['properties']['avatar'],email:results[0]['u']['properties']['email']});
				}else{
					rs(true);
				}
				
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
	socket.on('list:members',function(data,rs){
		db.cypher({
			query:'MATCH (u:User) RETURN u',
		},function(err,results){
			if (err) console.log(err);
			if(results){
				var userList = [];
				results.forEach(function(item,index){
					userList.push({id:item['u']['properties']['id'],avatar:item['u']['properties']['avatar'],fullName:item['u']['properties']['fullName'],email:item['u']['properties']['email'],firstName:item['u']['properties']['firstName']});
				});
				rs(userList);
			}
		});
	});
	socket.on('list:events',function(data,rs){
		db.cypher({
			query:'MATCH (u2:User)<-[uc:CREATE_BY]-(c:Card)-[n:LIVE_IN]->(l:List)-[n2:LIVE_IN]->(b:Board) WHERE ID(b) = '+data.bid+' RETURN c,u2.firstName',
		},function(err,results){
			if (err) console.log(err);
			var cardList = [];
			results.forEach(function(item,index){
				if(item['c']){
					var timeDiff = Math.abs(item['c']['properties']['end_date'] - item['c']['properties']['start_date']);
					var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
					
					cardList.push({
						id:item['c']['_id'].toString(),
						title:item['c']['properties']['title'],
						duration:diffDays,
						startDate:timeConverter(item['c']['properties']['start_date']),
						resource:item['u2.firstName']
					});
				}
			});
			rs({events:cardList});
		});
	});
	socket.on('disconnect', function () {

	});
};