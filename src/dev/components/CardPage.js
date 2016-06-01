import React, { Component, PropTypes} from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import DateRangePicker from 'react-daterange-picker';
import ListMembers from './ListMembers';
import moment from 'moment';
import {} from 'moment-range';

const socket = io.connect();

class CardPage extends Component {
  static contextTypes = {
    router: PropTypes.object
  }
  constructor(props) {
    super(props);
    this.state = {
      cardData:{data:[],joinMember:[],joinMemberFull:[]},
      newTitle:'',
      newDesc:''
    };

  }
  componentDidMount() {
   socket.emit('get:card', {
    cid:this.props.cardId
  }, (result) => {
    if(!result) {
      return alert("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง.");
    }else{
      this.setState({
        cardData:result,
        newTitle:result.data.title,
        newDesc:result.data.detail,
        showCalendar:false,
        showMembers:false
      });
    }
  });
 }
 hideCard(){
  this.props.hideCard({false});
}
onChangeTitle(e){
  this.setState({newTitle:e.target.value});
}
onCancelTitle(){
  this.setState({newTitle:this.state.cardData.data.title});
}
changeTitle(e){
  e.preventDefault();
  socket.emit('save:card', {
    cid:this.props.cardId,
    data:{title:this.state.newTitle},
    cmd:'title'
  }, (result) => {
    if(!result) {
      return alert("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง.");
    }else{
      var {cardData} = this.state;
      cardData.data.title = this.state.newTitle;
      this.setState({cardData});
    }
  });
}

onChangeDesc(e){
  this.setState({newDesc:e.target.value});
}
onCancelDesc(){
  this.setState({newDesc:this.state.cardData.data.detail});
}
changeDesc(e){
  e.preventDefault();
  socket.emit('save:card', {
    cid:this.props.cardId,
    data:{detail:this.state.newDesc},
    cmd:'desc'
  }, (result) => {
    if(!result) {
      return alert("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง.");
    }else{
      var {cardData} = this.state;
      cardData.data.detail = this.state.newDesc;
      this.setState({cardData});
    }
  });
}
deleteCard(){
  socket.emit('delete:card', {
    cid:this.props.cardId,
    uid:this.props.session.user.id
  }, (result) => {
    if(!result) {
      return alert("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง.");
    }else{
     this.props.hideCard({false});
   }
 });
}
onChangeDate(range) {
  var start = new Date(range.start.format('LL')).getTime();
  var end = new Date(range.end.format('LL')).getTime();
  socket.emit('save:card', {
    cid:this.props.cardId,
    data:{start:start,end:end},
    cmd:'date'
  }, (result) => {
    if(!result) {
      return alert("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง.");
    }else{
      var {cardData} = this.state;
      cardData.data.start_date = start;
      cardData.data.end_date = end;
      this.setState({cardData});
    }
  });
}
onShowCalendar(){
  this.setState({showCalendar:true});
}
onShowMember(){
  this.setState({showMembers:true});
}
onChangeMember(data){
  if(this.state.cardData.joinMember.indexOf(data) != -1){
    var typeAction = 'delete';
  }else{
    var typeAction = 'add';
  }
  socket.emit('save:card', {
    cid:this.props.cardId,
    data:{typeAction:typeAction,uid:data},
    cmd:'member'
  }, (result) => {
    if(!result) {
      return alert("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง.");
    }else{
     var {cardData} = this.state;
     if(this.state.cardData.joinMember.indexOf(data) != -1){
      cardData.joinMember.splice(this.state.cardData.joinMember.indexOf(data),1);
      var index_full = getIndexOf(cardData.joinMemberFull,'id',data);
      cardData.joinMemberFull.splice(index_full,1);
    }else{
      cardData.joinMemberFull.push(result);
      cardData.joinMember.push(data);
    }
    this.setState({cardData});
  }
});
}
render(){
  var onClickClose = this.hideCard.bind(this);
  var onClickCancelTitle = this.onCancelTitle.bind(this);
  var onClickCancelDesc = this.onCancelDesc.bind(this);
  var onClickDeleteCard = this.deleteCard.bind(this);
  var onClickShowCalendar = this.onShowCalendar.bind(this);
  var onClickShowMember = this.onShowMember.bind(this);
  return(
    <div id="cardpage">
    <div className="container">
    <div className="col-sm-8">
    <h3>{this.state.cardData.data.title}</h3>
    <form onSubmit={this.changeTitle.bind(this)}>
    <div className="form-group">
    <input type="text" className="form-control" value={this.state.newTitle} onChange={this.onChangeTitle.bind(this)} required />
    </div>
    <button type="submit" className="btn btn-success">บันทึก</button> 
    <button className="btn" onClick={onClickCancelTitle}>ยกเลิก</button>
    </form>
    <hr/>
    <div>{this.state.cardData.data.detail}</div>
    <form onSubmit={this.changeDesc.bind(this)}>
    <div className="form-group">
    <textarea className="form-control" value={this.state.newDesc} onChange={this.onChangeDesc.bind(this)}></textarea>
    </div>
    <button type="submit" className="btn btn-success">บันทึก</button> 
    <button type="button" className="btn" onClick={onClickCancelDesc}>ยกเลิก</button>
    </form>
    <hr/>
    <div>Label</div>
    <div className="clearfix"></div>
    <hr/>
    <UserJoin members={this.state.cardData.joinMemberFull} />
    <div className="clearfix"></div>
    <hr/>
    <CommentList cid={this.props.cardId} uid={this.props.session.user.id} />
    <div className="clearfix"></div>
    </div>
    <div className="col-sm-4">
    <button type="button" className="btn btn-danger btn-block" onClick={onClickDeleteCard}>ลบการ์ด</button>
    <button type="button" className="btn btn-primary btn-block" data-toggle="modal" data-target="#calendar" onClick={onClickShowCalendar}>ปฏิทิน</button>
    <button type="button" className="btn btn-success btn-block" data-toggle="modal" data-target="#listmembers" onClick={onClickShowMember}>จัดการสมาชิกร่วมงาน</button>
    <button type="button" className="btn btn-warning btn-block" onClick={onClickClose}>ปิด</button>
    <hr/>
    <strong>ลาเบล</strong>
    <ul>
    <li>Color 01</li>
    <li>Color 02</li>
    <li>Color 03</li>
    </ul>
    </div>
    
    <div className="clearfix"></div>
    </div>


    <div className="modal fade large" id="calendar" role="dialog" aria-labelledby="myModalLabel">
    <div className="modal-dialog" role="document">
    <div className="modal-content">
    <div className="modal-header">
    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    <h4 className="modal-title" id="myModalLabel">Calendar</h4>
    </div>
    <div className="modal-body">
    {this.state.showCalendar?<DatePicker start={parseInt(this.state.cardData.data.start_date)} end={parseInt(this.state.cardData.data.end_date)} onChangeDate={this.onChangeDate.bind(this)} />:null}
    </div>
    </div>
    </div>
    </div>


    <div className="modal fade large" id="listmembers" role="dialog" aria-labelledby="myModalLabel">
    <div className="modal-dialog" role="document">
    <div className="modal-content">
    <div className="modal-header">
    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    <h4 className="modal-title" id="myModalLabel">Members</h4>
    </div>
    <div className="modal-body">
    {this.state.showMembers?<ListMembers cmd="card" cid={this.props.cardId} joinMember={this.state.cardData.joinMember} onChangeMember={this.onChangeMember.bind(this)} />:null}
    </div>
    </div>
    </div>
    </div>


    </div>
    );
}
}

