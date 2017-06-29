import { api, relay } from 'bento';
import { snackbar }   from 'bento-web';

module.exports = class Table {

  /**
   * Sets up the instance.
   * @param  {Object} ctx        The component instance.
   * @param  {String} resource   The resource this table is consuming.
   * @param  {Array}  filters    The fields that are filtered in the search.
   * @param  {String} [endpoint] Optional endpoint if resource name is not the same.
   * @return {Void}
   */
  constructor(ctx, resource, filters, endpoint) {
    this.ctx      = ctx;
    this.resource = resource;
    this.filters  = filters;
    this.endpoint = endpoint || `/${ resource }`;
    this.timer    = null;
  }

  /**
   * Initiates index request against API and populates the state and relay.
   * @return {Void}
   */
  init() {
    api.get(this.endpoint, {
      order  : 'created_at,DESC',
      offset : this.ctx.state.offset,
      limit  : 20
    }, (err, data) => {
      if (err) {
        return snackbar.notify({
          type    : 'danger',
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
    let search         = this.ctx.state.search;
    let list           = this.ctx.state[this.resource];

    /*
     if (search) {
     let re = new RegExp(search, 'i');
     let candidate = null;

     list = list.filter(item => {

     return this.filters.reduce( (res, index) => {
     // cheap array check
     if (index.map) {
     candidate = index.map((key) => { return item[key] }).join(' ');
     } else {
     candidate = item[index];
     }

     if (!candidate) { return res; }

     return res | (candidate.search(re) !== -1);
     }, false);

     });
     }
     */

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

    // Paginate here...
    // this.ctx.state.offset === page

    return list.map(item => this.ctx.row(item));
  }

  // Performs a search against the api.
  search_handler = (queryObj, force) => {
    // Older ct code presumed a k/v pair of { search : text }
    // This proves to be insufficient when other constraints,
    // such as a date are being queried.  So this is backwards
    // compatible with the old world while providing an ability
    // to pass a more expressive object in.
    queryObj = Object.assign(

      // the old query
      (this.ctx.state.searchObj || {}),

      // this new one ... second argument takes precedent in
      // object.assign
      queryObj
    );

    let query = queryObj.search;
    
    if (query || force) {
      api.get(this.endpoint, queryObj, (err, data) => {
        if (err) {
          return snackbar.notify({
            type    : 'danger',
            message : err.message
          });
        }
        this.ctx.setState({
          search : query,
          searchObj: queryObj,
          more   : data.length === 20,
          offset : data.length
        });
        relay.dispatch(this.resource, {
          type : 'index',
          data : data
        });
      });
    } else {
      this.init();
      this.ctx.setState({
        search : null,
        searchObj: queryObj
      });
    }
  }

  // grabs an input value from a dom element
  // and calls the searc handler on it within
  // a loop.  If this is insufficient, you can
  // always call search_handler directly. Please
  // note the documentation on the likely 
  // counter-intuitive format.
  search = (e) => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.search_handler({search: e.target.value, limit  : 20});
    }, 500);
  }

  /**
   * Loads the next 20 records from the api.
   * TODO: Make this into pagination rather than load more...
   * @param {bool} replace
   * @return {Void}
   */
  more = (replace) => {


    var searchObj = Object.assign({
      order  : 'created_at,DESC',
      limit  : 20,
      offset : this.ctx.state.offset
    }, this.ctx.state.searchObj);

    api.get(this.endpoint, searchObj, (err, data) => {
      if (err) {
        return snackbar.notify({
          type    : 'danger',
          message : err.message
        });
      }
      this.ctx.setState({
        more   : data.length === 20,
        offset : this.ctx.state.offset + data.length
      });
      if (!replace) {
        data = [
          ...this.ctx.state[this.resource],
          ...data
        ];
      }
      relay.dispatch(this.resource, {
        type : 'index',
        data : data
      });
    });
  }

};
