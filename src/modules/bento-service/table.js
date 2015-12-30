import { api, relay } from 'bento';
import { snackbar }   from 'bento-web';

module.exports = class Table {

  /**
   * Sets up the instance.
   * @param  {Object} ctx        The component instance.
   * @param  {String} resource   The resource this table is consuming.
   * @param  {String} [endpoint] Optional endpoint if resource name is not the same.
   * @return {Void}
   */
  constructor(ctx, resource, endpoint) {
    this.ctx      = ctx;
    this.resource = resource;
    this.endpoint = endpoint || `/${ resource }`;
    this.timer    = null;
  }

  /**
   * Initiates index request against API and populates the state and relay.
   * @return {Void}
   */
  init() {
    api.get(this.endpoint, {
      limit  : 20,
      offset : this.ctx.state.offset
    }, (err, data) => {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
      this.ctx.setState({
        more   : data.length === 20,
        offset : this.ctx.state.offset + data.length
      });
      relay.dispatch(this.resource, {
        type : 'index',
        data : data
      });
    });
  }

  /**
   * Returns an indexed array of the current list.
   * @return {Array}
   */
  index() {
    let { key, order } = this.ctx.state.sort;
    let list           = this.ctx.state[this.resource];
    if (key) {

      // ### Adjust Classes
      // Removes and adds correct classNames to sortable columns.

      [].slice.call(this.ctx.refs.sort.children).map((th) => {
        if (th.className)  { th.className = th.className.replace(/ASC|DESC/, '').trim(); }
        if (key === th.id) { th.className = `${ th.className } ${ order }`; }
      });

      // ### Perform Sort

      let isDeep   = key.match(/\./) ? true : false;
      let deepLink = isDeep ? key.split('.') : null;
      list = list.sort((a, b) => {
        a = isDeep ? deepLink.reduce((obj, key) => { return obj[key] }, a) : a[key];
        b = isDeep ? deepLink.reduce((obj, key) => { return obj[key] }, b) : b[key];
        if (a > b) { return order === 'DESC' ? 1 : -1; }
        if (a < b) { return order === 'DESC' ? -1 : 1; }
        return 0;
      });

    }
    return list.map(item => this.ctx.row(item));
  }

  /**
   * Performs a search against the api.
   * @param  {Object} e
   * @return {Void}
   */
  search = (e) => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      let search = e.target.value;
      if (search) {
        api.get(this.endpoint, {
          search : search
        }, (err, data) => {
          if (err) {
            return snackbar.notify({
              type    : `danger`,
              message : err.message
            });
          }
          this.ctx.setState({ offset : 0 });
          relay.dispatch(this.resource, {
            type : 'index',
            data : data
          });
        });
      } else {
        this.init();
      }
    }, 500);
  }

  /**
   * Loads the next 20 records from the api.
   * @return {Void}
   */
  more = () => {
    api.get(this.endpoint, {
      limit  : 20,
      offset : this.ctx.state.offset
    }, (err, users) => {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
      this.ctx.setState({
        more   : users.length === 20,
        offset : this.ctx.state.offset + users.length
      });
      relay.dispatch(this.resource, {
        type : 'index',
        data : [
          ...this.ctx.state[this.resource],
          ...users
        ]
      });
    });
  }

};
