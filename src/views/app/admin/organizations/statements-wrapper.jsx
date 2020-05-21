import React, {Component} from 'react';
import Statements from './statements';
import {Link} from 'react-router';
import {api, auth} from 'bento';
import {snackbar} from 'bento-web';

class StatementsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organization: null,
    };
  }

  componentDidMount() {
    let {id} = this.props.params;
    if (!auth.user().canSee('organization', {id})) {
      return this.props.history.replaceState({}, '/forbidden');
    }
    api.get(`/organizations/${this.props.params.id}`, (err, organization) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      this.setState({organization});
    });
  }

  render() {
    let {organization} = this.state;
    let {id} = this.props.params;
    return (
      <div className="box">
        {organization ? (
          <div className="box-content">
            <h4>
              Statements for{' '}
              <Link to={`/organizations/${id}`}>{organization.name}</Link>
            </h4>
            <Statements hideHeader={true} organization={organization} />
          </div>
        ) : (
          <div id="booking-view">
            <div className="booking-message">Loading ...</div>
          </div>
        )}
      </div>
    );
  }
}

export default StatementsWrapper;