const DatePicker = React.createClass({
  getInitialState() {
    if(this.props.start){
      return {
        value: moment.range(moment(new Date(parseInt(this.props.start))), moment(new Date(parseInt(this.props.end)))),
      };
    }else{
      return {
        value: null,
      };
    }
    
  },
  handleSelect(range, states) {
    this.setState({
      value: range,
      states: states,
    });
    this.props.onChangeDate(range);
  },

  render() {
    return (
      <DateRangePicker
      firstOfWeek={1}
      minimumDate={new Date()}
      numberOfCalendars={2}
      selectionType="range"
      singleDateRange={true}
      showLegend={false}
      value={this.state.value}
      onSelect={this.handleSelect} />
      );
  },
});

var UserJoin = React.createClass({
  displayName: 'UserJoin',
  getInitialState() {
    return {};
  },
  componentDidMount: function() {

  },
  
  render() {
   var getShortName = function(name){
    var name_arr = name.split(" ");
    var shortName = name_arr[0].charAt(0)+name_arr[1].charAt(0);
    return shortName.toUpperCase();
  }
  return (
    <div id="list-user-join">
    {
      this.props.members.map((item,index)=>{
        return(
          <div className="member-box member-list-front" key={index} data-id={item.id}>
          {item.avatar?<img src={item.avatar} />:<strong> {getShortName(item.fullName)} </strong>}
          <div className="box-user-info">
            <div className="col-xs-3">
              <div className="member-box">{item.avatar?<img src={item.avatar} />:<strong> {getShortName(item.fullName)} </strong>}</div>
            </div>
            <div className="col-xs-9">
              <div><strong>{item.fullName}</strong></div>
              <div><a href="#">{item.email}</a></div>
            </div>
            <div className="clearfix"></div>
          </div>
          </div>
          )
      })
    }
    </div>
    );
}
});

