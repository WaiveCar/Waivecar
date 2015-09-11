import React from 'react';

export default class DynamicView extends React.Component {
  render() {
    return this.props.children;
  }
}