'use strict';

import React          from 'react';
import Reach, { api } from 'reach-react';
import Snackbar       from '../snackbar';
import './style.scss';

export default class Content extends React.Component {

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
      }
    }
    this.submit = this.submit.bind(this);
  }

  /**
   * Load the component content from the api and update state.
   * @method componentDidMount
   */
  componentDidMount() {
    api.get(this.props.resource.show.uri.replace(':id', this.props.id), (error, result) => {
      if (error) {
        return Snackbar.notify({
          type    : `danger`,
          message : `Could not retrieve content [ID: ${ this.props.id }]`
        });
      }
      this.setState({
        key    : result.id,
        html   : {
          __html : `
            <div data-editable="html">
              ${ result.html ? result.html : '' }
            </div>
          `
        },
        editor : new ContentTools.EditorApp.get()
      }, () => {
        this.state.editor.init('[data-editable]', 'data-editable');
        this.state.editor.bind('save', this.submit);
      });
    });
  }

  /**
   * Destroy the editor when leaving the component.
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    if (this.state.editor) {
      this.state.editor.destroy();
    }
  }

  /**
   * @method submit
   * @param  {Object} region
   */
  submit(region) {
    api.put(this.props.resource.update.uri.replace(':id', this.props.id), {
      html : region.html
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
    }.bind(this));
  }

  /**
   * @method render
   */
  render() {
    return (
      <div 
        key                     = { this.state.key }
        dangerouslySetInnerHTML = { this.state.html }
        className               = 'text-component'
      />
    )
  }

}
