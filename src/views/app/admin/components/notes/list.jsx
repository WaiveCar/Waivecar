import React from 'react';
import { api, relay } from 'bento';
import AddNote from './add';
import Note from './note';

module.exports = class NotesList extends React.Component {

  static propTypes = {
    type: React.PropTypes.string.isRequired,
    identifier: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]).isRequired
  }

  constructor(...args) {
    super(...args);
    this.state = { notes : [] };

    relay.subscribe(this, 'notes');
  }

  componentDidMount() {
    api.get(this._buildUrl(this.props.type, this.props.identifier), (err, notes) => {
      relay.dispatch('notes', {
        type : 'index',
        data : notes
      });
    });
  }

  render() {
    return (
      <div className='box'>
        <h3>
          Notes
          <small>Admin provided notes</small>
        </h3>
        <div className='box-content'>
          <div className='container-fluid notes'>
            { this.state.notes.map(note => {
              return <Note key={ note.id } note={ note } type={ this.props.type } />;
            }) }
          </div>
          <AddNote type={ this.props.type } identifier={ this.props.identifier }/>
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
    return `/${ type }s/${ identifier }/notes`;
  }
}
