import React from 'react';
import moment from 'moment';
import { snackbar } from 'bento-web';
import { auth, api } from 'bento';

module.exports = class Note extends React.Component {

  static propTypes = {
    note: React.PropTypes.object.isRequired,
    type: React.PropTypes.string.isRequired
  }

  constructor(...args) {
    super(...args);

    this.deleteNote = this.deleteNote.bind(this);
  }

  /**
   * Remove this note
   */
  deleteNote() {
    api.delete(`/notes/${ this.props.type }/${ this.props.note.id }`, () => {});
  }

  render() {
    let note = this.props.note;
    let user = auth.user();
    return (
      <div className='row note'>
        <div className='col-sm-3'>
          <strong>{ note.author.firstName } { note.author.lastName }</strong>
          <br />
          <small>{ moment(note.createdAt).fromNow() }</small>
        </div>
        <div className='col-sm-9'>
          { note.content }
        </div>
        { user.id === note.authorId || user._roles.length >= 4 ?
          <button className='btn-link remove-note' onClick={ this.deleteNote }><i className="material-icons" role="true">close</i></button>
          : '' }
      </div>
    );
  }
};
