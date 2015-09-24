import React, { PropTypes, Component } from 'react';
import { editor } from 'reach-ui';
let { ViewLayout } = editor;

export default class ViewEditor extends Component {
  render() {
    return (
      <div className="view-editor">
        <h2>View Editor</h2>
        <div className="container-form" style={{ display : 'none' }}>
          <form className="form">
            <fieldset className="form-group">
              <label htmlFor="Name">Name</label>
              <input type="text" className="form-control" />
            </fieldset>
            <fieldset className="form-group">
              <label htmlFor="Name">Options</label>
              <input type="text" className="form-control" />
            </fieldset>
          </form>
        </div>
        <ViewLayout />
      </div>
    );
  }
}