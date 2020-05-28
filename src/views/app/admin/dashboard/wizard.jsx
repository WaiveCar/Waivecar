import React, {Component} from 'react';
import {auth} from 'bento';
import Profile from '../../user/profile';
import Organizations from '../organizations/organizations-search';
import Insurance from '../../user/profile/insurance-policies';
import Cards from '../../user/profile/cards';
import License from '../../user/profile/license';
import Logos from '../../user/profile/logos';

function LastPage() {
  return (
    <div className="box-content" style={{marginTop: '2.5rem', textAlign: 'center'}}>
      <p>
        Thanks for setting up your account. You are now ready to add users and book cars!
      </p>
    </div>
  );
}

class Wizard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pages: [Profile, Organizations, License, Cards, Logos, LastPage],
      selectedPage: 0,
    };
    this._user = auth.user();
  }

  render() {
    let {pages, selectedPage} = this.state;
    let {history} = this.props;
    let SelectedComp = pages[selectedPage];
    return (
      <div className="box">
        <h3 className="text-center">Please Setup Your Account</h3>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <button
            disabled={selectedPage === 0}
            className="btn btn-primary"
            onClick={() => this.setState({selectedPage: selectedPage - 1})}>
            Prev
          </button>
          <button
            className="btn btn-primary"
            onClick={() =>
              selectedPage < pages.length - 1
                ? this.setState({selectedPage: selectedPage + 1})
                : history.pushState(null, '/dashboard')
            }>
            {selectedPage < pages.length - 1 ? 'next' : 'done'}
          </button>
        </div>
        <SelectedComp
          _user={this._user}
          type={'user'}
          user={this._user}
          onlyTop={true}
        />
      </div>
    );
  }
}

export default Wizard;
