import React    from 'react';
import { Link } from 'react-router';
import './style.scss';

export default class NavLink extends React.Component {
  render() {
    return (
      <Link to={ this.props.href } className="nav-link">
        <i className="material-icons" role={ this.props.name }>{ this.props.icon }</i>
        { this.props.name }
      </Link>
    );
  }
}