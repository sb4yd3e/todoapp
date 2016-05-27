import React, { Component, PropTypes} from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
const socket = io.connect();
class ListMembers extends Component {
  static contextTypes = {
    router: PropTypes.object
  }
  constructor(props) {
    super(props);
    this.state = {
      members:[]
    };

  }
  componentDidMount() {
    socket.emit('list:members', {}, (result) => {
      if(result){
        this.setState({members:result});
      }
    });
  }
  onClickMember(uid){
    this.props.onChangeMember(uid);
  }
  render(){
    var getShortName = function(name){
      var name_arr = name.split(" ");
      var shortName = name_arr[0].charAt(0)+name_arr[1].charAt(0);
      return shortName.toUpperCase();
    }
    return (
      <div id="user-list">
      {
        this.state.members.map((item,index)=>{
          var active_class = "member-box";
          if(this.props.joinMember.indexOf(item.id) != -1){
            active_class = "member-box active";
          }
          var clickMember = this.onClickMember.bind(this,item.id);
          return(
            <div className={active_class} onClick={clickMember} key={index} data-id={item.id}>
            {item.avatar?<img src={item.avatar} />:<strong> {getShortName(item.fullName)} </strong>}
            </div>
            );
        })
      }
      <div className="clearfix"></div>
      </div>
      );
  }
}
function mapStateToProps (state) {
  return { session: state.session }
}
export default connect(mapStateToProps)(ListMembers)