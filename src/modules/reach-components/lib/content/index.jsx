'use strict';

import React, { PropTypes } from 'react';
import Reach, { api }       from 'reach-react';
import Snackbar             from '../snackbar';
import './style.scss';

export default class Content extends React.Component {

  static propTypes = {
    canEdit : PropTypes.bool,
    id      : PropTypes.number
  };

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      id     : null,
      key    : null,
      editor : null,
      html   : {
        __html : ''
      },
      isEditing : false
    }
    this.submit    = this.submit.bind(this);
    this.startEdit = this.startEdit.bind(this);
    this.stopEdit  = this.stopEdit.bind(this);
  }

  /**
   * Load the component content from the api and update state.
   * @method componentDidMount
   */
  componentDidMount() {
    if (this.props.id) {
      this.setDefault(this.props.id);
    }
  }

  /**
   * @method componentWillReceiveProps
   * @param  {Object} nextProps
   * @param  {Object} nextState
   */
  componentWillReceiveProps(nextProps, nextState) {
    if (this.props.id !== nextProps.id) {
      this.setDefault(nextProps.id);
    }
  }

  setDefault(id) {
    api.get(this.props.resource.show.uri.replace(':id', id), (error, result) => {
      if (error) {
        return Snackbar.notify({
          type    : `danger`,
          message : `Could not retrieve content [ID: ${ id }]`
        });
      }
      let id = `content-${ result.id }`;
      this.setState({
        id     : id,
        key    : result.id,
        html   : {
          __html : `
            <div id="${ id }" data-editable="html">
              ${ result.html ? result.html : '' }
            </div>
          `
        },
        editor : new ContentTools.EditorApp.get()
      }, () => {
      });
    });
  }

  /**
   * Destroy the editor when leaving the component.
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    // if (this.state.editor) {
    //   this.state.editor.destroy();
    // }
  }

  /**
   * @method submit
   * @param  {Object} region
   */
  submit(region) {
    api.put(this.props.resource.update.uri.replace(':id', this.props.id), {
      html : region[this.state.id]
    }, (error, res) => {
      if (error) {
        return Snackbar.notify({
          type    : 'danger',
          message : error.message
        });
      }
      Snackbar.notify({
        type    : 'success',
        message : 'Content was successfully updated'
      });
      this.state.editor.busy(false);
      this.state.editor.stop();
      this.state.editor.unbind('save', this.submit);
      this.state.editor.destroy();
    }.bind(this));
  }

  createContent(next) {
    api.post(this.props.resource.create.uri, { html : '<p>Awaiting Text</p>' }, function(err, res) {
      this.setDefault(res.id);
      if (next) {
        return next();
      }
    });
  }

  startEdit() {
    let edit = function() {
      if (this.state.editor) {
        this.setState({
          isEditing : true
        });

        this.state.editor.init(`#${ this.state.id }[data-editable]`, 'id');
        this.state.editor.bind('save', this.submit);
        this.state.editor.start();
      }
    }.bind(this);

    if (!this.props.id) {
      this.createContent(edit);
    } else {
      edit();
    }
  }

  stopEdit() {
    if (this.state.editor) {
      this.setState({
        isEditing : false
      });
      this.state.editor.busy(true);
      this.state.editor.save();
    }
  }

  renderActions() {
    return (
      <div className="content-actions">
        { !this.state.isEditing &&
          <button type="button" className="btn btn-icon" onClick={ this.startEdit }>
            <i className="material-icons" role="edit">mode_edit</i>
          </button>
        }
        { this.state.isEditing &&
          <button type="button" className="btn btn-icon" onClick={ this.stopEdit }>
            <i className="material-icons" role="done">done</i>
          </button>
        }
      </div>
    );
  }
  /**
   * @method render
   */
  render() {
    if (!this.props.id) {
      return (<div className="content-component" />)
    }
    return (
      <div className="content-component">
        <div
          key                     = { this.state.key }
          dangerouslySetInnerHTML = { this.state.html }
          className               = 'content-component'
        />
        { this.props.canEdit && this.renderActions() }
      </div>
    )
  }

}

Content.defaultProps = { canEdit : false };
