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
  constructor(ctx, resource, filters, endpoint, limit=20) {
    this.ctx      = ctx;
    this.resource = resource;
    this.filters  = filters;
    this.endpoint = endpoint || `/${ resource }`;
    this.timer    = null;
    this.limit    = limit;
  }

  /**
   * Initiates index request against API and populates the state and relay.
   * @return {Void}
   */
  init(initialQuery) {
    api.get(this.endpoint, {
      order  : 'created_at,DESC',
      offset : this.ctx.state.offset,
      limit  : this.limit,
      ...(initialQuery || {}),
    }, (err, data) => {
      if (err) {
        return snackbar.notify({
          type    : 'danger',
          message : err.message
        });
      }
      this.ctx.setState({
        more   : data.length === this.limit,
        offset : this.ctx.state.offset + data.length
      });
      this.data = data;
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
    if (this.ctx.state.sort) {
      var { key, order } = this.ctx.state.sort;
    }
    let search         = this.ctx.state.search;
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

    // Paginate here...
    // this.ctx.state.offset === page
    return list.map(item => this.ctx.row(item));
  }

  // Performs a search against the api.
  search_handler = (queryObj, force, dom) => {
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
    if(! (queryObj.offset) ) {
      queryObj.offset = this.ctx.state.offset;
    }
 
    if (query || force) {
      if (dom) {
        dom.style.background = 'url("images/site/spinner.gif") #fff 0 50% no-repeat';
        dom.style.textIndent = '20px';
      }
      api.get(this.endpoint, queryObj, (err, data) => {
        if (dom) {
          dom.style.background = '#fff';
        }
        if (err) {
          return snackbar.notify({
            type    : 'danger',
            message : err.message
          });
        }
        this.ctx.setState({
          search : query,
          searchObj: queryObj,
          more   : data.length === this.limit,
          offset : data.length
        });
        this.data = data;
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
  // and calls the search handler on it within
  // a loop.  If this is insufficient, you can
  // always call search_handler directly. Please
  // note the documentation on the likely 
  // counter-intuitive format.
  search = (e, value, dom, opts) => {
    this.ctx.setState({offset: 0}, () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        let query = '';
        if(value) {
          query = value;
        } else if (e && e.target) {
          query = e.target.value;
        } 
        this.search_handler({
          offset: 0,
          limit: this.limit || 20,
          search: query,
          ...opts,
        }, false, dom);
      }, 700);
    });
  }

  /**
   * Loads the next this.limit records from the api.
   * TODO: Make this into pagination rather than load more...
   * @param {bool} replace
   * @return {Void}
   */
  more = (replace) => {
    let queryObj = this.ctx.state.searchObj;
    queryObj.offset = this.ctx.state.offset;
    queryObj.limit = this.limit;
    api.get(this.endpoint, queryObj, (err, data) => {
      if (err) {
        return snackbar.notify({
          type    : 'danger',
          message : err.message
        });
      }
      this.ctx.setState({
        more   : data.length === this.limit,
        offset : this.ctx.state.offset + data.length
      });
      if (!replace) {
        data = [
          ...this.ctx.state[this.resource],
          ...data
        ];
      }
      this.data = data;
      relay.dispatch(this.resource, {
        type : 'index',
        data : data
      });
    });
  }

};
