import React from 'react';
import { editor } from 'reach-ui';
let { ViewLayout } = editor;

export default class ViewEditor extends React.Component {

  constructor(...args) {
    super(...args);
  }

  /**
   * @method render
   */
  render() {
    return (
      <div className="view-editor">
        <ViewLayout viewId={ this.props.params.id } />
      </div>
    );
  }

}
