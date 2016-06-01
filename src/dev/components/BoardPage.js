import React, { Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import CardPage from './CardPage';
import Gantt from './Gantt';
const socket = io.connect();
class BoardPage extends Component {
  static contextTypes = {
    router: PropTypes.object
  }
  constructor(props) {
    super(props);
    this.state = {
      lists: [],
      boardOldName:'',
      boardName:'',
      user_id:this.props.session.user.id,
      user_name:this.props.session.user.firstName,
      user_email:this.props.session.user.email,
      board_id:this.props.params.bordId,
      showNotification:true,
      notificationText:"กำลังดาวน์โหลด...",
      showcardpage:false,
      showgantt:false,
      card_id:''
    };

  }
  componentDidMount() {
   socket.emit('list:lists', {uid:this.props.session.user.id,boardId:this.props.params.bordId}, (result) => {
    if(result){
      this.setState({lists:result.lists,boardOldName:result.board,boardName:result.board,showNotification:false});
      document.title = this.state.boardOldName;
    }else{
      this.setState({showNotification:false});
      document.title = 'Error!!';
    }
  });
   this.setState({showgantt:true});
 }
 onEditฺBoard(e){
  e.preventDefault();
}
onCancelBoard(e){
  e.preventDefault();
  this.setState({boardName:this.state.boardOldName});
}
chageBoardName(e){
  e.preventDefault();
  var name = this.state.boardName;
  if(!name){
    return alert('กรุณาใส่ชื่อบอร์ด!!');
  }
  this.setState({showNotification:true});
  socket.emit('edit:board', {
    name:name,
    bid:this.props.params.bordId,
    uid:this.state.user_id
  }, (result) => {
    if(!result) {
      return alert("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง.");
    }else{
      this.setState({boardOldName:name,boardName:name,showNotification:false});
      document.title = name;
    }
  });
  this.setState({boardName:''});
}
nameChangeText(e){
  this.setState({boardName:e.target.value});
}
addList(data){
  var name = data.name;
  var at_create = new Date().getTime();
  socket.emit('add:list', {
    name:name,
    bid:this.state.board_id,
    uid:this.state.user_id,
    sort:(this.state.lists.length + 1),
    at_create:at_create
  }, (result) => {
    if(!result) {
      return alert("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง.");
    }else{
     var {lists} = this.state;
     lists.push({
      id:result,
      title:name
    });
     this.setState({lists:lists});
   }
 });
}
showCard(data){
  this.setState({showcardpage:data.showCard,card_id:data.idCard});
}
hideCard(data){
  this.setState({showcardpage:false,card_id:''});

}
render(){

  var editClick = this.onEditฺBoard.bind(this);
  var cancelClick = this.onCancelBoard.bind(this);
  return(
    <div>
    <div className="container">
    <div className="row">
    <div className="col-lg-12"> 
    <h4>
    <a href="#" onClick={editClick} id="boardname">{this.state.boardOldName}</a>
    <form onSubmit={this.chageBoardName.bind(this)} id="formBoard">
    <div className="input-group">
    <input type="text" className="form-control" value={this.state.boardName} onChange={this.nameChangeText.bind(this)}  required/>
    <div className="input-group-btn">
    <button className="btn btn-default" type="button" onClick={cancelClick} >ยกเลิก</button>
    <button className="btn btn-default" type="submit">บันทึก</button>
    </div>
    </div>
    </form>
    </h4>
    <hr/>
    {this.state.showgantt?<Gantt boardId={this.state.board_id} showCard={this.showCard.bind(this)} />:null}
    <hr/>
    <ListItem itemlist={this.state.lists} board_id={this.state.board_id} userid={this.state.user_id} onAddFormList={this.addList.bind(this)}  showHideCard={this.showCard.bind(this)} />
    <div className="clearfix"></div>
    {this.state.showcardpage?<CardPage cardId={this.state.card_id} hideCard={this.hideCard.bind(this)} />:null}
    </div>
    </div>
    </div>
    </div>
    );
}
}
var ListItem = React.createClass({
 getInitialState() {
  return {cardNewName: '',currentLid:'',cards:[],unGroupCard:[]};
},
componentDidMount: function() {
  $('#listSort').sortable({
    items: 'div.list',
    placeholder: "highlight col-sm-4 margin-bottom",
    update: this.handleSortableUpdate
  });
  //get all cards from board.
  socket.emit('list:card', {uid:this.props.userid,bid:this.props.board_id}, (result) => {
    if(result){
      // console.log(result);
      var items = _.groupBy(result,'list_id');
      this.setState({cards:items,unGroupCard:result});
    }
  });
},
handleSortableUpdate: function() {
  var newItems = this.props.itemlist;
  var $node = $('#listSort');
  var ids = $node.sortable('toArray', { attribute: 'data-id' });
  ids.forEach(function (i, index) {
    var elementPos = newItems.map(function(x) {return x.id;}).indexOf(parseInt(i));
    var item = newItems[elementPos];
    item.position = index;
  });
  $node.sortable('cancel');
  socket.emit('sort:list', {
    lists:newItems,
    bid:this.props.board_id,
    uid:this.props.userid
  }, (result) => {
    if(!result) {
      return alert("เกิดข้อผิดพลาดไม่สามารถบันทึกข้อมูลได้.");
    }else{
      this.setState({ items: newItems });
    }
  });
},
sortingCard:function(data){
  var cardNewItems = _.indexBy(this.state.unGroupCard,'data.id');
  var item_ids = data.data;
  var ungroup_sort = [];
  item_ids.map(function (listId, index) {
    listId.map(function(val,inx){
      ungroup_sort.push({list_id:index,data:{id:val,position:inx}});
    })
  });
  ungroup_sort.map(function(v,i){
    cardNewItems[v.data.id].list_id = v.list_id;
    cardNewItems[v.data.id].data.position = v.data.position;
    ungroup_sort[i].data.title = cardNewItems[v.data.id].data.title;
    ungroup_sort[i].data.description = cardNewItems[v.data.id].data.description;
    ungroup_sort[i].data.start_date = cardNewItems[v.data.id].data.start_date;
    ungroup_sort[i].data.end_start = cardNewItems[v.data.id].data.end_start;
  });
  var newGroupCard = _.groupBy(cardNewItems,'list_id');
  this.setState({cards:newGroupCard,unGroupCard:ungroup_sort});
},
submitList:function(data){
  this.props.onAddFormList({name:data.name});
},
onCardName:function(e){
  this.setState({cardNewName:e.target.value});
},
clickAddCard:function(lid){
 this.setState({currentLid:lid});
},
addCard:function(e){
 e.preventDefault();
 var title = this.state.cardNewName;
 if(!title){
  return alert("กรุณาใส่ชื่อการ์ด");
}
var at_create = new Date().getTime();
var position = 0;
if(this.state.cards[this.state.currentLid]){position = (this.state.cards[this.state.currentLid].length + 1)};
socket.emit('add:card', {
  title:title,
  bid:this.props.board_id,
  uid:this.props.userid,
  lid:this.state.currentLid,
  sort:position,
  at_create:at_create
}, (result) => {
  if(!result) {
    return alert("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง.");
  }else{


   var {cards} = this.state;
   if(!cards[this.state.currentLid]){
    cards[this.state.currentLid] = [];
  }
  cards[this.state.currentLid].push({
    list_id:this.state.currentLid,
    data:{
      id:result,
      title:title,
      description:"",
      position:position
    }
  });
  this.setState({cards:cards});

  //update data un group
  var {unGroupCard} = this.state;
  unGroupCard.push({
    list_id:this.state.currentLid,
    data:{
      id:result,
      title:title,
      description:"",
      position:position
    }});
  this.setState({unGroupCard});

}
this.setState({cardNewName:'',currentLid:''});
$('.formAddCard').hide();
$('.createCard').show();
});
},
showHideCard:function(data){
  this.props.showHideCard({showCard:data.showCard,idCard:data.idCard});
},
render:function(){
  var items = _.sortBy(this.props.itemlist, 'position');
  return(
    <div id="listSort">
    {
      items.map((item, i) => {
        var clickCreateCard = this.clickAddCard.bind(this,item.id);
        return (
          <div className="col-sm-4 margin-bottom list" key={item.id} data-id={item.id}>
          <div className="panel panel-default">
          <div className="panel-heading">
          <strong className="titleList">{item.title} : {item.id}</strong>
          <div className="dropdown pull-right">
          <button type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="btn btn-xs">
          <span className="caret"></span>
          </button>
          <ul className="dropdown-menu">
          <li><a href="#">คัดลอกลิส</a></li>
          <li><a href="#">ลบลิส</a></li>
          </ul>
          </div>
          </div>
          <div className="panel-body sort-card"  data-list-id={item.id}>
          <ListCards cards={this.state.cards[item.id]} onSortCard={this.sortingCard} list_id={item.id} showHideCard={this.showHideCard} />
          </div>
          <div className="createCard" onClick={clickCreateCard}>เพิ่มการ์ดใหม่</div>

          <div className="formAddCard">
          <form onSubmit={this.addCard}>
          <div className="form-group">
          <input type="text" className="form-control" placeholder="ใส่ข้อมูล" value={this.state.cardNewName} onChange={this.onCardName} required />
          </div>
          <div className="form-group">
          <button type="submit" className="btn btn-success">เพิ่ม</button> <button type="button" className="btn btn-default pull-right">ยกเลิก</button>
          </div>
          </form>
          </div>

          </div>
          </div>
          );
      })
    } 
    <FormNewList onSubmitForm={this.submitList} />
    </div>
    );
}
});
var FormNewList = React.createClass({
  getInitialState() {
    return {listname: ''};
  },
  onListNameChange:function(e){
    this.setState({listname:e.target.value});
  },
  handleSubmit:function(e){
    e.preventDefault();
    var name = this.state.listname;
    var at_create = new Date().getTime();
    if(!name){
      return alert('กรุณาใส่ชื่อ!!');
    }
    this.props.onSubmitForm({name:name});
    this.setState({listname:''});
    $('.createList').show();$('#formAddList').hide();
  },
  render:function(){

    return(
      <div className="col-sm-4 margin-bottom">
      <div className="createList">เพิ่มลิสใหม่</div>
      <div id="formAddList">
      <form onSubmit={this.handleSubmit}>
      <div className="form-group">
      <input type="text" className="form-control" value={this.state.listname} onChange={this.onListNameChange} placeholder="เพิ่มลิสใหม่" required />
      </div>
      <div className="form-group">
      <button type="submit" className="btn btn-success">ตกลง</button> <button type="button" className="btn btn-default pull-right">ยกเลิก</button>
      </div>
      </form>
      </div>
      </div>
      );
  }
});

var ListCards = React.createClass({
  componentDidMount: function() {
    $('.sort-card').sortable({
      items: 'div.card',
      placeholder: "card-placeholder",
      connectWith: ".sort-card",
      update: this.handleSortableUpdate
    }).disableSelection();
  },
  handleSortableUpdate: function(event, ui) {
    var newItems = this.props.cards;
    var $node = $('.sort-card');
    var ids = new Array();
    $node.each(function() {
      if(!ids[$(this).attr('data-list-id')]){
        ids[$(this).attr('data-list-id')] = [];
      }
      ids[$(this).attr('data-list-id')] = ids[$(this).attr('data-list-id')].concat($(this).sortable('toArray', { attribute: 'data-id' }));
    });
    $node.sortable('cancel');
    this.props.onSortCard({data:ids});
    
  },
  showCard: function(id){
    this.props.showHideCard({showCard:true,idCard:id});
  },
  render:function(){
    var items = _.sortBy(this.props.cards, 'data.position');
    // console.log(items);
    return (
      <div>
      {
        items.map((item, i) => {
          var clickShowCard = this.showCard.bind(this,item.data.id);
          return (
            <div className="card" onClick={clickShowCard} data-id={item.data.id} key={i}>{item.data.title} : {item.data.id} : {item.data.position}</div>
            );
        })
      }
      </div>
      );
    
  }
});

var Notify = React.createClass({
  render:function(){
    return (<div className="alert alert-info"><strong>รายงาน : </strong> {this.props.text}</div>);
  }
})
var Notification = React.createClass({
  render:function(){
    return (<div id="notification">{this.props.text}</div>);
  }
});
function mapStateToProps (state) {
  return { session: state.session }
}

export default connect(mapStateToProps)(BoardPage)