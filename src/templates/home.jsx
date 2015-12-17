'use strict';

import React                    from 'react';
import { Link }                 from 'react-router';
import config                   from 'config';
import Reach, { relay, dom }    from 'bento';
import UI, { templates, views } from 'bento-ui';
import { Anchor, Layout }       from 'bento-web';
import policies                 from 'policies';
import Header                   from './app/header';

let { Waypoint, Container, Row, Column } = Layout;

/**
 * @class AppTemplate
 */
class HomeTemplate extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      waypoints : {
        wp1 : 'wp wp1',
        wp2 : 'wp wp2',
        wp3 : 'wp wp3',
        Signup        : 'wp wp-signup',
        FeaturesFind  : 'card wp wp-features-find',
        FeaturesBook  : 'card wp wp-features-book',
        FeaturesStart : 'card wp wp-features-start',
        FeaturesEnd   : 'card wp wp-features-end'
      },
      navItems : [
        { type: 'anchor', to : '#Download', title : 'Download' },
        { type: 'anchor', to : '#Vision',   title : 'Vision' },
        { type: 'anchor', to : '#Features', title : 'How It Works' },
        { type: 'anchor', to : '#Pricing',  title : 'Pricing' },
        { type: 'anchor', to : '#About',    title : 'About Us' }
      ],
      footerItems : [
        { type: 'link',   to : '/terms',   title : 'Terms' },
        { type: 'link',   to : '/privacy', title : 'Privacy' },
        { type: 'link',   to : '/support', title : 'Support' },
        { type: 'link',   to : '/login',   title : 'Login' }
      ]
    };

    this.handleWaypointEnter = this.handleWaypointEnter.bind(this);

  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
  }

  handleWaypointEnter(e, context) {
    let state = this.state;
    state.waypoints[context.id] = state.waypoints[context.id] + ' ' + context.className;
    this.setState(state);
  }

  renderNavItems(isFooter) {
    let items = isFooter ? 'footerItems' : 'navItems';
    return this.state[items].map((n, i) => {
      switch (n.type) {
        case 'link'   : return <li key={ i }><Link className="nav-item nav-link" to={ n.to }>{ n.title }</Link></li>
        case 'anchor' : return <li key={ i }><Anchor className="nav-item nav-link" href={ n.to }>{ n.title }</Anchor></li>
      }
    });
  }

  renderNav() {
    return (
      <nav className="row">
        <div className="navbar-app col-lg-5 col-md-6">
          <Link to="/">
            <img src="/images/site/logo.svg" alt="WaiveCar" />
          </Link>
        </div>
        <div className="navbar-items col-lg-7 col-md-6">
          <ul className="text-right list-inline  hidden-md-down">
            { this.renderNavItems() }
          </ul>
        </div>
      </nav>
    );
  }

  renderHeader() {
    return (
      <header className="section jumbotron bg-inverse" role="banner">
        <div className="container">
          { this.renderNav() }
          <Row className="m-t-lg hidden-md-up">
            <div className="col-sm-12">
              <div className="banner-container text-center">
                <h1>Need to go somewhere?</h1>
                <p className="lead">Use one of our electric cars <strong>for free</strong>.
                <br />
                It makes sense and a huge diffeence.</p>
                <ul className="list-inline">
                  <li className="store-item m-t">
                    <a href="#">
                      <img className="app-store" src="/images/site/btn-app-store.svg" />
                    </a>
                  </li>
                  <li className="store-item m-t">
                    <a href="#">
                      <img className="app-store" src="/images/site/btn-google-play.svg" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </Row>
          <Row className="m-t-lg hidden-sm-down">
            <div className="col-md-6 col-sm-12">
              <div className="banner-container">
                <div  className="valign">
                  <h1>Need to go somewhere?</h1>
                  <p className="lead">Use one of our electric cars <strong>for free</strong>.
                  <br />
                  It makes sense and a huge diffeence.</p>
                  <ul className="list-inline">
                    <li className="store-item">
                      <a href="#">
                        <img className="app-store" src="/images/site/btn-app-store.svg" />
                      </a>
                    </li>
                    <li className="store-item">
                      <a href="#">
                        <img className="app-store" src="/images/site/btn-google-play.svg" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-sm-6 hidden-sm-down">
              <img className="app-sample pull-right" src="/images/site/iphone.png" />
            </div>
          </Row>
        </div>
        <div className="scroll text-center">
          Learn how
          <br />
          <i className="material-icons">keyboard_arrow_down</i>
        </div>
      </header>
    );
  }

  renderSignup() {
    return (
      <section className="section section-signup">
        <Container>
          <h3 className="text-center m-b-lg">Create an account</h3>
          <p className="text-center lead">Once registered, you’ll be able to find, book, and start using electric cars for free.</p>
          <Waypoint id="Signup" onEnter={ this.handleWaypointEnter } onEnterClassName="animated slideIn" className={ this.state.waypoints.Signup }>
            <Row>
              <Column width={ 6 } responsive={ true } centerContent={ true } className="text-right-md">
                <a className="btn btn-facebook md-m-r" href={ `https://www.facebook.com/dialog/oauth?client_id=${ config.auth.facebook.appId }&redirect_uri=${ config.auth.facebook.redirect }&state=register` }>
                  <i className="fa fa-facebook" />
                  Connect with Facebook
                </a>
              </Column>
              <Column width={ 6 } responsive={ true } centerContent={ true } className="text-left-md">
                <Link to="/register" className="btn btn-primary md-m-l">
                  <i className="material-icons" role="email">email</i>
                  Register with Email
                </Link>
              </Column>
            </Row>
            <Row>
              <Column centerContent={ true } centerContent={ true } className="text-center">
                <p>Already have an account? <Link to="/login">Log in</Link></p>
              </Column>
            </Row>
          </Waypoint>
        </Container>
      </section>
    );
  }

  renderVision() {
    return (
      <section className="section section-vision text-center">
        <div id="Vision" className="container">
          <Row>
            <Column className="text-center">
              <h3>Our Vision</h3>
              <p>We believe there are smarter ways for people in the city to benefit from cars.</p>
              <p>Our contribution is WaiveCar, a revolutionary system in which users can find, book and drive ad-displaying, electric cars for free, anywhere in the city.</p>
              <p>This is how people and companies can create a more sustainable future.</p>
              <a href="#" target="_blank" className="btn btn-primary text-center">Download App</a>
            </Column>
          </Row>
        </div>
      </section>
    );
  }

  renderFeatures() {
    return (
      <section className="section section-features text-center">
        <div id="Features" className="container">
          <Row>
            <Column>
              <h2>How it works</h2>
            </Column>
          </Row>
          <Row>
            <Column width={ 3 } responsive={ true } responsiveBreakpoint="lg" className="text-center">
              <Waypoint id="FeaturesFind" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesFind }>
                <div className="card-block">
                  <img className="img-circle" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="1" width="140" height="140" />
                  <h4 className="card-title">Find an available car near you</h4>
                  <p className="card-text">A map displays all available cars in your area. Each car has  important information such as charge level and exact directions to its location.</p>
                </div>
              </Waypoint>
            </Column>
            <Column width={ 3 } responsive={ true } responsiveBreakpoint="lg" className="text-center">
              <Waypoint id="FeaturesBook" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesBook }>
                <div className="card-block">
                  <img className="img-circle" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="2" width="140" height="140" />
                  <h4 className="card-title">Book the car</h4>
                  <p className="card-text">Once you find the car you want, book it. The car will be booked for you and made unavailable to other WaiveCar users. Now you can go get it.</p>
                </div>
              </Waypoint>
            </Column>
            <Column width={ 3 } responsive={ true } responsiveBreakpoint="lg" className="text-center">
              <Waypoint id="FeaturesStart" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesStart }>
                <div className="card-block">
                  <img className="img-circle" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="3" width="140" height="140" />
                  <h4 className="card-title">Connect and drive</h4>
                  <p className="card-text">The app will detect your position and unlock your WaiveCar, you can connect and unlock it using the mobile app. Drive safely and enjoy!</p>
                </div>
              </Waypoint>
            </Column>
            <Column width={ 3 } responsive={ true } responsiveBreakpoint="lg" className="text-center">
              <Waypoint id="FeaturesEnd" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesEnd }>
                <div className="card-block">
                  <img className="img-circle" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="4" width="140" height="140" />
                  <h4 className="card-title">Leave it there, please</h4>
                  <p className="card-text">Once your free driving time is up, a map will show where you can drop the car off. There are rewards depending on where you do it.  </p>
                </div>
              </Waypoint>
            </Column>
          </Row>
        </div>
      </section>
    );
  }

  renderPricing() {
    return (
      <section className="section section-pricing">
        <div className="tinted-half hidden-sm-down">
        </div>
        <Container id="Pricing">
          <Row>
            <div className="col-md-6 col-sm-12">
              <h2>Pricing</h2>
              <p>WaiveCar rides are free because the cars work as mobile advertising panels. You’re actually paying us just by driving the cars. Pretty sweet trade off, don’t you think?</p>
              <p>Driving a car is free within the first two hours, counting from the moment the car starts running. If you want to continue using the car, a $5,99 per extra hour fee will be charged to your account.</p>
            </div>
          </Row>
        </Container>
      </section>
    );
  }

  renderAbout() {
    return (
      <section className="section section-about">
        <Container>
          <Row id="About">
            <div className="col-md-9 col-sm-12">
              <h2>About Us</h2>
              <p>WaiveCar is a revolutionary form of transportation for citizens, a smart advertising medium for companies and a powerful way of fostering green, renewable energy in our communities.</p>
            </div>
            <div className="col-md-3 hidden-sm-down text-right">
              <img src="/images/site/waivecar-logo.svg" alt="WaiveCar" />
            </div>
          </Row>
        </Container>
      </section>
    );
  }

  renderFooter() {
    return (
      <footer className="section section-footer bg-inverse" role="contentinfo">
        <div className="container">
          { this.renderNav() }
          <div className="row">
            <div className="col-md-3 col-xs-1">
            </div>
            <div className="navbar-items footer-items col-md-6 col-xs-10">
              <ul className="text-center list-inline">
                { this.renderNavItems(true) }
              </ul>
            </div>
            <div className="col-md-3 col-xs-1">
            </div>
          </div>
        </div>
      </footer>
    );
  }

  /**
   * @method render
   */
  render() {
    return (
      <div id="home">
        { this.renderHeader() }
        { this.renderSignup() }
        { this.renderVision() }
        { this.renderFeatures() }
        { this.renderPricing() }
        { this.renderAbout() }
        { this.renderFooter() }
      </div>
    );
  }
}

// ### Register Template
templates.register('home', {
  component : HomeTemplate,
  path      : '/'
});
