import React, { Component, PropTypes} from 'react'
import { connect } from 'react-redux'
const socket = io.connect();

import { avatarUsers } from '../actions'

class UserAvatar extends Component {
  static contextTypes = {
    router: PropTypes.object
  }
  constructor(props) {
    super(props);
    this.state = {file: '',imagePreviewUrl: this.props.session.user.avatar};
  }

  _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }
    reader.readAsDataURL(file)

  }
  _handleImageUpload(e){
    e.preventDefault();
    let fields = {
      file: this.state.file
    }
    this.props.avatarUsers(fields)
    .then((data) => {
      const response = data.payload.data
      if (response.error) {
        console.log(response.error);
        return false
      }
      console.log('upload success');
    })

  }
  render() {
    let {imagePreviewUrl} = this.state;
    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = imagePreviewUrl;
    } else {
      $imagePreview = 'https://placeholdit.imgix.net/~text?txtsize=20&txt=NO+PHOTO&w=100&h=100';
    }

    return (
      <div className="holdingDiv">
      <img src={$imagePreview} className="thumbnail avatar"/>
      <form  encType="multipart/form-data" onSubmit={this._handleImageUpload.bind(this)}>
      <input  type="file" name="photo" className="form-control" onChange={(e)=>this._handleImageChange(e)} /> <br/>                     
      <button id="uploadSubmitter" className="btn btn-primary btn-xs" type="submit">upload</button>
      </form>
      </div>
      )
  }
}


function mapStateToProps (state) {
  return { session: state.session }
}

export default connect(mapStateToProps)(UserAvatar)

