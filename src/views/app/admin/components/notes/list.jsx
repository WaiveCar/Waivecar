import React from 'react';
import { api, relay, auth } from 'bento';
import AddNote from './add';
import Note from './note';

module.exports = class NotesList extends React.Component {

  static propTypes = {
    type: React.PropTypes.string.isRequired,
    identifier: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]).isRequired
  }

  constructor(...args) {
    super(...args);
    this._user = auth.user();
    relay.subscribe(this, 'notes');
  }

  componentDidMount() {
    this.refreshList();
  }

  refreshList()  {
    api.get(this._buildUrl(this.props.type, this.props.identifier), (err, notes) => {
      relay.dispatch('notes', {
        type : 'index',
        data : notes
      });
    });
  }

  renderNotes(notes) {
    return notes.map(note => {
      return <Note key={ note.id } note={ note } type={ this.props.type } onNoteDeleted={ () => this.refreshList() }/>;
    });
  }

  render() {
    let bookingNotes = this.state.notes[this.props.type] || {};
    let notes = bookingNotes[this.props.identifier] || [];
    return (
      <div className='box'>
        <h3>
          Notes
          <small>Admin provided notes</small>
        </h3>
        <div className='box-content'>
          <div className='container-fluid notes'>
            { notes.length ?
              this.renderNotes(notes) :
              <div className='row'>
                <div className='col-sm-12'>
                  <em>No notes yet.</em>
                </div>
              </div>
            }
          </div>
          <AddNote type={ this.props.type } identifier={ this.props.identifier } onNoteAdded={ () => this.refreshList() }/>
        </div>
      </div>
    );
  }

  /**
   * Helper to build url to load resource notes
   * @param {String} type
   * @param {String} identifier
   * @return {String}
   */
  _buildUrl(type, identifier) {
    return `/${ type }s/${ identifier }/notes${type !== 'cars' && this._user.organizations.length ? `?organizationIds=[${this._user.organizations.map(each => each.organizationId)}]` : ''}`;
  }
}
