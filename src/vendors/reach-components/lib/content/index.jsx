'use strict';

import React    from 'react';
import Reach    from 'reach-react';
import Snackbar from '../snackbar';
import './style.scss';

export default class Content extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      record : null,
      editor : null
    };
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    this.setState({
      record : this.props.record || {},
      editor : new ContentTools.EditorApp.get()
    }, () => {
      this.state.editor.init('[data-editable]', 'data-editable');
      this.state.editor.bind('save', (regions) => {
        this.editorChange(regions['text-component']);
      });
    });
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    this.state.editor.destroy();
  }

  /**
   * @method editorChange
   * @param  {Object} event
   */
  editorChange(value) {
    let record = this.state.record;
    record.html = value;
    this.setState({
      record : record
    }, () => {
      this.submit();
      // HACK: Reselect the region DOM elements for the editor after state change.
      this.state.editor._domRegions = document.querySelectorAll('[data-editable]');
    });
  }

  /**
   * @method submit
   */
  submit() {
    Reach.API[this.props.method.toLowerCase()](this.props.action, this.state.record, function (err, res) {
      if (err) {
        if (this.props.onError) {
          return this.props.onError(err, res);
        }
        return Snackbar.notify({ type : 'danger', message : err.message });
      }
      if (this.props.onSuccess) {
        return this.props.onSuccess(res);
      }
      return Snackbar.notify({ message : 'Success' });
    }.bind(this));
  }

  /**
   * @method render
   */
  render() {
    let innerHtml = {
      __html : `<div data-editable="text-component">${ this.state.record ? this.state.record.html : '' }</div>`
    };

    return (
      <div
        key                     = 'text-component'
        className               = 'text-component'
        dangerouslySetInnerHTML = { innerHtml }
      >
      </div>
    );
  }
}
