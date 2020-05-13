import React                    from 'react';
import { History, Link }        from 'react-router';
import config                   from 'config';
import Reach, { auth, relay, dom }    from 'bento';
import UI, { templates, views } from 'bento-ui';
import { Anchor, Layout }       from 'bento-web';
import policies                 from 'policies';
import Header                   from './app/header';
import mixin                    from 'react-mixin';
import facebook                 from '../views/auth/facebook';

let { Waypoint, Container, Row, Column } = Layout;

// This is the home page, as in '/'.
@mixin.decorate(History)
class HomeTemplate extends React.Component {

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
        { type: 'anchor', to : '#About',    title : 'About Us' }
      ],
      footerItems : [
        { type: 'link', to : '/terms',                      title : 'Terms' },
        { type: 'link', to : '/privacy',                    title : 'Privacy' },
        { type: 'a',    to : 'mailto:support@waivecar.com', title : 'Support' },
        { type: 'link', to : '/login',                      title : 'Login' }
      ],
      extraItems : [
        { type: 'a',      to : 'mailto:advertise@waivecar.com', title : 'Advertise' },
        { type: 'link',   to : '/faq',                        title : 'FAQ' }
      ],
      footerToggles : [],
      zone: 'driving'
    };

    // I only care about this button iff I'm on mobile, defined here as under 1080 pixels
    if(window.innerWidth < 1080) {
      let title = ('desktop' in localStorage) ? 'Mobile' : 'Desktop';
      this.state['footerToggles'].push({ type: 'click',  to : this.toggleSite,              title : title + ' Site' });
    }

    this.handleWaypointEnter = this.handleWaypointEnter.bind(this);

  }

  componentDidMount() {
    let user = auth.user();
    if (user) {
      this.history.pushState(null, '/dashboard');
    }
  }

  componentWillUnmount() {
  }

  handleWaypointEnter(e, context) {
    let state = this.state;
    state.waypoints[context.id] = state.waypoints[context.id] + ' ' + context.className;
    this.setState(state);
  }

  renderNavItems(isFooter) {
    let items;
    if (typeof isFooter === 'string') {
      items = isFooter
    } else {
      items = isFooter ? 'footerItems' : 'navItems';
    }

    return this.state[items].map((n, i) => {
      switch (n.type) {
        case 'a'      : return <li key={ i }><a className="nav-item nav-link" href={ n.to }>{ n.title }</a></li>
        case 'click'  : return <li key={ i }><Link className="nav-item nav-link" to="#" onClick={ n.to.bind(this) }>{ n.title }</Link></li>
        case 'link'   : return <li key={ i }><Link className="nav-item nav-link" to={ n.to }>{ n.title }</Link></li>
        case 'anchor' : return <li key={ i }><Anchor className="nav-item nav-link" href={ n.to }>{ n.title }</Anchor></li>
      }
    });
  }

  renderNav(isHeader) {
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
            { isHeader && this.renderNavItems('extraItems') }
            <li className='login-btn'>
              { isHeader &&
                <Link to="/login" className="btn btn-primary md-m-l">
                  Login
                </Link>
              }
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
        <div className='video-container'>
          <video className='bg-video' autoPlay='autoplay' loop='loop'
              poster='/images/site/waivecar_homepage.png'
              onended='var v=this;setTimeout(function(){v.play()},300)'>
            <source src='/video/waivecar_homepage.mp4' type='video/mp4' />
            <source src='/video/waivecar_homepage.ogv' type='video/webm' />
            <source src='/video/waivecar_homepage.webm' type='video/ogg' />
          </video>
        </div>
        <div className="container">
          <Link to="/login" className="md-m-l hidden-lg-up mobile-login">
            Login
          </Link>
          { this.renderNav(true) }
          <Row className="m-t-lg hidden-md-up">
            <div className="col-sm-12">
              <div className="banner-container text-center">
                <h1>We waive the fee. You drive for free.</h1>
                <p className="lead">
                  Drive toward a sustainable future.
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
                  <h1>We waive the fee. You drive for free.</h1>
                  <p className="lead">
                    Drive toward a sustainable future.
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
                We believe there are more efficient ways for communities to benefit from transportation that will also
                benefit our future. Our contribution is WaiveCar, a revolutionary car-sharing program that connects users
                with ad-supported electric cars they can drive for free, anywhere in their city. Companies pay us to
                display their ads. Drivers contribute by driving the ads around.
              </p>
              <p>
                Together, drivers and companies can make a positive impact on the environment in a much more cost conscious way.
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
                  <h3 className="card-title">Find a car near you</h3>
                  <p className="card-text">Search the map from our mobile app to locate cars in your area. Pick the car closest to you with an adequate charge level that works for your trip. Hit “Book Waivecar” and the app will direct you to the exact location of your Waive Car.</p>
                </div>
              </Waypoint>
            </Column>
            <Column width={ 3 } responsive={ true } responsiveBreakpoint="lg" className="text-center">
              <Waypoint id="FeaturesBook" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesBook }>
                <div className="card-block">
                  <img src='/images/site/book-the-car.png' />
                  <h3 className="card-title">Book it</h3>
                  <p className="card-text">As soon as you book your car, you have 15 minutes to get there before the car is made available again. The car will be unavailable to other WaiveCar users until after your ride is complete.</p>
                </div>
              </Waypoint>
            </Column>
            <Column width={ 3 } responsive={ true } responsiveBreakpoint="lg" className="text-center">
              <Waypoint id="FeaturesStart" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesStart }>
                <div className="card-block">
                  <img src='/images/site/connect-and-drive.png' />
                  <h3 className="card-title">Connect and drive</h3>
                  <p className="card-text">Unlock and access your WaiveCar through our mobile app that detects when you’re 10 feet away. Remove the key from the sensor in the glove box to activate the car. Drive safely and enjoy!</p>
                </div>
              </Waypoint>
            </Column>
            <Column width={ 3 } responsive={ true } responsiveBreakpoint="lg" className="text-center">
              <Waypoint id="FeaturesEnd" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesEnd }>
                <div className="card-block">
                  <img src='/images/site/leave-it-there-please.png' />
                  <h3 className="card-title">Easy drop-offs</h3>
                  <p className="card-text">Once your free driving time is up, a map on the dashboard will show where you can drop the car off. You can park at our home base, or any legal parking spot, 3 hour meter, or public charging station in Santa Monica. Depending where you leave it, you could earn rewards!</p>
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
                WaiveCar rides are free for the first 2 hours then $5.99/hr after that.
              </p>
              <p>
                We are able to allow free driving because the cars work as mobile billboards.
                Advertisers pay us to display their ads, while drivers contribute by driving those ads around!
                Pretty sweet deal, don’t you think?
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
              <p>
                WaiveCar is a revolutionary group of progressive thinkers that desired to link the needs of
                customers and businesses in a beneficial way to our future by fostering green, renewable energy
                in our communities.
              </p>
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

  toggleSite() {
    if(localStorage['desktop']) {
      delete localStorage['desktop'];
    } else {
      localStorage['desktop'] = true;
    }
    location.reload();
  }

  toggleZone(zone) {
    this.setState({ zone });
  }

  renderZones() {
    let drivingClasses = 'btn';
    let parkingClasses = 'btn';
    let photoClasses = `zones-photo ${ this.state.zone }`;
    if (this.state.zone === 'driving') {
      drivingClasses += ' btn-primary';
      parkingClasses += ' btn-default';
    } else {
      drivingClasses += ' btn-default';
      parkingClasses += ' btn-primary';
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
        <div className={ photoClasses }>
          <div className='zones-toggle btn-group btn-group-lg'>
            <button type='button' onClick={ this.toggleZone.bind(this, 'driving') } className={ drivingClasses }>DRIVING ZONE</button>
            <button type='button' onClick={ this.toggleZone.bind(this, 'parking') } className={ parkingClasses }>PARKING ZONE</button>
          </div>
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
                { this.renderNavItems('extraItems') }
                { this.renderNavItems('footerToggles') }
              </ul>
            </div>
            <div className="col-md-3 col-xs-1">
            </div>
          </div>
        </div>
      </footer>
    );
  }

  render() {
    return (
      <div id="home">
        { this.renderHeader() }
        { this.renderSignup() }
       <div className="announcement">
         <p>
         <span onClick={ function(){document.location='https://medium.com/@WaiveCar/announcing-our-partnership-with-hyundai-e5b070812738#.vm74d9cdh'} }>Announcing our partnership with Hyundai</span>
         <a href='https://medium.com/@WaiveCar/announcing-our-partnership-with-hyundai-e5b070812738#.vm74d9cdh'>more&hellip;</a>
         </p>
       </div>
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
