import React, { Component, PropTypes} from 'react'
import { connect } from 'react-redux'

class ProfileUser extends Component {

  render () {
    // if (this.props.session.user) {
      return (
        <div>
          <p><strong>ID: </strong>{this.props.session.user.id}</p>
          <p><strong>First Name: </strong>{this.props.session.user.firstName}</p>
          <p><strong>Last Name: </strong>{this.props.session.user.lastName}</p>
          <p><strong>Email: </strong>{this.props.session.user.email}</p>
          <p><strong>Authorization: </strong>{this.props.session.user.auth}</p>
          <p><strong>Created: </strong>{this.timestampToDate()}</p>
        </div>
      )
    // }
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
