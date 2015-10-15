'use strict';

import React from 'react';
import './style.scss';

export default class DropZone extends React.Component {
  
  /**
   * Bind component methods.
   * @param  {...Mixed} args
   */
  constructor(...args) {
    super(...args);
    this.onDrop = this.onDrop.bind(this);
    this.open   = this.open.bind(this);
    this.state  = {
      files : []
    };
  }

  /**
   * @param  {Object} e
   */
  onEnter(e) {
    e.preventDefault();
  }

  /**
   * Prepare files.
   * @param  {Object} e
   */
  onDrop(e) {
    e.preventDefault();

    let files    = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    let previews = [];

    // ### Create Preview
    // Map the files array and add a preview url to each file.

    for (let key in files) {
      if (files.hasOwnProperty(key)) {
        let preview = URL.createObjectURL(files[key]);
        files[key].preview = preview;
        previews.push({
          pos : key,
          url : preview
        });
      }
    }

    // ### Update Preview State

    this.setState({
      files : [
        ...this.state.files,
        ...previews
      ]
    });

    // ### External Handler

    if (this.props.onDrop) {
      this.props.onDrop(files, e);
    }
  }

  /**
   * Opens up a file selection window.
   */
  open() {
    let input   = this.refs.file;
    input.value = null;
    input.click();
  }

  /**
   * Return dropzone component.
   * @return {Object}
   */
  render() {
    return (
      <div className="dropzone clearfix">
        <div
          ref         = "dropzone"
          className   = "dropzone-drop"
          onClick     = { this.open }
          onDragEnter = { this.onEnter }
          onDragOver  = { (e) => { e.preventDefault() } }
          onDrop      = { this.onDrop } 
        >
          <div className="dropzone-drop-title">
            Drop files to upload
            <small>
              (or click)
            </small>
          </div>
        </div>
        <input
          type     = "file"
          ref      = "file"
          style    = {{ display : 'none' }}
          onChange = { this.onDrop }
          multiple = "true"
        />
        {
          this.state.files.map((file, key) => {
            return (
                <div
                  key       = { key }
                  className = "dropzone-file"
                  style     = {{ background : `url('${ file.url }') center center / cover` }} 
                >
                  <div className="dropzone-file-overlay" />
                </div>
            )
          }.bind(this))
        }
      </div>
    );
  }

}