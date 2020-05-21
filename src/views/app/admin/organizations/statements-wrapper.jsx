import React, {Component} from 'react';
import Statements from './statements';
import {Link} from 'react-router';
import {api, auth} from 'bento';

class StatementsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organization: null,
    };
  }

  componentDidMount() {
    console.log(this.props);
    api.get(`/organizations/${this.props.params.id}`, (err, organization) => {
      if (err) {
        console.log(err);
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
              Statements for <Link to={`/organizations/${id}`}>{organization.name}</Link>
            </h4>
            <Statements hideHeader={true} organization={organization} />
          </div>
        ) : (
          <div>Loading</div>
        )}
      </div>
    );
  }
}

export default StatementsWrapper;
