import React             from 'react';
import moment            from 'moment';
import { relay }         from 'bento';
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
    this.table = new Table(this, 'bookings', null, '/bookings?details=true');
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

  /**
   * Renders the booking row.
   * @param  {Object} booking
   * @return {Object}
   */
  row(booking) {
    let duration;
    if (booking.details.length >= 2) {
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
        <td className="hidden-sm-down"><Link to={ `/cars/${ booking.carId }` }>{ booking.car.license || booking.carId }</Link></td>
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
