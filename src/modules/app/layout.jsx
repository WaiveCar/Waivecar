import React       from 'react';
import Reach       from 'reach-react';
import { Header }  from './components/header';
import { Sidebar } from './components/sidebar';
import './style.scss';

export default class AppLayout extends React.Component {

  /**
   * Mount the shared components.
   * @method componentWillMount
   */
  componentWillMount() {
    this.setState({
      sidebar : {
        toggle : this.toggleSidebar.bind(this),
        button : this.hamburgerClass(true),
        state  : 'open'
      }
    });
  }

  /**
   * Toggles the sidebar and adjusts the sidebar state.
   * @method toggleSidebar
   */
  toggleSidebar() {
    let self    = this;
    let current = this.state.sidebar.button;
    if (Reach.DOM.hasClass(current, 'active')) {
      return setState({
        button : self.hamburgerClass(false),
        state  : null
      });
    }
    return setState({
      button : self.hamburgerClass(true),
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
   * @method hamburgerClass
   * @param  {Boolean} state
   * @return {String}
   */
  hamburgerClass(state) {
    return Reach.DOM.setClass({
      'hamburger'       : true,
      'hamburger--htla' : true,
      'active'          : state
    });
  }

  /**
   * Returns the content containers class state.
   * @method contentClass
   */
  contentClass() {
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
      <div id="app">
        <Header />
        { this.props.children }
      </div>
    );
    /*
    return (
      <div id="app">
        <Header sidebar={ this.state.sidebar } />
        <Sidebar state={ this.state.sidebar.state } />
        <div className={ this.contentClass() }>
          { this.props.children }
        </div>
      </div>
    );
    */
  }
}