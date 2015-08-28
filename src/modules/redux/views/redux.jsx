import React       from 'react';
import Reach       from 'reach-react';
import { Grid }    from 'reach-components';
import { connect } from 'react-redux';
import users       from 'interface/actions/users'
import config      from 'config';
import './styles.scss';

@connect(state => {
  return {
    users : state.users
  };
})

export default class ReduxView extends React.Component {

  /**
   * Initial setup of the component, good for doing controller binding
   * for methods affected by view and should have access to `this` ctx.
   * @method constructor
   * @param  {Mixed} ...args
   */
  constructor(...args) {
    super(...args);
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }

  /**
   * Sets up the component pre mount, good for stuff like readying
   * state, and adding the dispatcher.
   * @method componentWillMount
   */
  componentWillMount() {
    let self       = this;
    self._dispatch = self.props.dispatch;
    self.setState({
      firstName : null,
      lastName  : null,
      email     : null,
      password  : null
    });
    Reach.API.get('/users', function (err, list) {
      if (err) {
        return console.log(err);
      }
      self._dispatch(users.ADD_USERS(list));
    });
  }

  /**
   * Handle the change event for form inputs.
   * @method _handleChange
   * @param  {Object} event
   */
  _handleChange(event) {
    let input = {};
    input[event.target.name] = event.target.value;
    this.setState(input);
  }

  /**
   * Handle the form submission.
   * @method _handleSubmit
   * @param  {Object} event
   */
  _handleSubmit(event) {
    event.preventDefault();
    Reach.API.post('/users', this.state, function (err, res) {
      if (err) {
        return console.log(err);
      }
      console.log(res);
    });
  }

  /**
   * Render the component.
   * @method render
   */
  render() {
    return (
      <div id="redux">
        <h5>Redux Samples</h5>

        <h6>Create User</h6>
        <form className="form" onSubmit={ this._handleSubmit }>
          <div className="form-group">
            <label className="form-label">Firstname</label>
            <input
              className   = "form-input"
              type        = "text"
              name        = "firstName"
              placeholder = "Enter your firstname"
              onChange    = { this._handleChange }
              tabIndex    = "1"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Lastname</label>
            <input
              className   = "form-input"
              type        = "text"
              name        = "lastName"
              placeholder = "Enter your lastname"
              onChange    = { this._handleChange }
              tabIndex    = "1"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className   = "form-input"
              type        = "text"
              name        = "email"
              placeholder = "Enter your email"
              onChange    = { this._handleChange }
              tabIndex    = "3"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className   = "form-input"
              type        = "password"
              name        = "password"
              placeholder = "Enter your password"
              onChange    = { this._handleChange }
              tabIndex    = "4"
            />
          </div>
          <button type="submit" style={{ display : 'none' }}>Submit</button>
        </form>

        <h6>Registered Users</h6>
        <Griddle
          useGriddleStyles = { false }
          results          = { this.props.users }
          showFilter       = { true }
          showSettings     = { true }
          columns          = {
            [
              'id',
              'firstName',
              'lastName',
              'email',
              'role'
            ] 
          }
          columnMetadata = {
            [
              { columnName : 'id',        displayName : 'Id' },
              { columnName : 'firstName', displayName : 'First Name' },
              { columnName : 'lastName',  displayName : 'Last Name' },
              { columnName : 'email',     displayName : 'Email' },
              { columnName : 'role',      displayName : 'Role' }
            ]
          }
        />
      </div>
    );
  }
}