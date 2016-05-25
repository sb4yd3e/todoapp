import React, { Component, PropTypes} from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
const socket = io.connect();
class CardPage extends Component {
  static contextTypes = {
    router: PropTypes.object
  }
  constructor(props) {
    super(props);
    this.state = {
      cardData:[],
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
      this.setState({cardData:result,newTitle:result.title,newDesc:result.detail});
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
  this.setState({newTitle:this.state.cardData.title});
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
      cardData.title = this.state.newTitle;
      this.setState({cardData});
    }
  });
}

onChangeDesc(e){
  this.setState({newDesc:e.target.value});
}
onCancelDesc(){
  this.setState({newDesc:this.state.cardData.detail});
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
      cardData.detail = this.state.newDesc;
      this.setState({cardData});
    }
  });
}

render(){
  var onClickClose = this.hideCard.bind(this);
  var onClickCancelTitle = this.onCancelTitle.bind(this);
  var onClickCancelDesc = this.onCancelDesc.bind(this);
  return(
    <div id="cardpage">
    <div className="container">
    <div className="col-sm-8">
    <h3>{this.state.cardData.title}</h3>
    <form onSubmit={this.changeTitle.bind(this)}>
    <div className="form-group">
    <input type="text" className="form-control" value={this.state.newTitle} onChange={this.onChangeTitle.bind(this)} required />
    </div>
    <button type="submit" className="btn btn-success">บันทึก</button> 
    <button className="btn" onClick={onClickCancelTitle}>ยกเลิก</button>
    </form>
    <hr/>
    <div>{this.state.cardData.detail}</div>
    <form onSubmit={this.changeDesc.bind(this)}>
    <div className="form-group">
    <textarea className="form-control" value={this.state.newDesc} onChange={this.onChangeDesc.bind(this)}></textarea>
    </div>
    <button type="submit" className="btn btn-success">บันทึก</button> 
    <button type="button" className="btn" onClick={onClickCancelDesc}>ยกเลิก</button>
    </form>
    <hr/>
    <div>Label</div>
    <hr/>
    <div>member</div>
    <hr/>
    <CommentList cid={this.props.cardId} uid={this.props.session.user.id} />
    </div>
    <div className="col-sm-4">
    <button type="button" className="btn btn-danger btn-block">ลบการ์ด</button>
    <button type="button" className="btn btn-primary btn-block">ปฏิทิน</button>
    <button type="button" className="btn btn-success btn-block">เพิ่มสมาชิก</button>
    <hr/>
    <strong>ลาเบล</strong>
    <ul>
    <li>Color 01</li>
    <li>Color 02</li>
    <li>Color 03</li>
    </ul>
    </div>
    
    <div className="clearfix"></div><hr/>
    <button type="button" className="btn btn-primary pull-right" onClick={onClickClose}>ปิด</button>
    <div className="clearfix"></div>
    </div>
    </div>
    );
}
}


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
  var currentPost = function(date){
    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);
    if(Math.floor(seconds) < 60){
      return Math.floor(seconds) + " วินาทีที่แล้ว";
    }
    if (interval > 1) {
      return interval + " ปีที่แล้ว";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + " เดือนที่แล้ว";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + " วันที่แล้ว";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + " ชั่วโมงที่แล้ว";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 0) {
      return interval + " นาทีที่แล้ว";
    }
    

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
          <strong>{value.user}</strong> - {currentPost(value.at_create)}
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
        this.props.onEditComment({cmd:'add',content:{comment_id:result['ID(c)'],user:result['u.firstName'],message:comment,at_create:at_create}});
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