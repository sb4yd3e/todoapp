import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import { deleteSessions } from '../actions'

class Navbar extends Component {

  static contextTypes = {
    router: PropTypes.object
  }

  constructor () {
    super();
    this.state = {
      menuMobile: false
    }
    this.handleMenuMobile = this.handleMenuMobile.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
   }

  render () {
    return <nav className="navbar navbar-default">
      <div className="container-fluid">
        <div className="navbar-header">
          <button onClick={this.handleMenuMobile} type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#MenuMobile" aria-expanded="false">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <Link onClick={this.state.menuMobile ? this.handleMenuMobile : null} className="navbar-brand" to="/">TODO App</Link>
        </div>
        <div className={"collapse navbar-collapse " + (!this.state.menuMobile ? '' : 'in')} id="MenuMobile">
          {this.loggedUser()}
        </div>
      </div>
    </nav>
  }

  handleMenuMobile () {
    this.setState({
      menuMobile: !this.state.menuMobile
    })
  }

  loggedUser () {
    if (!this.props.session.user) {
      return (
        <div>
          <ul className="nav navbar-nav navbar-right">
            <li><Link to="/signup">ลงทะเบียน</Link></li>
            <li><Link to="/login">เข้าสู่ระบบ</Link></li>
          </ul>
        </div>
      )
    } else {
      return (
        <div>
          
          <ul className="nav navbar-nav navbar-right">
            <li><Link to="/profile">สวัสดีคุณ: <strong>{this.props.session.user.fullName}</strong></Link></li>
            <li><Link to="/boards">บอร์ด</Link></li>
            <li><a href="#" onClick={this.handleLogout}>ออกจากระบบ</a></li>
          </ul>
        </div>
      )
    }
  }

  handleLogout (event) {
    event.preventDefault()
    this.props.deleteSessions()
      .then(() => {
        this.context.router.push('/')
      })
  }

}

function mapStateToProps (state) {
  return { session: state.session }
}

export default connect(mapStateToProps, { deleteSessions })(Navbar)
