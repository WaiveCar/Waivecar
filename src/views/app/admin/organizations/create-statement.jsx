import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

class CreateStatement extends Component {
  constructor(props) {
    super(props);
    console.log(props.location.query);
  }
  
  render() {
    const {name} = this.props.location.query;
    return (
    
      <div className="box">
        <h3 style={{marginBottom: '1rem'}}>New Statement for {name}</h3>
        <div className="box-content">

        </div>
      </div>)
  }
};

export default CreateStatement;

