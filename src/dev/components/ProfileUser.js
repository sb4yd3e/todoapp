import React, { Component, PropTypes} from 'react'
import { connect } from 'react-redux'
import UserAvatar from './UserAvatar';
const socket = io.connect();
class ProfileUser extends Component {
 static contextTypes = {
    router: PropTypes.object
  }
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render () {
      return (
        <div>
        <div className="col-sm-4">
        <p><strong>ID: </strong>{this.props.session.user.id}</p>
        <p><strong>avatar: </strong>{this.props.session.user.avatar}</p>
        <p><strong>First Name: </strong>{this.props.session.user.firstName}</p>
        <p><strong>Last Name: </strong>{this.props.session.user.lastName}</p>
        <p><strong>Email: </strong>{this.props.session.user.email}</p>
        <p><strong>Authorization: </strong>{this.props.session.user.auth}</p>
        <p><strong>Created: </strong>{this.timestampToDate()}</p>
        </div>
        <div className="col-sm-8">
        <form>
        <div className="form-group">
        <label>{this.props.session.user.avatar?<img src={this.props.session.user.avatar} className="thumbnail avatar"/>:<img src="https://placeholdit.imgix.net/~text?txtsize=33&txt=Avatar&w=100&h=100" className="thumbnail avatar"/>}</label>
        
        </div>
        <div className="form-group">
        <label>ชื่อ</label>
        <input type="text" className="form-control" required/>
        </div>
        <div className="form-group">
        <label>นามสกุล</label>
        <input type="text" className="form-control" required/>
        </div>
        <div className="form-group">
        <label>อีเมล์</label>
        <input type="email" className="form-control" required/>
        </div><div className="form-group">
        <label>รหัสผ่าน</label>
        <input type="password" className="form-control" required/>
        </div>
        <div className="form-group">
        <label>ยืนยันรหัสผ่าน</label>
        <input type="password" className="form-control" required/>
        </div>
        <div className="form-group">
        <button type="submit" className="btn btn-success">บันทึก</button>
        </div>
        </form>
        </div>
        </div>
        )
  }

  timestampToDate () {
    let timestamp = new Date(this.props.session.user.createdAt)
    let Day = timestamp.getDate()
    let Month = timestamp.getMonth() + 1
    let Year = timestamp.getFullYear()
    let createdAt = Day + '/' + Month + '/' + Year
    return createdAt
  }

}

function mapStateToProps (state) {
  return { session: state.session }
}

export default connect(mapStateToProps)(ProfileUser)
