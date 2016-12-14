import React        from 'react';
import moment       from 'moment';
import { relay, api }      from 'bento';
import { snackbar } from 'bento-web';
import { Form }     from 'bento/lib/helpers';
import md5          from 'md5';
import FormSelect   from 'react-select';
import FormInput    from '../components/form-input';

module.exports = class UserDetails extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      license  : null,
      report   : null,
      userInfo : null
    };
    relay.subscribe(this, 'users');
  }

  componentDidMount() {
    api.get(`/users/${ this.props.id }`, (err, user) => {
      user.image =  user.avatar ? 
        `${ api.uri }/file/${ user.avatar }` :
        `//www.gravatar.com/avatar/${ md5(user.email) }?s=150`;

      this.setState({
        userInfo: user
      });
    });

    api.get('/licenses', {
      userId : this.props.id
    }, (err, licenses) => {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
      if (licenses[0]) {
        // this.setReport(licenses[0].id);
        this.setState({
          license : licenses[0]
        });
      }
    });
  }

  setReport(id) {
    api.get(`/licenses/${ id }/report`, (err, report) => {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
      this.setState({
        report : report
      });
    });
  }

  /**
   * Submits the license for update.
   * @param  {Object} event
   * @return {Void}
   */
  submit = (event) => {
    let form = new Form(event);
    api.put(`/licenses/${ this.state.license.id }`, form.data, (err) => {
      if (err) {
        return snackbar.notify({
          type    : 'danger',
          message : err.message
        });
      }
      snackbar.notify({
        type    : 'success',
        message : 'User license successfully updated'
      });
    });
  }

  /**
   * Render license details.
   * @return {Void}
   */
  render() {
    if (!this.state.license) {
      return (
        <div className="box-empty">
          <h3>License</h3>
          This user has not yet registered a license
        </div>
      );
    }
    let license = this.state.license;
    return (
      <div className="box">
        <h3>
          License
          <small>
            View, and edit the users license
          </small>
        </h3>
        <div className="box-content">
          <div className="box-image text-center">
            {
              license.fileId ?
                <a href={ `${ api.uri }/file/${ license.fileId }` } target="_blank">
                  <img src={ `${ api.uri }/file/${ license.fileId }` } style={{ width : '50%' }} />
                </a>
                : 
                <div style={{ border: '1px solid #bbb', display: 'inline-block', background: '#eee', width: '250px', height: '125px', color: 'white' }}>
                  <p style={{ paddingTop: '15%', fontWeight: 'bold', color: '#bbb' }}>
                    [ No Image ]
                  </p>
                </div>
            }
            { 
              this.state.userInfo ? 
                <img style={{ maxHeight: '100%', maxWidth: '45%', width: 'auto', display: 'inline-block', paddingLeft: '10px' }} src={ this.state.userInfo.image } /> : "" 
            }
          </div>

          <form className="bento-form-static" role="form" onSubmit={ this.submit } style={{ marginTop : 20 }}>
            <div className="form-group row">
              <FormInput className="col-md-4 bento-form-input">
                <label>License Number</label>
                <input type="text" name="number" className="form-control" defaultValue={ license.number } disabled={ !license.provided } required />
              </FormInput>
              <FormInput className="col-md-4 bento-form-input">
                <label>State</label>
                <input type="text" name="state" className="form-control" defaultValue={ license.state } disabled={ !license.provided } required />
              </FormInput>
              <FormInput className="col-md-4 bento-form-input">
                <label>Status</label>
                <input type="text" name="status" className="form-control" defaultValue={ license.status } disabled />
              </FormInput>
            </div>

            <div className="form-group row">
              <FormInput className="col-md-4 bento-form-input">
                <label>First Name</label>
                <input type="text" name="firstName" className="form-control" defaultValue={ license.firstName } disabled={ !license.provided } required />
              </FormInput>
              <FormInput className="col-md-4 bento-form-input">
                <label>Middle Name (Optional)</label>
                <input type="text" name="middleName" className="form-control" defaultValue={ license.middleName } disabled={ !license.provided } />
              </FormInput>
              <FormInput className="col-md-4 bento-form-input">
                <label>Last Name</label>
                <input type="text" name="lastName" className="form-control" defaultValue={ license.lastName } disabled={ !license.provided } required />
              </FormInput>
            </div>

            <div className="form-group row">
              <FormInput className="col-md-4 bento-form-input">
                <label>Birth Date</label>
                <input type="date" name="birthDate" className="form-control" defaultValue={ moment(license.birthDate.slice(0,-1)).format('YYYY-MM-DD') } required />
              </FormInput>
              <FormInput className="col-md-4 bento-form-input">
                <label>Gender</label>
                <FormSelect
                  name     = "gender"
                  value    = { license.gender }
                  disabled = { !license.provided }
                  options  = {[
                    { value : 'male', label : 'Male' },
                    { value : 'female', label : 'Female' }
                  ]}
                />
              </FormInput>
              <FormInput className="col-md-4 bento-form-input">
                <label>Outcome</label>
                <FormSelect
                  name    = "outcome"
                  value   = { license.outcome }
                  options = {[
                    { value : 'consider', label : 'Consider' },
                    { value : 'clear', label : 'Clear' },
                    { value : 'reject', label : 'Reject' }
                  ]}
                />
              </FormInput>
            </div>

            <div className="form-actions text-center">
              <div className="btn-group" role="group">
                <button type="submit" className="btn btn-primary">Update License</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

}
