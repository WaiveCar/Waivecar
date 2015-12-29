import React             from 'react';
import moment            from 'moment';
import { relay, api }    from 'bento';
import { snackbar }      from 'bento-web';
import mixin             from 'react-mixin';
import { History, Link } from 'react-router';
import ThSort            from '../components/table-th';

let timer = null;

@mixin.decorate(History)
class TableIndex extends React.Component {

  /**
   * Subscribes to the bookings relay store.
   * @param  {...[type]} args
   * @return {Void}
   */
  constructor(...args) {
    super(...args);
    this.state = {
      sort : {
        key   : null,
        order : 'DESC'
      },
      more   : false,
      offset : 0
    };
    relay.subscribe(this, 'bookings');
  }

  /**
   * Set bookings on component load.
   * @return {Void}
   */
  componentDidMount() {
    let count = this.state.bookings.length;
    if (count < 20) {
      this.setBookings();
    }
    this.setState({
      more   : count % 20 === 0,
      offset : count
    });
  }

  /**
   * Unsubscribe from users relay.
   * @return {Void}
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'users');
  }

  /**
   * Loads bookings from api and updates the bookings relay index.
   */
  setBookings() {
    api.get('/bookings', {
      limit  : 20,
      offset : this.state.offset,
      order  : 'created_at,DESC'
    }, (err, bookings) => {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
      this.bookings.index(bookings);
      this.setState({
        more   : bookings.length === 20,
        offset : this.state.offset + bookings.length
      });
    });
  }

  /**
   * Loads more user records and appends them to the current state index.
   * @return {Void}
   */
  loadMore = () => {
    api.get('/bookings', {
      limit  : 20,
      offset : this.state.offset,
      order  : 'created_at,DESC'
    }, (err, bookings) => {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
      this.bookings.index([
        ...this.state.bookings,
        ...bookings
      ]);
      this.setState({
        more   : bookings.length === 20,
        offset : this.state.offset + bookings.length
      });
    });
  }

  /**
   * Renders the provided list.
   * @param  {Array} list
   * @return {Object}
   */
  renderIndex(list) {
    let { key, order } = this.state.sort;
    if (key) {

      // ### Adjust Classes
      // Removes and adds correct classNames to sortable columns.

      [].slice.call(this.refs.sort.children).map((th) => {
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
    return list.map(item => this.renderItem(item));
  }

  /**
   * Renders the booking row.
   * @param  {Object} booking
   * @return {Object}
   */
  renderItem(booking) {
    return (
      <tr key={ booking.id }>
        <td>{ booking.id }</td>
        <td className="hidden-sm-down">{ booking.carId }</td>
        <td className="hidden-sm-down">{ booking.userId }</td>
        <td>{ booking.status }</td>
        <td>{ moment(booking.createdAt).format('HH:mm YYYY-MM-DD') }</td>
        <td>
          <Link to={ `/bookings/${ booking.id }` }>
            <i className="material-icons" style={{ marginTop : 5 }}>pageview</i>
          </Link>
        </td>
      </tr>
    );
  }

  /**
   * Render the user table index.
   * @return {Object}
   */
  render() {
    return (
      <div id="bookings-list" className="container">
        <div className="box full">
          <h3>Bookings <small>List of registered WaiveCar bookings</small></h3>
          <div className="box-content">
            <table className="box-table table-striped">
              <thead>
                <tr ref="sort">
                  <ThSort sort="id"        value="#"       ctx={ this } className="text-center" style={{ width : 45 }} />
                  <ThSort sort="carId"     value="Car"     ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="userId"    value="User"    ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="status"    value="Status"  ctx={ this } />
                  <ThSort sort="createdAt" value="Created" ctx={ this } style={{ width : 125 }} />
                  <th></th>
                </tr>
              </thead>
              <tbody>
                { this.renderIndex(this.state.bookings) }
              </tbody>
            </table>
            {
              this.state.more ?
                <div className="text-center" style={{ marginTop : 20 }}>
                  <button className="btn btn-primary" onClick={ this.loadMore }>Load More</button>
                </div>
                :
                ''
            }
          </div>
        </div>
      </div>
    );
  }

};

module.exports = TableIndex;
