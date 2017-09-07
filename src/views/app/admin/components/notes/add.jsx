import React from 'react';
import { api } from 'bento';
import { Form } from 'bento/lib/helpers';
import { snackbar } from 'bento-web';

module.exports = class AddNote extends React.Component {

  static propTypes = {
    type: React.PropTypes.string.isRequired,
    identifier: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]).isRequired
  }

  constructor(...args) {
    super(...args);

    this.addNote = this.addNote.bind(this);
  }

  addNote(evnt) {
    let form = new Form(evnt);
    let data = form.data;
    data[`${ this.props.type }Id`] = this.props.identifier;
    api.post(`/notes/${ this.props.type }`, data, () => {});
  }

  render() {
    return (
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-sm-12'>
            <form className='bento-form-static' onSubmit={ this.addNote }>
              <div className='form-group'>
                <div className='bento-form-input'>
                  <textarea name='content' className='form-control' placeholder='New Note'></textarea>
                </div>
              </div>
              <button type='submit' className='btn btn-primary'>Submit</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
