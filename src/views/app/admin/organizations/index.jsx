import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

class Organizations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    };
  }

  componentDidMount() {
    api.get('/organizations', (err, res) => {
      if (err) {
        snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      this.setState({organizations: res});
    });
  }

  createOrg() {
    let {name, organizations} = this.state;
    api.post('/organizations', {name}, (err, res) => {
      if (err) {
        snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      this.setState({organizations: [...organizations, res]});
    });
  }

  render() {
    let {organizations} = this.state;
    return (
      <div>
        Organizations
        <div>New</div>
        <input
          type={'text'}
          onChange={e => this.setState({name: e.target.value})}
        />
            <button className={'btn btn-primary'} onClick={() => this.createOrg()}>Create</button>
        <div>
          {organizations.map((org, i) => <div>{org.name}</div>)}
        </div>
      </div>
    );
  }
}

module.exports = Organizations;
