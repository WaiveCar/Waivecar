import React                    from 'react';
import { Link }                 from 'react-router';
import config                   from 'config';
import Reach, { relay, dom }    from 'bento';
import UI, { templates, views } from 'bento-ui';
import { Anchor, Layout }       from 'bento-web';
import policies                 from 'policies';
import Header                   from './app/header';
import facebook                 from '../views/auth/facebook';

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
        { type: 'anchor', to : '#About',    title : 'About Us' },
        { type: 'a',      to : 'mailto:advertise@waivecar.com', title : 'Advertise' },
        { type: 'link',   to : '/faq',                        title : 'FAQ' },
      ],
      footerItems : [
        { type: 'link', to : '/terms',                      title : 'Terms' },
        { type: 'link', to : '/privacy',                    title : 'Privacy' },
        { type: 'a',    to : 'mailto:support@waivecar.com', title : 'Support' },
        { type: 'link', to : '/login',                      title : 'Login' }
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
        case 'a'      : return <li key={ i }><a className="nav-item nav-link" href={ n.to }>{ n.title }</a></li>
        case 'link'   : return <li key={ i }><Link className="nav-item nav-link" to={ n.to }>{ n.title }</Link></li>
        case 'anchor' : return <li key={ i }><Anchor className="nav-item nav-link" href={ n.to }>{ n.title }</Anchor></li>
      }
    });
  }

  renderNav() {
    return (
      <nav className="row">
        <div className="navbar-app col-lg-4 col-md-3">
          <Link to="/">
            <img src="/images/site/logo.svg" alt="WaiveCar" />
          </Link>
        </div>
        <div className="navbar-items col-lg-8 col-md-9">
          <ul className="text-right list-inline  hidden-md-down">
            { this.renderNavItems() }
          </ul>
        </div>
      </nav>
    );
  }

  renderHeader() {
    var appStoreUri = 'https://itunes.apple.com/us/app/waivecar/id1051144802?ls=1&mt=8'
    var playStoreUri = 'https://play.google.com/store/apps/details?id=com.waivecar.app'
    return (
      <header className="section jumbotron bg-inverse" role="banner">
        <div className="container">
          { this.renderNav() }
          <Row className="m-t-lg hidden-md-up">
            <div className="col-sm-12">
              <div className="banner-container text-center">
                <h1>We waive the fee. You drive for free.</h1>
                <p className="lead">Get where you’re going and move toward a sustainable future.</p>
                <ul className="list-inline">
                  <li className="store-item m-t">
                    <a href={appStoreUri}>
                      <img className="app-store" src="/images/site/btn-app-store.svg" />
                    </a>
                  </li>
                  <li className="store-item m-t">
                    <a href={playStoreUri}>
                      <img className="app-store" src="/images/site/btn-google-play.svg" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </Row>
          <Row className="m-t-lg hidden-sm-down">
            <div className="col-md-7 col-sm-12">
              <div className="banner-container">
                <div  className="valign">
                  <h1>We waive the fee. You drive for free.</h1>
                  <p className="lead">Get where you’re going and move toward a sustainable future.</p>
                  <ul className="list-inline">
                    <li className="store-item">
                      <a href={appStoreUri}>
                        <img className="app-store" src="/images/site/btn-app-store.svg" />
                      </a>
                    </li>
                    <li className="store-item">
                      <a href={playStoreUri}>
                        <img className="app-store" src="/images/site/btn-google-play.svg" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-sm-5 hidden-sm-down">
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
          <p className="text-center lead">Get approved and drive a free car <strong>today</strong>.</p>
          <Waypoint id="Signup" onEnter={ this.handleWaypointEnter } onEnterClassName="animated slideIn" className={ this.state.waypoints.Signup }>
            <Row>
              <Column width={ 6 } responsive={ true } centerContent={ true } className="text-right-md">
                <button className="btn btn-facebook" onClick={ facebook.register }>
                  <i className="fa fa-facebook" />
                  Register with Facebook
                </button>
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
              <p>We believe there are smarter ways for communities to benefit from cars.</p>
              <p>Our contribution is WaiveCar, a revolutionary transportation system that connects users with ad-displaying electric cars for free, anywhere in their city.</p>
              <p>Together, drivers and companies can make a positive impact on the environment.</p>
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
              <h2 className="m-b-lg">How it works</h2>
            </Column>
          </Row>
          <Row>
            <Column width={ 3 } responsive={ true } responsiveBreakpoint="lg" className="text-center">
              <Waypoint id="FeaturesFind" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesFind }>
                <div className="card-block">
                  <h3 className="card-title">Find a Car Near You</h3>
                  <p className="card-text">Search a map to locate cars in your area. Pick the make, model, and charge level that works for you. We’ll point you toward the exact location of your favorite WaiveCar.</p>
                </div>
              </Waypoint>
            </Column>
            <Column width={ 3 } responsive={ true } responsiveBreakpoint="lg" className="text-center">
              <Waypoint id="FeaturesBook" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesBook }>
                <div className="card-block">
                  <h3 className="card-title">Book It</h3>
                  <p className="card-text">Found the car for you? As soon as you book it, the car will be unavailable to other WaiveCar users until after your ride is complete.</p>
                </div>
              </Waypoint>
            </Column>
            <Column width={ 3 } responsive={ true } responsiveBreakpoint="lg" className="text-center">
              <Waypoint id="FeaturesStart" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesStart }>
                <div className="card-block">
                  <h3 className="card-title">Connect and Drive</h3>
                  <p className="card-text">Unlock and access your WaiveCar through a mobile app that detects your position. No cards or keys necessary. Drive safely and enjoy!</p>
                </div>
              </Waypoint>
            </Column>
            <Column width={ 3 } responsive={ true } responsiveBreakpoint="lg" className="text-center">
              <Waypoint id="FeaturesEnd" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesEnd }>
                <div className="card-block">
                  <h3 className="card-title">Easy Drop Offs</h3>
                  <p className="card-text">Once your free driving time is up, a map will show where you can drop the car off. Depending on where you leave it, you can earn rewards.</p>
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
              <p>WaiveCar rides are free because the cars work as mobile billboards. You’re actually paying us just by driving the cars. Sweet deal, don’t you think?</p>
              <p>The first two hours of drive time is on us, counting from the moment the motor starts running. After that, it’s $5.99 per an hour to continue your ride.</p>
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
            <div className="col-sm-12">
              <h2>About Us</h2>
              <p>WaiveCar is a revolutionary form of transportation, a smart advertising medium for companies, and a powerful way of fostering green, renewable energy in our communities.</p>
              <br />
            </div>
          </Row>
          <Row id="Cars">
            <div className="col-md-7 col-sm-12">
              <h2>Our Cars</h2>
              <p>WaiveCar’s fleet is 100% electric and 100% emission free.<br />Our cars are zippy, compact, and functional:</p>
              <ul className="list">
                <li>4 Doors</li>
                <li>Seats 4</li>
                <li>80 Miles of Range per charge 128/109 MPGe</li>
                <li>Bluetooth</li>
                <li>0-60 in 7.9 Seconds</li>
                <li>141 Horsepower</li>
              </ul>
            </div>
            <div className="col-md-5 hidden-sm-down text-right">
              <img src="/images/site/car.jpg" alt="WaiveCar" />
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
