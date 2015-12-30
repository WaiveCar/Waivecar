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
   * Subscribes to the licenses relay store.
   * @param  {...[type]} args
   * @return {Void}
   */
  constructor(...args) {
    super(...args);
    this.table = new Table(this, 'licenses');
    this.state = {
      sort : {
        key   : null,
        order : 'DESC'
      },
      more   : false,
      offset : 0
    };
    relay.subscribe(this, 'licenses');
  }

  /**
   * Set licenses on component load.
   * @return {Void}
   */
  componentDidMount() {
    let count = this.state.licenses.length;
    if (count < 20) {
      this.table.init();
    }
    this.setState({
      more   : count % 20 === 0,
      offset : count
    });
  }

  /**
   * Unsubscribe from licenses relay.
   * @return {Void}
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'licenses');
  }

  /**
   * Renders the license row.
   * @param  {Object} license
   * @return {Object}
   */
  row(license) {
    return (
      <tr key={ license.id }>
        <td>{ license.id }</td>
        <td className="hidden-sm-down">{ license.userId }</td>
        <td>{ license.firstName }</td>
        <td>{ license.lastName }</td>
        <td className="hidden-sm-down">{ license.status }</td>
        <td className="hidden-sm-down">{ license.outcome }</td>
        <td className="hidden-sm-down">{ moment(license.createdAt).format('HH:mm YYYY-MM-DD') }</td>
        <td>
          <Link to={ `/users/${ license.userId }` }>
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
          <h3>Licenses <small>List of registered licenses</small></h3>
          <div className="box-content">
            <table className="box-table table-striped">
              <thead>
                <tr ref="sort">
                  <th>#</th>
                  <ThSort sort="userId"    value="User"       ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="firstName" value="First Name" ctx={ this } />
                  <ThSort sort="lastName"  value="Last Name"  ctx={ this } />
                  <ThSort sort="status"    value="Status"     ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="outcome"   value="Outcome"    ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="createdAt" value="Created"    ctx={ this } className="hidden-sm-down" />
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
