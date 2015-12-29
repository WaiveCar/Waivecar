import React             from 'react';
import { relay, api }    from 'bento';
import { snackbar }      from 'bento-web';
import mixin             from 'react-mixin';
import { History, Link } from 'react-router';
import ThSort            from '../components/table-th';

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
      sort : {
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
          this.setState({ offset : 0 });
          this.users.index(users);
        });
      } else {
        this.setUsers();
      }
    }, 500);
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
   * Renders the user row.
   * @param  {Object} user
   * @return {Object}
   */
  renderItem(user) {
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
            <input type="text" className="box-table-search" ref="search" placeholder="Enter search text [name, email, status]" onChange={ this.search } />
            <table className="box-table table-striped">
              <thead>
                <tr ref="sort">
                  <th>#</th>
                  <ThSort sort="firstName"  value="Name"   ctx={ this } />
                  <ThSort sort="email"      value="Email"  ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="role.title" value="Role"   ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="status"     value="Status" ctx={ this } />
                  <th></th>
                </tr>
              </thead>
              <tbody>
                { this.renderIndex(this.state.users) }
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
