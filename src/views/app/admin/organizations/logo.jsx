import React, {Component} from 'react';
import Files from '../../../../modules/bento-service/files.js';

class Logo extends Component {
  constructor(props) {
    super(props);
    this.files = new Files(this, 'logo');
    let {logo} = props.organization;
    this._user = props._user;
    this.state = {
      logo,
    };
  }

  render() {
    let {logo} = this.state;
    let {organization} = this.props;
    console.log(logo);
    return (
      <div className="row">
        <h4>Logo</h4>
        <div className="profile-image">
          <input
            type="file"
            style={{display: 'none'}}
            ref="logo"
            onChange={this.files.bindUpload(
              `/files?isLogo=true&organizationId=${organization.id}`,
              null,
              res => this.setState({logo: res[0]}),
            )}
          />
          <div className="profile-image-selector" onClick={this.files.select}>
            <i className="material-icons" role="avatar-upload">
              add_a_photo
            </i>
          </div>
          {logo && (
            <img
              className="profile-image-view"
              src={`http://waivecar-prod.s3.amazonaws.com/${logo.path}`}
            />
          )}
        </div>
      </div>
    );
  }
}

export default Logo;
