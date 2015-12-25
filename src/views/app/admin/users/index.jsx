import React             from 'react';
import { relay, api }    from 'bento';
import { snackbar }      from 'bento-web';
import mixin             from 'react-mixin';
import { History, Link } from 'react-router';

let timer = null;

@mixin.decorate(History)
class UsersListView extends React.Component {

  /**
   * Subscribes to the users relay store.
   * @param  {...[type]} args
   * @return {Void}
   */
  constructor(...args) {
    super(...args);
    this.state = {
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
    let count = this.state.users.length;
    if (count < 20) {
      this.setUsers();
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
   * Loads users from api and updates the users relay index.
   */
  setUsers() {
    api.get('/users', {
      limit  : 20,
      offset : this.state.offset
    }, (err, users) => {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
      this.users.index(users);
      this.setState({
        more   : users.length === 20,
        offset : this.state.offset + users.length
      });
    });
  }

  /**
   * Loads more user records and appends them to the current state index.
   * @return {Void}
   */
  loadMore = () => {
    api.get('/users', {
      limit  : 20,
      offset : this.state.offset
    }, (err, users) => {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
      this.users.index([
        ...this.state.users,
        ...users
      ]);
      this.setState({
        more   : users.length === 20,
        offset : this.state.offset + users.length
      });
    });
  }

  /**
   * Sends a search request to the api.
   * @param  {Object} e
   * @return {Void}
   */
  search = (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      let search = e.target.value;
      if (search) {
        api.get('/users', {
          search : search
        }, (err, users) => {
          if (err) {
            return snackbar.notify({
              type    : `danger`,
              message : err.message
            });
          }
          this.users.index(users);
        });
      } else {
        this.setUsers();
      }
    }, 500);
  }

  /**
   * Renders the user row.
   * @param  {Object} user
   * @return {Object}
   */
  renderUser(user) {
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
            <input type="text" className="box-table-search" ref="search" placeholder="Enter search text" onChange={ this.search } />
            <table className="box-table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th className="hidden-sm-down">Email</th>
                  <th className="hidden-sm-down">Role</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                { this.state.users.map(user => this.renderUser(user)) }
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

module.exports = UsersListView;
