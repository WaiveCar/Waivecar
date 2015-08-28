import React       from 'react';
import Reach       from 'reach-react';
import { Header }  from './components/header';
import { Sidebar } from './components/sidebar';
import './style.scss';

export default class AdminLayout extends React.Component {

  /**
   * Mount the shared components.
   * @method componentWillMount
   */
  componentWillMount() {
    this.setState({
      sidebar : {
        toggle : this._toggleSidebar.bind(this),
        button : this._hamburgerClass(false),
        state  : null
      }
    });
  }

  /**
   * Toggles the sidebar and adjusts the sidebar state.
   * @method _toggleSidebar
   */
  _toggleSidebar() {
    let self    = this;
    let current = this.state.sidebar.button;
    if (Reach.DOM.hasClass(current, 'active')) {
      return setState({
        button : self._hamburgerClass(false),
        state  : null
      });
    }
    return setState({
      button : self._hamburgerClass(true),
      state  : 'open'
    });
    function setState(state) {
      let sidebar = self.state.sidebar;
      for (let key in sidebar) {
        if (state.hasOwnProperty(key)) {
          sidebar[key] = state[key];
        }
      }
      self.setState({
        sidebar : sidebar
      });
    }
  }

  /**
   * Returns the hamburger class state.
   * @method _hamburgerClass
   * @param  {Boolean} state
   * @return {String}
   */
  _hamburgerClass(state) {
    return Reach.DOM.setClass({
      'hamburger'       : true,
      'hamburger--htla' : true,
      'active'          : state
    });
  }

  /**
   * Returns the content containers class state.
   * @method _contentClass
   */
  _contentClass() {
    return Reach.DOM.setClass({
      'content' : true,
      'open'    : this.state.sidebar.state
    });
  }

  /**
   * Render administration module.
   * @method render
   */
  render() {
    return (
      <div id="admin">
        <Header sidebar={ this.state.sidebar } />
        <Sidebar state={ this.state.sidebar.state } />
        <div className={ this._contentClass() }>
          { this.props.children }
        </div>
      </div>
    );
  }
}