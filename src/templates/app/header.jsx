import React      from 'react';
import { Link }   from 'react-router';
import { relay }  from 'bento';
import { Navbar } from 'bento-web';

export default class Header extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      menu : []
    };
  }

  render() {
    return (
      <header id="header">
        <div className="header-brand">
          <Link to="/">
            <img src="/images/brand.svg" />
          </Link>
        </div>
      </header>
    );
  }

}
