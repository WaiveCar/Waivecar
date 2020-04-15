import React             from 'react';
import moment            from 'moment';
import { api, relay, dom, auth }    from 'bento';
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
    this.userOrganizations = auth.user().organizations.map(each => each.organizationId);
    this.table = new Table(this, 'bookings', null, `/bookings?details=true${
      this.userOrganizations.length ? 
      `&organizationIds=[${this.userOrganizations}]`: ''
    }`);
    //this.table = new Table(this, 'bookings', ['car', 'user'], '/bookings?details=true');
    this.state = {
      sort : {
        key   : null,
        order : 'DESC'
      },
      more   : false,
      offset : 0,
      icons: {
        "completed": "check",
        "closed": "check",
        "ended": "lock",
        "cancelled": "times",
        "started": "play",
        "reserved": "hourglass"
      }
    };
    relay.subscribe(this, 'bookings');
  }

  /**
   * Set bookings on component load.
   * @return {Void}
   */
  componentDidMount() {
    this.table.init();
    dom.setTitle("Bookings");
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

  componentWillUnmount() {
    relay.unsubscribe(this, 'bookings');
  }

  search_date_real(value) {
    let 
      query = value.toLowerCase().trim(),
      // splits up the query into m/d/y 
      isValid = (query === 'now') || query.match(/^(\d+.\d+).?(\d+|)$/),
      cutoff = false, date, year;

    if(!isValid) {
      return;
    }

    if(query !== 'now') {
      date = isValid[1];
      year = parseInt(isValid[2], 10) || 0;
     
      // if the year isn't there then we add it on.
      if(year === 0) {
        year = (new Date()).getYear() - 100;
      }

      // If the year is 2 digits we make it 4.
      if(year < 100) {
        year += 2000;
      }

      // we update the query
      query = [date,year].join('-');
    }

    cutoff = (query === 'now') ? moment().unix() : moment(query, 'MM-DD-YYYY').unix();

    if(cutoff > 0) {
      this.table.search_handler({cutoff: cutoff}, true, this.dateInput);
    }
  }

  search_handler(what) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if(what === 'date') {
        this.search_date_real(this.dateInput.value);
      } else {
        this.table.search(false, this.userInput.value, this.userInput);
      }
    }, 500);
  }

  reportStatus() {
    api.get('/status', {}, ( err, data ) => {
      if (err) {
        return this.error(err.message);
      }
    });
  }

  isMobile() {
    return window.getComputedStyle(document.getElementById('isMobile')).display === 'none';
  }

  redirectToBooking(id) {
    if(this.isMobile()) {
      location.href = '/bookings/' + id;
    }
  }

  /**
   * Renders the booking row.
   * @param  {Object} booking
   * @return {Object}
   */
  row(booking) {
    let duration;
    if (booking.details && booking.status !== 'cancelled') {
      let start, end = moment.utc();

      for (let i = 0; i < booking.details.length; i++) {
        let detail = booking.details[i];
        if (detail.type === 'start') {
          start = moment(detail.createdAt);
        }
        else if (detail.type === 'end') {
          end = moment(detail.createdAt);
        }
      }

      const millisecondsInDay = 86400000;

      let durationInMs = moment.duration(end.diff(start)).asMilliseconds();
      let days = Math.floor(durationInMs / millisecondsInDay);

      duration = moment.utc(durationInMs).format("H:mm");

      if (days > 0) {
        duration = days + 'd ' + duration;
      }

      if(duration === '0:00') {
        duration = "< 1m";
      }
    }
    return (
      <tr key={ booking.id } onClick={()=>this.redirectToBooking(booking.id)}>
        <td className="hidden-md-up">{ booking.id }</td>
        <td className="hidden-sm-down"><Link to={ `/bookings/${ booking.id }` }>{ booking.id }</Link></td>
        <td className="hidden-sm-down"><Link to={ `/cars/${ booking.carId }` }>{ booking.car ? (booking.car.license || booking.carId) : '(unknown)' }</Link></td>
        <td className="hidden-sm-down">
          <Link to={ `/users/${ booking.userId }` } >{ booking.user ? `${ booking.user.firstName} ${ booking.user.lastName }` : '' }
          </Link>
        </td>
        <td className="hidden-sm-down">{ booking.status }</td>
        <td className="hidden-md-up no-wrap"><i className={ `fa fa-${ this.state.icons[booking.status]}` }></i> { booking.car ? (booking.car.license || booking.carId) : '(unknown)' }</td>
        <td title={ moment(booking.createdAt).format('HH:mm:ss MM-DD-YY') }>{ moment(booking.createdAt).format('HH:mm MM-DD') }</td>
        <td className="no-wrap">{ duration }</td>
        <td className="hidden-sm-down">
          <Link to={ `/bookings/${ booking.id }` }>
            <i className="material-icons" style={{ marginTop : 5 }}>pageview</i>
          </Link>
        </td>
      </tr>
    );
  }

  render() {
    return (
      <div id="bookings-list" className="container">
        <div className="box full">
          <h3>Bookings <button className="pull-right btn btn-info btn-sm" onClick={ this.reportStatus }>Send to Slack</button></h3>
          <div className="box-content">
            <div className="row">
              <div className="col-md-3">
                <input type="text" 
                  className="form-control box-table-search" 
                  ref={(input) => { this.dateInput = input; }}
                  placeholder="Cut off MM-DD-YY / Now" 
                  onChange={ this.search_handler.bind(this, 'date') } 
                />
              </div>
              <div className="col-md-9">
                <input type="text" 
                  className="form-control box-table-search" 
                  ref={(input) => { this.userInput = input; }}
                  placeholder="Search text [name, car]" 
                  onChange={ this.search_handler.bind(this, 'user') } 
                />
              </div>
            </div>
            <div id="isMobile" className="hidden-sm-down"></div>
            <table className="box-table table-striped">
              <thead>
                <tr ref="sort">
                  <ThSort sort="id"        value="#"       ctx={ this } className="text-center" style={{ width : 45 }} />
                  <ThSort sort="carId"     value="Car"     ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="userId"    value="User"    ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="status"    value="Status"  ctx={ this } />
                  <ThSort sort="createdAt" value="Created" ctx={ this } style={{ width : 125 }} />
                  <th className='hidden-sm-down'>Duration</th>
                  <th className="hidden-sm-down"></th>
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
