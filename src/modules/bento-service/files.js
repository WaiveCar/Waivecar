'use strict';

import { api }      from 'bento';
import { snackbar } from 'bento-web';

module.exports = class Files {

  /**
   * Assigns the provided ref to the file instance.
   * @param  {Object} ctx
   * @param  {Object} ref
   * @return {Void}
   */
  constructor(ctx, ref) {
    this.ctx = ctx;
    this.ref = ref;

    // ### Function Binders

    this.select = this.select.bind(this);
    this.upload = this.upload.bind(this);
    this.delete = this.delete.bind(this);
  }

  /**
   * Opens file selection box.
   * @return {Void}
   */
  select() {
    this.ctx.refs[this.ref].click();
  }

  /**
   * Uploads a file against the provided url.
   * @param  {String} url
   * @param  {String} [prev] Id of the file you wish to delete after successfull upload
   * @return {Void}
   */
  upload(url, prev) {
    return () => {
      api.file(url, {
        files : this.ctx.refs[this.ref].files
      }, (err) => {
        if (err) {
          return snackbar.notify({
            type    : `danger`,
            message : err.message
          });
        }
        if (prev) {
          this.delete(prev); // Delete previous avatar, reduces bloat...
        }
      });
    }
  }

  /**
   * Deletes a file with the provided id.
   * @param  {String} id
   * @return {Void}
   */
  delete(id) {
    api.delete(`/files/${ id }`, (err) => {
      if (err) {
        snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
    });
  }

};
