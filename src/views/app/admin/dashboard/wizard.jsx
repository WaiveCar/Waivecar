import React, {Component} from 'react';
import Profile from '../../user/profile';

class Wizard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pages: [
        Profile,
      ],
      selectedPage: 0,
    }
  }

  render() {
    let {pages, selectedPage} = this.state;
    let SelectedComp = pages[selectedPage];
    return (
      <div>
        <SelectedComp />
      </div>
    );
  }
}

export default Wizard;
