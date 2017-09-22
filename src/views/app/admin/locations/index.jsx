import React             from 'react';
import moment            from 'moment';
import { api, relay, dom }    from 'bento';
import Table             from 'bento-service/table';
import mixin             from 'react-mixin';
import { History, Link } from 'react-router';
import ThSort            from '../components/table-th';

@mixin.decorate(History)
class TableIndex extends React.Component {

  constructor(...args) {
    super(...args);
    //self._debug = true;
    this.table = new Table(this, 'locations', null, '/locations?details=true');
    //this.table = new Table(this, 'locations', ['car', 'user'], '/locations?details=true');
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
    relay.subscribe(this, 'locations');
  }

  componentDidMount() {
    this.table.init();
    dom.setTitle("Locations");
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
    relay.unsubscribe(this, 'locations');
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

  redirectToLocation(id) {
    if(this.isMobile()) {
      location.href = '/locations/' + id;
    }
  }

  row(location) {
    let duration;
    if (location.details && location.status !== 'cancelled') {
      let start, end = moment.utc();

      for (let i = 0; i < location.details.length; i++) {
        let detail = location.details[i];
        if (detail.type === 'start') {
          start = moment(detail.createdAt);
        }
        else if (detail.type === 'end') {
          end = moment(detail.createdAt);
        }
      }

      duration = moment.utc(moment.duration(end.diff(start)).asMilliseconds()).format("H:mm");
      if(duration === '0:00') {
        duration = "< 1m";
      }

    }
    return (
      <tr key={ location.id } onClick={()=>this.redirectToLocation(location.id)}>
        <td className="hidden-sm-down">{ location.type }</td>
        <td className="hidden-sm-down">{ location.name }</td>
        <td className="hidden-sm-down">{ location.address }</td>

        <td className="hidden-sm-down">{ location.status }</td>
        <td className="hidden-md-up no-wrap"><i className={ `fa fa-${ this.state.icons[location.status]}` }></i> { location.car ? (location.car.license || location.carId) : '(unknown)' }</td>
        <td title={ moment(location.createdAt).format('HH:mm:ss MM-DD-YY') }>{ moment(location.createdAt).format('HH:mm MM-DD') }</td>
        <td className="no-wrap">{ duration }</td>
        <td className="hidden-sm-down">
          <Link to={ `/locations/${ location.id }` }>
            <i className="material-icons" style={{ marginTop : 5 }}>pageview</i>
          </Link>
        </td>
      </tr>
    );
  }

  render() {
    return (
      <div id="locations-list" className="container">
        <div className="box full">
          <h3>Locations</h3>
          <div className="box-content">
            <div id="isMobile" className="hidden-sm-down"></div>
            <table className="box-table table-striped">
              <thead>
                <tr ref="sort">
                  <ThSort sort="type"     value="Type"     ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="name"     value="Name"    ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="address"  value="Address"  ctx={ this } />
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
