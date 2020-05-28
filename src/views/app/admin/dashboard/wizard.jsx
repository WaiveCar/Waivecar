import React, {Component} from 'react';
import {auth} from 'bento';
import Profile from '../../user/profile';
import Cards from '../../user/profile/cards';
import License from '../../user/profile/license';
import Logos from '../../user/profile/logos';

class Wizard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pages: [Profile, License, Cards, Logos],
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
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <button
            disabled={selectedPage === 0}
            className="btn btn-primary"
            onClick={() => this.setState({selectedPage: selectedPage - 1})}>
            Prev
          </button>
          <button
            className="btn btn-primary"
            onClick={() => selectedPage < pages.length - 1 ? this.setState({selectedPage: selectedPage + 1}) : history.pushState(null, '/dashboard')}>
            {selectedPage < pages.length - 1 ? 'next' : 'done'}
          </button>
        </div>
        <SelectedComp onlyTop={true} />
      </div>
    );
  }
}

export default Wizard;
