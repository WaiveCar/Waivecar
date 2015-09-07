import React from 'react';

export default class DynamicView extends React.Component {
  render() {
    return (
      <div id="content-wrapper">
        { this.props.children }
      </div>
    );
  }
}