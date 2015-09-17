'use strict';

import React from 'react';
import Reach     from 'reach-react';
import Snackbar  from '../snackbar';
import './style.scss';

export default class Content extends React.Component {

  constructor(...args) {
    super(...args);
    this.editorChange = this.editorChange.bind(this);
    this.submit = this.submit.bind(this);
    this.state = {
      record : null,
      editor : null
    };
  }

  componentDidMount() {
    // When the react component is mounted initialize ContentTools
    this.setState({
      record : this.props.record || {},
      editor : new ContentTools.EditorApp.get()
    }, () => {
      this.state.editor.init('[data-editable]', 'data-editable');

      // Capture save events and update the react component
      this.state.editor.bind('save', (regions) => {
        this.editorChange(regions['text-component']);
      });
    });
  }

  componentWillUnmount() {
    this.state.editor.destroy();
  }

  /**
   * Handle the change event
   * @method inputChange
   * @param  {Object} event
   */
  editorChange(value) {
    let record = this.state.record;
    record.html = value;
    this.setState({
      record : record
    }, () => {
      this.submit();
      // HACK: Reselect the region DOM elements for the editor
      // (required because React will re-render after state change.
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
          this.props.onError(err, res);
        } else {
          Snackbar.notify({
            type    : 'danger',
            message : err.message
          });
        }
        return;
      }
      if (this.props.onSuccess) {
        this.props.onSuccess(res);
      } else {
        Snackbar.notify({
          message : 'Success'
        });
      }
    }.bind(this));
  }

  render() {

    let innerHtml = {
      __html : '<div data-editable="text-component">' +
                 (this.state.record ? this.state.record.html : '') +
               '</div>'
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

//      __html : '<div data-editable="text-component">${ this.state.content }</div>'
