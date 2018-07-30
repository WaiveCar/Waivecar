import React, {Component} from 'react';

export default class AddSpaces extends Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    return (
      <div>
        <button onClick={() => console.log('button clicked')}>Click</button>
        Add Spaces Here
      </div>
    );
  };
}
