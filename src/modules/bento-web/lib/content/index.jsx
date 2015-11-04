import React, { PropTypes } from 'react';
import Reach, { helpers }   from 'bento';
import Snackbar             from '../snackbar';

class Content extends React.Component {

  static propTypes = {
    canEdit  : PropTypes.bool,
    html     : PropTypes.string,
    onUpdate : PropTypes.func
  };

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
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
    if (this.props.html) {
      this.setDefault(this.props.html);
    }
  }

  /**
   * @method componentWillReceiveProps
   * @param  {Object} nextProps
   * @param  {Object} nextState
   */
  componentWillReceiveProps(nextProps, nextState) {
    if (this.props.html !== nextProps.html) {
      this.setDefault(nextProps.html);
    }
  }

  setDefault(html) {
    let editorId = helpers.random(10);
    let id = `content-${ editorId }`;
    this.setState({
      id     : id,
      key    : editorId,
      html   : {
        __html : `
          <div id="${ id }" data-editable="html">
            ${ html ? html : '' }
          </div>
        `
      },
      editor : new ContentTools.EditorApp.get()
    }, () => {
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
    if (this.props.onUpdate) {
      this.props.onUpdate({ html : region[this.state.id] });
    }
    this.state.editor.busy(false);
    this.state.editor.stop();
    this.state.editor.unbind('save', this.submit);
    this.state.editor.destroy();
  }

  startEdit() {
    if (this.state.isEditing) return false;
    if (this.state.editor) {
      this.setState({
        isEditing : true
      });

      this.state.editor.init(`#${ this.state.id }[data-editable]`, 'id');
      this.state.editor.bind('save', this.submit);
      this.state.editor.start();
    }
  }

  stopEdit() {
    if (!this.state.isEditing) return false;

    if (this.state.editor) {
      this.setState({
        isEditing : false
      });
      this.state.editor.busy(true);
      this.state.editor.save();
    }
  }

  renderActions() {
    let classNames = this.state.isEditing ? 'content-actions is-active' : 'content-actions';
    return (
      <div className={ classNames }>
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
    if (!this.props.html) {
      return (<div className="content-component" />)
    }
    if (!this.props.canEdit) {
      return (
        <div className="content-component">
          <div
            key                     = { this.state.key }
            dangerouslySetInnerHTML = { this.state.html }
            className               = 'content-component'
          />
        </div>
      );
    }

    return (
      <div className="content-component">
        <div
          key                     = { this.state.key }
          dangerouslySetInnerHTML = { this.state.html }
          className               = 'content-component'
          onClick                 = { this.startEdit }
        />
        { this.renderActions() }
      </div>
    )
  }

}

Content.defaultProps = { canEdit : false };

module.exports = Content;
