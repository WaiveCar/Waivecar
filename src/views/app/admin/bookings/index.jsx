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
    this.table = new Table(this, 'bookings');
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
      this.table.init();
    }
    this.setState({
      more   : count % 20 === 0,
      offset : count
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
