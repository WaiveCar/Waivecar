import React             from 'react';
import { relay, dom }         from 'bento';
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
    this.table = new Table(this, 'users', [ ['firstName', 'lastName'], 'email' ]);
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
    dom.setTitle("Users");
    this.table.init();
    this.setState({
      sort : {
        key   : 'id',
        order : 'ASC'
      }
    });
  }

  componentWillUnmount() {
    relay.unsubscribe(this, 'users');
  }

  row(user) {
    return (
      <tr key={ user.id }>
        <td>{ user.id }</td>
        <td>{ user.firstName } { user.lastName }</td>
        <td className="hidden-sm-down">{ user.email }</td>
        <td className="hidden-sm-down">{ user.role.title }</td>
        <td className="hidden-sm-down">{ user.tier }</td>
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
   * Toggle field in DB.
   * @param  {int} user id
   * @return {Void}
   */
  toggleIsWaivework(user) {
    console.log('Sent request, user ID is: ' + user.id + ', isWaivework is: ' + user.isWaivework);
    // TODO: Get response and give value of "isWaivework" to "result"
    let result = !user.isWaivework;
    let arr = this.state.users;
    for (let i=0; i<arr.length; i++){
      if (arr[i].id === user.id){
        arr[i].isWaivework = result;
      }
    }
    this.setState({users: arr});
  }

  render() {
    return (
      <div id="users-list" className="container">
        <div className="box full">
          <h3>Users <small>List of registered WaiveCar users</small></h3>
          <div className="box-content">
            <input 
              type="text" 
              className="box-table-search" 
              ref={(input) => { this.textInput = input; }}
              placeholder="Enter search text [name, email, status]" 
              onChange={ (e) => { this.table.search(false, this.textInput.value, this.textInput) }  } />
            <table className="box-table table-striped">
              <thead>
                <tr ref="sort">
                  <ThSort sort="id"          value="#"           ctx={ this } />
                  <ThSort sort="firstName"   value="Name"        ctx={ this } />
                  <ThSort sort="email"       value="Email"       ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="role.title"  value="Role"        ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="tier"        value="Tier"        ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="status"      value="Status"      ctx={ this } className="hidden-sm-down" />
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
