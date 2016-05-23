import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import { loginUsers } from '../actions'

class Login extends Component {

  // PropTypes for redirect
  static contextTypes = {
    router: PropTypes.object
  }

  // Set initial state
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      error: false
    }
    this.onSubmitForm = this.onSubmitForm.bind(this)
  }

  // Handle on form Submit
  onSubmitForm (event) {
    event.preventDefault()

    if (!this.state.email || !this.state.password) {
      this.setState({
        error: {
          name: 'emptyFields',
          message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง.'
        }
      })
      return false
    }

    let fields = {
      email: this.state.email,
      password: this.state.password
    }

    this.props.loginUsers(fields)
      .then((data) => {
        const response = data.payload.data
        if (response.error) {
          this.setState({
            error: {
              name: response.error.name,
              message: response.error.message
            }
          })
          return false
        }
        this.context.router.push('/boards')
      })
  }

  // If error, hande Alerts message
  onHandleAlerts () {
    if (this.state.error) {
      return <div className="alert alert-danger" role="alert">{this.state.error.message}</div>
    }
  }

  // If User logged in, redirect to home
  componentWillMount () {
    if (this.props.session.user) {
      this.context.router.push('/boards')
    }
  }

  render () {

    return (
      <div className="col-xs-6 col-xs-offset-3">
        {this.onHandleAlerts()}
        <h3>เข้าสู่ระบบ</h3>
        <form onSubmit={this.onSubmitForm}>
          <div className="form-group">
            <label>อีเมล์</label>
            <input
              onChange={(event) => this.setState({email: event.target.value})}
              value={this.state.email}
              type="email"
              ref="email"
              className="form-control"
              placeholder="Email" />
          </div>
          <div className="form-group">
            <label>รหัสผ่าน</label>
            <input
              onChange={(event) => this.setState({password: event.target.value})}
              value={this.state.password}
              type="password"
              className="form-control"
              placeholder="Password" />
          </div>
          <button type="submit" className="btn btn-primary">ตกลง</button>
        </form>
      </div>
    )
  }

}

function mapStateToProps (state) {
  return { session: state.session }
}

export default connect(mapStateToProps, { loginUsers })(Login)
