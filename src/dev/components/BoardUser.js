import React, { Component, PropTypes} from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
const socket = io.connect();
class BoardUser extends Component {
  static contextTypes = {
    router: PropTypes.object
  }
  constructor(props) {
    super(props);
    this.state = {
      boards: [],
      join_boards: [],
      user_id:this.props.session.user.id,
      user_name:this.props.session.user.firstName,
      user_email:this.props.session.user.email,
      showNotification:true,
      notificationText:"กำลังดาวน์โหลด..."
    };
    socket.emit('list:boards', { id:this.props.session.user.id}, (result) => {
      if(result){
        this.setState({boards:result,showNotification:false});
      }else{
        this.setState({showNotification:false});
      }
    });
    socket.emit('list:join_boards', { id:this.props.session.user.id}, (result) => {
      if(result){
        this.setState({join_boards:result,showNotification:false});
      }else{
        this.setState({showNotification:false});
      }
    });
  }
  componentDidMount() {
    document.title = "บอร์ดของฉัน";
  }
  onCreateBoard(data){
    socket.emit('add:board', {
      name:data.name,
      at_create:data.at_create,
      id:this.state.user_id
    }, (result) => {
      if(!result) {
        return alert("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง.");
      }else{
        var {boards} = this.state;
        boards.push({
          id:result,
          title:data.name,
          at_create:data.at_create,
          id:this.state.user_id
        });
        this.setState({boards:boards});
        this.context.router.push('/board/'+result)
      }
    });
  }
  render () {
    return (
      <div>
      <div className="container">
      <div className="row">
      <div className="col-lg-12"> 
      <h4><i className="glyphicon glyphicon-user"></i> บอร์ดของฉัน</h4>
      <hr/>
      <BoardList boardList={this.state.boards} />
      <div className="clearfix"></div>
      <h4><i className="glyphicon glyphicon-share"></i> บอร์ดที่ร่วมงาน</h4>
      <hr/>
      <JoinBoardList boardList={this.state.join_boards} />
      </div>
      </div>
      </div>
      {this.state.showNotification?<Notification text={this.state.notificationText} />:null}
      <div className="modal fade" id="addForm" role="dialog" aria-labelledby="myModalLabel">
      <div className="modal-dialog" role="document">
      <div className="modal-content">
      <FormCreateBoard boardList={this.state.boards} onFormSubmit={this.onCreateBoard.bind(this)} />
      </div>
      </div>
      </div>
      </div>
      )
    }
  }
  var BoardList = React.createClass({
    render:function(){
      var timeConverter = function(date){
        var today = new Date(date);
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
     
      return(
      <div>
      {
        this.props.boardList.map((item, i) => {
          return (
          <div className="col-sm-4 margin-bottom" key={i}>
          <Link to={`/board/${item.id}`}>
          <div className="boardList">
          <strong>{item.title}</strong>
          </div>
          </Link>
          </div>
          );
        })
      } 
      <div className="col-sm-4 margin-bottom">
      <div className="createBoard" data-toggle="modal" data-target="#addForm">สร้างบอร์ดใหม่</div>
      </div>
      </div>
      );
    }
  });
  var JoinBoardList = React.createClass({
    render:function(){
      var timeConverter = function(date){
        var today = new Date(date);
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
     
      return(
      <div>
      {
        this.props.boardList.map((item, i) => {
          return (
          <div className="col-sm-4 margin-bottom" key={i}>
          <Link to={`/board/${item.id}`}>
          <div className="boardList">
          <strong>{item.title}</strong>
          </div>
          </Link>
          </div>
          );
        })
      } 
      </div>
      );
    }
  });
  var FormCreateBoard = React.createClass({
    getInitialState() {
      return {name: '',detail:'',notifyShow:false};
    },
    onNameChange:function(e){
      this.setState({name:e.target.value});
    },
    handleSubmit:function(e){
      e.preventDefault();
      var name = this.state.name;
      var at_create = new Date().getTime();
      if(!name){
        this.setState({ notifyShow : true,textNotify:"กรุณาใส่ชื่อ!" });
        return;
      }
      this.props.onFormSubmit({ name:name,at_create:at_create,user:this.state.user_id});
      this.setState({name:''});
      $('#addForm').modal('hide');
    },
    render:function(){
      return(
      <form onSubmit={this.handleSubmit}>
      <div className="modal-header">
      <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
      <h4 className="modal-title" id="myModalLabel">สร้างบอร์อดใหม่</h4>
      </div>
      <div className="modal-body">
      {this.state.notifyShow?<Notify text={this.state.textNotify} />:null}
      <div className="form-group">
      <label>ชื่อ</label>
      <input type="text" className="form-control" value={this.state.name} onChange={this.onNameChange} />
      </div>
      
      </div>
      <div className="modal-footer">
      <button type="button" className="btn btn-default" data-dismiss="modal">ยกเลิก</button>
      <button type="submit" className="btn btn-primary">บันทึก</button>
      </div>
      </form>
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

  export default connect(mapStateToProps)(BoardUser)
