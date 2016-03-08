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
      ],
      zone: 'driving'
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
            <li className='login-btn'>
              <Link to="/login" className="btn btn-primary md-m-l">
                Login
              </Link>
            </li>
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
                <h1>Need to go somewhere?</h1>
                <p className="lead">
                  Use one of our electric cars <strong>for free</strong>.<br></br>
                  It makes sense and a huge difference.
                </p>
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
                  <h1>Need to go somewhere?</h1>
                  <p className="lead">
                    Use one of our electric cars <strong>for free</strong>.<br></br>
                    It makes sense and a huge difference.
                  </p>
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
              <img className="app-sample pull-right" src="/images/site/iphone-mockup.png" />
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
          <h2 className="text-center m-b-md">Create an account</h2>
          <p className="text-center lead">Once you're registered, you'll be able to find, book, and start using electric cars for free.</p>
          <Waypoint id="Signup" onEnter={ this.handleWaypointEnter } onEnterClassName="animated slideIn" className={ this.state.waypoints.Signup }>
            <Row>
              <Column width={ 6 } responsive={ true } centerContent={ true } className="text-right-md">
                <button className="btn btn-facebook" onClick={ facebook.register }>
                  <i className="fa fa-facebook" />
                  Connect with Facebook
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
            <Column width={ 8 } responsive={ true } responsiveBreakpoint="lg" className="text-center col-lg-offset-2">
              <h2>Our Vision</h2>
              <p>
                We believe there are smarter ways for people in the city to benefit from cars. Our contribution is WaiveCar,
                a revolutionary system in which users can find, book and drive ad-displaying, electric cars for free, anywhere
                in the city. This is how people and companies can create a more sustainable future.
              </p>
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
                  <img src='/images/site/find-available-car.png' />
                  <h3 className="card-title">Find an available car near you</h3>
                  <p className="card-text">A map displays all available cars in your area. Each car has important information such as charge level and exact directions to its location.</p>
                </div>
              </Waypoint>
            </Column>
            <Column width={ 3 } responsive={ true } responsiveBreakpoint="lg" className="text-center">
              <Waypoint id="FeaturesBook" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesBook }>
                <div className="card-block">
                  <img src='/images/site/book-the-car.png' />
                  <h3 className="card-title">Book the car</h3>
                  <p className="card-text">Once you find the car you want, book it. The car will be booked for you and made unavailable to other WaiveCar users. Now you can go get it.</p>
                </div>
              </Waypoint>
            </Column>
            <Column width={ 3 } responsive={ true } responsiveBreakpoint="lg" className="text-center">
              <Waypoint id="FeaturesStart" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesStart }>
                <div className="card-block">
                  <img src='/images/site/connect-and-drive.png' />
                  <h3 className="card-title">Connect and drive</h3>
                  <p className="card-text">The app will detect your position and unlock your WaiveCar, you can connect and unlock it using the mobile app. Drive safely and enjoy!</p>
                </div>
              </Waypoint>
            </Column>
            <Column width={ 3 } responsive={ true } responsiveBreakpoint="lg" className="text-center">
              <Waypoint id="FeaturesEnd" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesEnd }>
                <div className="card-block">
                  <img src='/images/site/leave-it-there-please.png' />
                  <h3 className="card-title">Leave it there, please</h3>
                  <p className="card-text">Once your free driving time is up, a map will show where you can drop the car off. There are rewards depending on where you do it.</p>
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
        <Container id="Pricing">
          <Row>
            <div className="col-md-offset-3 col-md-6 col-sm-12 text-center">
              <h2>Pricing</h2>
              <p>
                WaiveCar rides are free because the cars work as mobile advertising panels.
                You're actually paying use just by driving the cars. Pretty sweet trade off, don't you think?
              </p>
              <p>
                Driving a car is free within the first two hours, counting from the moment the car starts running.
                If you want to continue using the car, a $5.99 per extra hour fee will be charged to your account.
              </p>
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
            <div className="col-md-8 col-md-offset-2 text-center">
              <h2>About Us</h2>
              <p>WaiveCar is a revolutionary form of transportation, a smart advertising medium for companies, and a powerful way of fostering green, renewable energy in our communities.</p>
            </div>
          </Row>
        </Container>
      </section>
    );
  }

  renderCars() {
    return (
      <section className="section section-cars clearfix">
        <div className='cars-photo hidden-md-down'>
          <img src='/images/site/our-cars-photo.jpg' />
        </div>
        <div className='cars-content'>
          <Row id="Cars">
            <div className="col-xs-12">
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
          </Row>
        </div>
      </section>
    );
  }

  toggleZone(zone) {
    this.setState({ zone });
  }

  renderZones() {
    let drivingClasses = 'btn';
    let parkingClasses = 'btn';
    let src = '/images/site/';
    if (this.state.zone === 'driving') {
      drivingClasses += ' btn-primary';
      parkingClasses += ' btn-default';
      src += 'map-photo-1.jpg';
    } else {
      drivingClasses += ' btn-default';
      parkingClasses += ' btn-primary';
      src += 'map-photo-2.jpg';
    }
    return (
      <section className='section section-zones clearfix'>
        <div className='zones-content'>
          <Row id='Zones'>
            <div className='col-xs-12'>
              <h2>WaiveCar Return Zone and Driving Zone</h2>
              <p>
                WaiveCars are available to rent in Santa Monica. That means that all rentals must start and end inside of Santa Monica. That doesn't mean you have to stay in Santa Monica, we allow you to drive a 20 mile radius from our HQ at 1547 7th Street. When driving far distances, make sure not to drain the battery too low!
                When returning the car, if your car has under 25% charge, you must return it at a charger or at WaiveCar HQ. If your car has over 25% remaining, make sure your return spot is a legal parking spot and valid for at least the next 3 hours.
              </p>
            </div>
          </Row>
        </div>
        <div className='zones-photo hidden-md-down'>
          <div className='zones-toggle btn-group btn-group-lg'>
            <button type='button' onClick={ this.toggleZone.bind(this, 'driving') } className={ drivingClasses }>DRIVING ZONE</button>
            <button type='button' onClick={ this.toggleZone.bind(this, 'parking') } className={ parkingClasses }>PARKING ZONE</button>
          </div>
          <img src={ src } />
        </div>
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
        { this.renderCars() }
        { this.renderZones() }
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
