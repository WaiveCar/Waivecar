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
    let {organization, hideHeader} = this.props;
    return (
      <div>
        {!hideHeader && <h4>Logo</h4>}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
          }}>
          <div className="profile-image" style={{width: '250px', minHeight: '100px'}}>
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
            <div
              style={{
                position: 'absolute',
                width: '250px',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
              }}>
              <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
                <div
                  className="profile-image-selector"
                  onClick={this.files.select}>
                  <i className="material-icons" role="avatar-upload">
                    add_a_photo
                  </i>
                </div>
              </div>
            </div>
            {logo && (
              <img
                style={{width: '100%'}}
                className="profile-image-view"
                src={`http://waivecar-prod.s3.amazonaws.com/${logo.path}`}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Logo;
