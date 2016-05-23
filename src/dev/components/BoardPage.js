import React, { Component, PropTypes} from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
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
      notificationText:"กำลังดาวน์โหลด..."
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
    <ListItem itemlist={this.state.lists} board_id={this.state.board_id} userid={this.state.user_id} onAddFormList={this.addList.bind(this)} />
    <div className="clearfix"></div>
    </div>
    </div>
    </div>
    </div>
    );
}
}
var ListItem = React.createClass({
  componentDidMount: function() {
    $('#listSort').sortable({
      items: 'div.list',
      placeholder: "highlight col-sm-4 margin-bottom",
      update: this.handleSortableUpdate
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
  submitList:function(data){
    this.props.onAddFormList({name:data.name});
  },
  render:function(){
    var items = _.sortBy(this.props.itemlist, 'position');
    // console.log(items);
    return(
      <div id="listSort">
      {
        items.map((item, i) => {
          return (
            <div className="col-sm-4 margin-bottom list" key={item.id} data-id={item.id}>
            <div className="panel panel-default">
            <div className="panel-heading">
            <strong className="titleList">{item.title}</strong>
            <div className="dropdown pull-right">
            <button type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="btn btn-xs">
            <span className="caret"></span>
            </button>
            <ul className="dropdown-menu">
            <li><a href="#">เพิ่มการ์ด</a></li>
            <li><a href="#">คัดลอกลิส</a></li>
            <li><a href="#">ลบลิส</a></li>
            </ul>
            </div>
            </div>
            <div className="panel-body">
            <div className="createCard">เพิ่มการ์ดใหม่</div>
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