var CommentList = React.createClass({
  displayName: 'CommentList',
  getInitialState() {
    return {comments:[]};
  },
  componentDidMount: function() {
    socket.emit('list:comment', {cid:this.props.cid}, (result) => {
      if(result){
        this.setState({comments:result});
      }
    });

  },
  changeComment:function(data){
   switch(data.cmd) {
    case 'add':
    var {comments} = this.state;
    comments.push(data.content);
    this.setState({comments});
    break;
    case 'delete':
    socket.emit('delete:comment', {uid:this.props.uid,cid:data.id}, (result) => {
      if(result){
        var {comments} = this.state;
        var index = getIndexOf(comments,'comment_id',data.id);
        comments.splice(index, 1);
        this.setState({comments});
      }
    });
    break;
  }
},
render() {
  var timeConverter = function(date){
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
    var today = dd+'/'+mm+'/'+yyyy;
    return today;
  };
  return (
    <div id="comments">
    {

      this.state.comments.map((value,index)=>{
        var cliCKdelete = this.changeComment.bind(this,{cmd:"delete",id:value.comment_id});
        if(value.uid===this.props.uid){
          var buttondelete =   <button className="btn btn-danger btn-xs pull-right" onClick={cliCKdelete}>ลบคอมเม้น</button>; 
        }
        return(
          <div className="thumbnail" key={index}>
          <strong>{value.user}</strong> - {timeConverter(value.at_create)}
          <br/>
          • {value.message}<br/>
          {buttondelete}
          <div className="clearfix"></div>
          </div>
          )
      })
    }
    <CommentForm uid={this.props.uid} cid={this.props.cid} onEditComment={this.changeComment} />
    </div>
    );
}
});

var CommentForm = React.createClass({
  displayName: 'CommentForm',
  getInitialState() {
    return {comment:''};
  },
  onChangeComment:function(e){
    this.setState({comment:e.target.value});
  },
  PostComment:function(e){
    e.preventDefault();
    var comment = this.state.comment;
    if(!comment){
      return;
    }
    var at_create = new Date().getTime();
    socket.emit('add:comment', {
      cid:this.props.cid,
      uid:this.props.uid,
      data:comment,
      at_create:at_create
    }, (result) => {
      if(!result) {
        return alert("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง.");
      }else{
        this.props.onEditComment({cmd:'add',content:{comment_id:result['ID(c)'],uid:this.props.uid,user:result['u.firstName'],message:comment,at_create:at_create}});
      }
    });
    this.setState({comment:''});
  },
  render() {
    return (
      <div>
      <form onSubmit={this.PostComment}>
      <div className="form-group">
      <textarea className="form-control" placeholder="กรุณาใส่คอมเม้นที่นี่..." onChange={this.onChangeComment} value={this.state.comment} required></textarea>
      </div>
      <button type="submit" className="btn btn-success">ส่ง</button>
      </form>
      </div>
      );
  }
});

function mapStateToProps (state) {
  return { session: state.session }
}

export default connect(mapStateToProps)(CardPage)