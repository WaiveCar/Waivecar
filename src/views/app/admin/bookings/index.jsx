import React             from 'react';
import moment            from 'moment';
import { api, relay }    from 'bento';
import Table             from 'bento-service/table';
import mixin             from 'react-mixin';
import { History, Link } from 'react-router';
import ThSort            from '../components/table-th';

@mixin.decorate(History)
class TableIndex extends React.Component {

  /**
   * Subscribes to the bookings relay store.
   * @param  {...[type]} args
   * @return {Void}
   */
  constructor(...args) {
    super(...args);
    //self._debug = true;
    this.table = new Table(this, 'bookings', null, '/bookings?details=true');
    //this.table = new Table(this, 'bookings', ['car', 'user'], '/bookings?details=true');
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
    this.table.init();
    this.setState({
      sort : {
        key   : 'id',
        order : 'ASC'
      },
      searchObj: {
        order: 'id,DESC'
      }
    });
  }

  /**
   * Unsubscribe from bookings relay.
   * @return {Void}
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'bookings');
  }

  search_date_real(el) {
    let 
      query = el.target.value.toLowerCase().trim(),
      isValid = (query === 'now') || query.match(/^\d{1,2}.(0?[1-9]|[1-3][0-9])(.\d{2,4}|)$/),
      cutoff = false;

    if(!isValid) {
      return;
    }
    cutoff = (query === 'now') ? moment().unix() : moment(query, [ 'MM-DD-YYYY' ]).unix();

    if(cutoff) {
      this.table.search_handler({cutoff: cutoff}, true);
    }
  }

  search_date(el) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.search_date_real(el);
    }, 500);
  }

  reportStatus() {
    api.get('/status', {}, ( err, data ) => {
      if (err) {
        return this.error(err.message);
      }
    });
  }

  /**
   * Renders the booking row.
   * @param  {Object} booking
   * @return {Object}
   */
  row(booking) {
    let duration;
    if (booking.details && booking.details.length >= 2) {
      let start, end;
      for (let i = 0; i < booking.details.length; i++) {
        let detail = booking.details[i];
        if (detail.type === 'start') start = moment(detail.createdAt);
        else if (detail.type === 'end') end = moment(detail.createdAt);
      }

      duration = moment.duration(end.diff(start)).humanize();
    }
    return (
      <tr key={ booking.id }>
        <td><Link to={ `/bookings/${ booking.id }` }>{ booking.id }</Link></td>
        <td className="hidden-sm-down"><Link to={ `/cars/${ booking.carId }` }>{ booking.car ? (booking.car.license || booking.carId) : '(unknown)' }</Link></td>
        <td className="hidden-sm-down"><Link to={ `/users/${ booking.userId }` } >{ `${ booking.user.firstName} ${ booking.user.lastName }` }</Link></td>
        <td>{ booking.status }</td>
        <td>{ moment(booking.createdAt).format('HH:mm YYYY-MM-DD') }</td>
        <td>{ duration }</td>
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
          <h3>Bookings <button className="pull-right btn btn-info btn-sm" onClick={ this.reportStatus }>Send to Slack</button></h3>
          <div className="box-content">
            <div className="row">
              <div className="col-md-3">
                <input type="text" className="form-control box-table-search" ref="date" placeholder="Cut off MM-DD-YY / Now" onChange={ this.search_date.bind(this) } />
              </div>
              <div className="col-md-9">
                <input type="text" className="form-control box-table-search" ref="search" placeholder="Search text [name, car]" onChange={ this.table.search } />
              </div>
            </div>
            <table className="box-table table-striped">
              <thead>
                <tr ref="sort">
                  <ThSort sort="id"        value="#"       ctx={ this } className="text-center" style={{ width : 45 }} />
                  <ThSort sort="carId"     value="Car"     ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="userId"    value="User"    ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="status"    value="Status"  ctx={ this } />
                  <ThSort sort="createdAt" value="Created" ctx={ this } style={{ width : 125 }} />
                  <th className='hidden-sm-down'>Duration</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                { this.table.index() }
              </tbody>
            </table>
            {
              this.state.more ?
                <div className="text-center" style={{ marginTop : 20 }}>
                  <button className="btn btn-primary" onClick={ this.table.more }>Load More</button>
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
