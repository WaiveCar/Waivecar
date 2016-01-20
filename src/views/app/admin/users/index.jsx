import React             from 'react';
import { relay }         from 'bento';
import Table             from 'bento-service/table';
import mixin             from 'react-mixin';
import { History, Link } from 'react-router';
import ThSort            from '../components/table-th';

@mixin.decorate(History)
class UsersListView extends React.Component {

  /**
   * Subscribes to the users relay store.
   * @param  {...[type]} args
   * @return {Void}
   */
  constructor(...args) {
    super(...args);
    this.table = new Table(this, 'users', [ 'lastName', 'firstName', 'email', 'status' ]);
    this.state = {
      search : null,
      sort   : {
        key   : null,
        order : 'DESC'
      },
      more   : false,
      offset : 0
    };
    relay.subscribe(this, 'users');
  }

  /**
   * Set users on component load.
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
   * Unsubscribe from users relay.
   * @return {Void}
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'users');
  }

  /**
   * Renders the user row.
   * @param  {Object} user
   * @return {Object}
   */
  row(user) {
    return (
      <tr key={ user.id }>
        <td>{ user.id }</td>
        <td>{ user.firstName } { user.lastName }</td>
        <td className="hidden-sm-down">{ user.email }</td>
        <td className="hidden-sm-down">{ user.role.title }</td>
        <td>{ user.status }</td>
        <td>
          <Link to={ `/users/${ user.id }` }>
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
      <div id="users-list" className="container">
        <div className="box full">
          <h3>Users <small>List of registered WaiveCar users</small></h3>
          <div className="box-content">
            <input type="text" className="box-table-search" ref="search" placeholder="Enter search text [name, email, status]" onChange={ this.table.search } />
            <table className="box-table table-striped">
              <thead>
                <tr ref="sort">
                  <ThSort sort="id"         value="#"      ctx={ this } />
                  <ThSort sort="firstName"  value="Name"   ctx={ this } />
                  <ThSort sort="email"      value="Email"  ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="role.title" value="Role"   ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="status"     value="Status" ctx={ this } />
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

module.exports = UsersListView;
