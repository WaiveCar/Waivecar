import md5                  from 'md5';
import React                from 'react';
import { Link }             from 'react-router';
import { auth, relay, dom } from 'bento';
import { menu }             from 'bento-ui';
import { Hamburger }        from 'bento-web';

module.exports = class Sidebar extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      open    : false,
      account : false
    };
    this.getLink = this.getLink.bind(this);
  }

  /**
   * Check if route has changed, meaning a link has been activated.
   * @param  {Object} nextProps
   * @param  {Object} nextState
   */
  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.route !== this.props.route) {
      this.setState({
        open : false
      });
    }
  }

  /**
   * Returns the admin accessible sidebar menu.
   * @return {Object}
   */
  admin() {
    if (auth.user.role === 'admin') {
      return (
        <div className="sidebar-admin">
          <h5 className="animated fadeInLeft">Admin <small>Menu</small></h5>
          <ul>
            { menu.get('sidebar').map(this.getLink) }
          </ul>
        </div>
      );
    }
  }

  /**
   * Returns a sidebar link.
   * @param  {Object} link
   * @param  {Number} i
   * @return {Object}
   */
  getLink(link, i) {
    return (
      <li key={ i } className={ link.parent ? "has-parent" : "parent" }>
        <Link to={ link.path } className={ dom.setClass({ 'nav-link' : true, animated : true, fadeInLeft : true, active : link.path === this.props.route }) }>
          <i className="material-icons" role={ link.title }>{ link.icon }</i>
          { link.title }
        </Link>
      </li>
    );
  }

  /**
   * Returns the rendered sidebar view.
   * @return {Object}
   */
  render() {
    return (
      <div>
        <div className={ `sidebar-overlay${ this.state.open ? ' show' : '' }` }  onClick={ () => { this.setState({ open : false }) }.bind(this) } />
        <div id="sidebar" className={ this.state.open ? 'show' : '' }>
          <button className="btn-sidebar" onClick={ () => { this.setState({ open : !this.state.open }) }.bind(this) }>
            <i className="material-icons">
            {
              this.state.open ? 'keyboard_arrow_left' : 'menu'
            }
            </i>
          </button>

          <div className="sidebar-meta">
            <div className="sidebar-avatar animated flipInX">
              <div
                className = "sidebar-avatar-img"
                style     = {{ background : auth.user.email ? `url(//www.gravatar.com/avatar/${ md5(auth.user.email) }) center center / cover` : '#fff' }}
              />
            </div>
            <div className="sidebar-name animated flipInY">
              <span>{ auth.user.firstName } { auth.user.lastName }</span>
            </div>
            <button className="btn-account" onClick={ () => { this.setState({ account : !this.state.account }) }.bind(this) }>
              My Account
              <i className="material-icons">{ this.state.account ? 'arrow_drop_up' : 'arrow_drop_down' }</i>
            </button>
          </div>

          <div className={ `sidebar-account${ this.state.account ? ' show' : '' }` }>
            <h5 className="animated fadeInLeft">Account <small>Menu</small></h5>
            <ul>
              { menu.get('sidebar-account').map(this.getLink) }
            </ul>
          </div>

          <div className="sidebar-nav">
            <h5 className="animated fadeInLeft">Application <small>Menu</small></h5>
            <ul>
              { menu.get('sidebar-user').map(this.getLink) }
            </ul>
          </div>
          
          { this.admin() }
        </div>
      </div>
    );
  }

}
