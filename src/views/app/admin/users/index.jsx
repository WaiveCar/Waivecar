import React             from 'react';
import { relay, dom, auth}    from 'bento';
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
    this._user = auth.user();
    this.table = new Table(this, 'users', [ ['firstName', 'lastName'] ], 
    `/users${
      this._user.organizations.length ? `?organizationIds=[${this._user.organizations.map(each => each.organizationId)}]` : ''
    }`);
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
        key   : 'updated_at',
        order : 'ASC'
      },
      searchObj: {
        order: 'updated_at, DESC'
      }
    });
  }

  componentWillUnmount() {
    relay.unsubscribe(this, 'users');
  }

  formatPhone(what) {
    return what.replace(/^(\+1|)(\d{3})(\d{3})/, '($2) $3-');
  }

  row(user) {
    user.phone = user.phone || '';
    return (
      <tr key={ user.id } onClick={ () => { this.history.pushState(null, `/users/${ user.id }`) } }>
        <td>{ user.id }</td>
        <td>{ user.firstName } { user.lastName }</td>
        <td className="hidden-sm-down"><a href={ "tel:" + user.phone }>{ this.formatPhone(user.phone) }</a></td>
        <td>{ user.status }</td>
        <td className="hidden-sm-down">
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
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div>
              <h3>Users <small>List of registered WaiveCar users</small></h3>
            </div>
            <div>
              <Link className="btn btn-primary" to={'/users/add'}>
                {this._user.hasAccess('waiveAdmin') ? 'Add organization users': 'Add users'}
              </Link>
            </div>
          </div>
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
                  <ThSort sort="phone"       value="Phone"       ctx={ this } className="hidden-sm-down" />
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
                  <button className="btn btn-primary" onClick={ () => this.table.more(false) }>Load More</button>
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
