import React, {Component} from 'react';
import {api} from 'bento';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fridge: null,
    };
  }

  componentDidMount() {
    let {id} = this.props.params;
    api.get(`/cars/${id}`, (err, res) => this.setState({fridge: res}));
  }

  render() {
    let {fridge} = this.state;
    return (
      fridge && (
        <div className="box">
          <h3>{fridge.license}</h3>
          <div className="box-content"></div>
        </div>
      )
    );
  }
}
