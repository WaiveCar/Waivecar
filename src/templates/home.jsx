'use strict';

import React                    from 'react';
import { Link }                 from 'react-router';
import Reach, { relay, dom }    from 'bento';
import UI, { templates, views } from 'bento-ui';
import policies                 from 'policies';
import Header                   from './app/header';
import { Anchor, Layout }       from 'bento-web';

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
    relay.subscribe(this, 'home');
    this.state = {
      waypoints : {
        wp1 : 'wp wp1',
        wp2 : 'wp wp2',
        wp3 : 'wp wp3',
        FeaturesFind  : 'wp wp-features-find',
        FeaturesBook  : 'wp wp-features-book',
        FeaturesStart : 'wp wp-features-start',
        FeaturesEnd   : 'wp wp-features-end'
      }
    };

    this.handleWaypointEnter = this.handleWaypointEnter.bind(this);

  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'home');
  }

  handleWaypointEnter(e, context) {
    let state = this.state;
    state.waypoints[context.id] = state.waypoints[context.id] + ' ' + context.className;
    this.setState(state);
  }

  renderNav() {
    return (
      <nav className="navbar navbar-dark bg-inverse bg-inverse-custom navbar-fixed-top">
        <div className="container">
          <a className="navbar-brand" href="#">
            <span className="icon-logo"></span>
            <span className="sr-only">Land.io</span>
          </a>
          <a className="navbar-toggler hidden-md-up pull-right" data-toggle="collapse" href="#collapsingNavbar" aria-expanded="false" aria-controls="collapsingNavbar">
          &#9776;
        </a>
          <a className="navbar-toggler navbar-toggler-custom hidden-md-up pull-right" data-toggle="collapse" href="#collapsingMobileUser" aria-expanded="false" aria-controls="collapsingMobileUser">
            <span className="icon-user"></span>
          </a>
          <div id="collapsingNavbar" className="collapse navbar-toggleable-custom" role="tabpanel" aria-labelledby="collapsingNavbar">
            <ul className="nav navbar-nav pull-right">
              <li className="nav-item nav-item-toggable active">
                <a className="nav-link" href="http://tympanus.net/codrops/?p=25217">About Land.io <span className="sr-only">(current)</span></a>
              </li>
              <li className="nav-item nav-item-toggable">
                <a className="nav-link" href="ui-elements.html">UI Kit</a>
              </li>
              <li className="nav-item nav-item-toggable">
                <a className="nav-link" href="https://github.com/tatygrassini/landio-html" target="_blank">GitHub</a>
              </li>
              <li className="nav-item nav-item-toggable hidden-sm-up">
                <form className="navbar-form">
                  <input className="form-control navbar-search-input" type="text" placeholder="Type your search &amp; hit Enter&hellip;" />
                </form>
              </li>
              <li className="navbar-divider hidden-sm-down"></li>
              <li className="nav-item dropdown nav-dropdown-search hidden-sm-down">
                <a className="nav-link dropdown-toggle" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span className="icon-search"></span>
                </a>
                <div className="dropdown-menu dropdown-menu-right dropdown-menu-search" aria-labelledby="dropdownMenu1">
                  <form className="navbar-form">
                    <input className="form-control navbar-search-input" type="text" placeholder="Type your search &amp; hit Enter&hellip;" />
                  </form>
                </div>
              </li>
              <li className="nav-item dropdown hidden-sm-down textselect-off">
                <a className="nav-link dropdown-toggle nav-dropdown-user" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <img src="img/face5.jpg" height="40" width="40" alt="Avatar" className="img-circle" /> <span className="icon-caret-down"></span>
                </a>
                <div className="dropdown-menu dropdown-menu-right dropdown-menu-user dropdown-menu-animated" aria-labelledby="dropdownMenu2">
                  <div className="media">
                    <div className="media-left">
                      <img src="img/face5.jpg" height="60" width="60" alt="Avatar" className="img-circle" />
                    </div>
                    <div className="media-body media-middle">
                      <h5 className="media-heading">Joel Fisher</h5>
                      <h6>hey@joelfisher.com</h6>
                    </div>
                  </div>
                  <a href="#" className="dropdown-item text-uppercase">View posts</a>
                  <a href="#" className="dropdown-item text-uppercase">Manage groups</a>
                  <a href="#" className="dropdown-item text-uppercase">Subscription &amp; billing</a>
                  <a href="#" className="dropdown-item text-uppercase text-muted">Log out</a>
                  <a href="#" className="btn-circle has-gradient pull-right">
                    <span className="sr-only">Edit</span>
                    <span className="icon-edit"></span>
                  </a>
                </div>
              </li>
            </ul>
          </div>
          <div id="collapsingMobileUser" className="collapse navbar-toggleable-custom dropdown-menu-custom p-x hidden-md-up" role="tabpanel" aria-labelledby="collapsingMobileUser">
            <div className="media m-t">
              <div className="media-left">
                <img src="img/face5.jpg" height="60" width="60" alt="Avatar" className="img-circle" />
              </div>
              <div className="media-body media-middle">
                <h5 className="media-heading">Joel Fisher</h5>
                <h6>hey@joelfisher.com</h6>
              </div>
            </div>
            <a href="#" className="dropdown-item text-uppercase">View posts</a>
            <a href="#" className="dropdown-item text-uppercase">Manage groups</a>
            <a href="#" className="dropdown-item text-uppercase">Subscription &amp; billing</a>
            <a href="#" className="dropdown-item text-uppercase text-muted">Log out</a>
            <a href="#" className="btn-circle has-gradient pull-right m-b">
              <span className="sr-only">Edit</span>
              <span className="icon-edit"></span>
            </a>
          </div>
        </div>
      </nav>
    );
  }

  renderHeader() {
    return (
      <header className="jumbotron bg-inverse text-center center-vertically" role="banner">
        <Container>
          <Row>
            <Column width={ 6 }>
              <h1>Need to go somewhere?</h1>
              <p className="lead">Use one of our electric cars <strong>for free</strong>.
              <br />
              It makes sense and a huge diffeence.</p>
              <ul className="list-inline">
                <li className="store-item">
                  <a href="#">
                    <img src="/images/site/btn-app-store.svg" />
                  </a>
                </li>
                <li className="store-item">
                  <a href="#">
                    <img src="/images/site/btn-google-play.svg" />
                  </a>
                </li>
              </ul>
            </Column>
            <Column width={ 4 }>
              <img className="app-sample pull-right" src="/images/site/iphone.png" />
            </Column>
            <Column width={ 2 } />
          </Row>
          <Row>
            <Column>
              <div className="scroll text-center">
                Learn how
                <i className="material-icons">down</i>
              </div>
            </Column>
          </Row>

          <h1 className="display-3">WaiveCar</h1>
          <h2 className="m-b-lg">Craft your journey, <em>absolutely free</em>, with <a href="ui-elements.html" className="jumbolink">Land.io UI kit</a>.</h2>
          <a className="btn btn-secondary-outline m-b-md" href="#" role="button"><span className="icon-sketch"></span>Sketch included</a>
          <ul className="list-inline social-share">
            <li><a className="nav-link" href="#"><span className="icon-twitter"></span> 1024</a></li>
            <li><a className="nav-link" href="#"><span className="icon-facebook"></span> 562</a></li>
            <li><a className="nav-link" href="#"><span className="icon-linkedin"></span> 356</a></li>
          </ul>
        </Container>
      </header>
    );
  }

  renderSignup() {
    return (
      <section className="section-signup bg-faded">
        <Container>
          <h3 className="text-center m-b-lg">Create an account</h3>
          <p className="text-center lead">Once registered, you’ll be able to find, book, and start using electric cars for free.</p>
          <form>
            <div className="row">
              <div className="col-md-6 col-xl-2">
                <div className="form-group has-icon-left form-control-name text-center">
                  <label className="sr-only" for="inputName">Name</label>
                  <input type="text" className="form-control form-control-lg" id="inputName" placeholder="Your name" />
                </div>
              </div>
              <div className="col-md-6 col-xl-2">
                <div className="form-group has-icon-left form-control-email">
                  <label className="sr-only" for="inputEmail">Email</label>
                  <input type="email" className="form-control form-control-lg" id="inputEmail" placeholder="Email address" autocomplete="off" />
                </div>
              </div>
              <div className="col-md-6 col-xl-2">
                <div className="form-group has-icon-left form-control-email">
                  <label className="sr-only" for="inputEmail">Phone</label>
                  <input type="email" className="form-control form-control-lg" id="inputEmail" placeholder="Email address" autocomplete="off" />
                </div>
              </div>
              <div className="col-md-6 col-xl-2">
                <div className="form-group has-icon-left form-control-password">
                  <label className="sr-only" for="inputPassword">Enter a password</label>
                  <input type="password" className="form-control form-control-lg" id="inputPassword" placeholder="Enter a password" autocomplete="off" />
                </div>
              </div>
              <div className="col-md-12 col-xl-2">
                <div className="form-group">
                  <button type="submit" className="btn btn-primary btn-block">Sign up for free!</button>
                </div>
              </div>
            </div>
            <label className="c-input c-checkbox">
              <input type="checkbox" checked />
              <span className="c-indicator"></span> I agree to WaiveCar's <a href="#">terms of service</a>
            </label>
          </form>
        </Container>
      </section>
    );
  }

  renderVision() {
    return (
      <section className="section-intro bg-faded text-center">
        <div className="container">
          <Row id="our-vision" className="section section-3 inverted">
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
      <section className="section-intro bg-faded text-center">
        <div className="container">
          <Row id="how-it-works" className="section section-4">
            <Column>
              <h2>How it works</h2>
              <Row>
                <Column width={ 3 } responsive={ true } className="text-center">
                  <Waypoint id="FeaturesFind" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesFind }>
                    <img className="img-circle" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="Generic placeholder image" width="140" height="140" />
                    <h3>Find an available car near you</h3>
                    <p>A map displays all available cars in your area. Each car has  important information such as charge level and exact directions to its location.</p>
                  </Waypoint>
                </Column>
                <Column width={ 3 } responsive={ true } className="text-center">
                  <Waypoint id="FeaturesBook" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesBook }>
                    <img className="img-circle" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="Generic placeholder image" width="140" height="140" />
                    <h3>Book the car</h3>
                    <p>Once you find the car you want, book it. The car will be booked for you and made unavailable to other WaiveCar users. Now you can go get it.</p>
                  </Waypoint>
                </Column>
                <Column width={ 3 } responsive={ true } className="text-center">
                  <Waypoint id="FeaturesStart" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesStart }>
                    <img className="img-circle" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="Generic placeholder image" width="140" height="140" />
                    <h3>Connect and drive</h3>
                    <p>The app will detect your position and unlock your WaiveCar, you can connect and unlock it using the mobile app. Drive safely and enjoy!</p>
                    </Waypoint>
                </Column>
                <Column width={ 3 } responsive={ true } className="text-center">
                  <Waypoint id="FeaturesEnd" onEnter={ this.handleWaypointEnter } onEnterClassName="animated fadeInUp" className={ this.state.waypoints.FeaturesEnd }>
                    <img className="img-circle" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="Generic placeholder image" width="140" height="140" />
                    <h3>Leave it there, please</h3>
                    <p>Once your free driving time is up, a map will show where you can drop the car off. There are rewards depending on where you do it.  </p>
                  </Waypoint>
                </Column>
              </Row>
            </Column>
          </Row>
        </div>
      </section>
    );
  }

  renderPricing() {
    return (
        <Row id="pricing" className="section section-5 inverted">
          <Column width={ 6 } responsive={ true } className="tinted">
            <h2>Pricing</h2>
            <p>WaiveCar rides are free because the cars work as mobile advertising panels. You’re actually paying us just by driving the cars. Pretty sweet trade off, don’t you think?</p>
            <p>Driving a car is free within the first two hours, counting from the moment the car starts running. If you want to continue using the car, a $5,99 per extra hour fee will be charged to your account.</p>
          </Column>
          <Column width={ 6 } responsive={ true }>
          </Column>
        </Row>
    );
  }

  renderAbout() {
    return (
        <Row id="about-us" className="section section-6">
          <Column>
            <h2>About Us</h2>
            <p>WaiveCar is a revolutionary form of transportation for citizens, a smart advertising medium for companies and a powerful way of fostering green, renewable energy in our communities.</p>
          </Column>
        </Row>
    );
  }

  renderFooter() {
    return (
      <nav className="navbar navbar-dark bg-transparent">
        <ul className="nav navbar-nav pull-right">
          <li className="nav-item active">
            <Link to="/terms" className="nav-link">Terms</Link>
          </li>
          <li className="nav-item active">
            <Anchor className="nav-link" href="#download">Download</Anchor>
          </li>
          <li className="nav-item">
            <Anchor className="nav-link" href="#create-an-account">Register</Anchor>
          </li>
          <li className="nav-item">
            <Anchor className="nav-link" href="#our-vision">Vision</Anchor>
          </li>
          <li className="nav-item">
            <Anchor className="nav-link" href="#how-it-works">How It Works?</Anchor>
          </li>
          <li className="nav-item">
            <Anchor className="nav-link" href="#pricing">Pricing</Anchor>
          </li>
          <li className="nav-item">
            <Anchor className="nav-link" href="#about-us">About Us</Anchor>
          </li>
          <li className="nav-item">
            <Link to="/login" className="nav-link">Login</Link>
          </li>
        </ul>
      </nav>
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

        <section className="section-intro bg-faded text-center">
          <div className="container">
            <Waypoint id="wp1" onEnter={ this.handleWaypointEnter } className={ this.state.waypoints.wp1 }>
              <h3 className="">Build your beautiful UI, the way you want it, with Land.io</h3>
            </Waypoint>
            <Waypoint id="wp2" onEnter={ this.handleWaypointEnter } className={ this.state.waypoints.wp2 }>
              <p className="lead">Craft memorable, emotive experiences with our range of beautiful UI elements.</p>
            </Waypoint>
            <Waypoint id="wp3" onEnter={ this.handleWaypointEnter } className={ this.state.waypoints.wp3 }>
              <img src="img/mock.png" alt="iPad mock" className="img-responsive" />
            </Waypoint>
          </div>
        </section>
        <section className="section-features text-center">
          <div className="container">
            <div className="row">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-block">
                    <span className="icon-pen display-1"></span>
                    <h4 className="card-title">250</h4>
                    <h6 className="card-subtitle text-muted">UI Elements</h6>
                    <p className="card-text">Sed risus feugiat fusce eu sit conubia venenatis aliquet nisl cras eu adipiscing ac cras at sem cras per senectus eu parturient quam.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-block">
                    <span className="icon-thunderbolt display-1"></span>
                    <h4 className="card-title">Ultra</h4>
                    <h6 className="card-subtitle text-muted">Modern design</h6>
                    <p className="card-text">Sed risus feugiat fusce eu sit conubia venenatis aliquet nisl cras eu adipiscing ac cras at sem cras per senectus eu parturient quam.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card m-b-0">
                  <div className="card-block">
                    <span className="icon-heart display-1"></span>
                    <h4 className="card-title">Free</h4>
                    <h6 className="card-subtitle text-muted">Forever and ever</h6>
                    <p className="card-text">Sed risus feugiat fusce eu sit conubia venenatis aliquet nisl cras eu adipiscing ac cras at sem cras per senectus eu parturient quam.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section-video bg-inverse text-center wp wp-4">
          <h3 className="sr-only">Video</h3>
          <video id="demo_video" className="video-js vjs-default-skin vjs-big-play-centered" controls poster="img/video-poster.jpg" data-setup='{}'>
            <source src="http://vjs.zencdn.net/v/oceans.mp4" type='video/mp4' />
            <source src="http://vjs.zencdn.net/v/oceans.webm" type='video/webm' />
          </video>
        </section>
        <section className="section-pricing bg-faded text-center">
          <div className="container">
            <h3>Manage your subscriptions</h3>
            <div className="row p-y-lg">
              <div className="col-md-4 p-t-md wp wp-5">
                <div className="card pricing-box">
                  <div className="card-header text-uppercase">
                    Personal
                  </div>
                  <div className="card-block">
                    <p className="card-title">Sed risus feugiat fusce eu sit conubia venenatis aliquet nisl cras.</p>
                    <h4 className="card-text">
                      <sup className="pricing-box-currency">$</sup>
                      <span className="pricing-box-price">19</span>
                      <small className="text-muted text-uppercase">/month</small>
                    </h4>
                  </div>
                  <ul className="list-group list-group-flush p-x">
                    <li className="list-group-item">Sed risus feugiat</li>
                    <li className="list-group-item">Sed risus feugiat fusce eu sit</li>
                    <li className="list-group-item">Sed risus feugiat fusce</li>
                  </ul>
                  <a href="#" className="btn btn-primary-outline">Get Started</a>
                </div>
              </div>
              <div className="col-md-4 stacking-top">
                <div className="card pricing-box pricing-best p-x-0">
                  <div className="card-header text-uppercase">
                    Professional
                  </div>
                  <div className="card-block">
                    <p className="card-title">Sed risus feugiat fusce eu sit conubia venenatis aliquet nisl cras.</p>
                    <h4 className="card-text">
                      <sup className="pricing-box-currency">$</sup>
                      <span className="pricing-box-price">49</span>
                      <small className="text-muted text-uppercase">/month</small>
                    </h4>
                  </div>
                  <ul className="list-group list-group-flush p-x">
                    <li className="list-group-item">Sed risus feugiat</li>
                    <li className="list-group-item">Sed risus feugiat fusce eu sit</li>
                    <li className="list-group-item">Sed risus feugiat fusce</li>
                    <li className="list-group-item">Sed risus feugiat</li>
                  </ul>
                  <a href="#" className="btn btn-primary">Get Started</a>
                </div>
              </div>
              <div className="col-md-4 p-t-md wp wp-6">
                <div className="card pricing-box">
                  <div className="card-header text-uppercase">
                    Enterprise
                  </div>
                  <div className="card-block">
                    <p className="card-title">Sed risus feugiat fusce eu sit conubia venenatis aliquet nisl cras.</p>
                    <h4 className="card-text">
                      <sup className="pricing-box-currency">$</sup>
                      <span className="pricing-box-price">99</span>
                      <small className="text-muted text-uppercase">/month</small>
                    </h4>
                  </div>
                  <ul className="list-group list-group-flush p-x">
                    <li className="list-group-item">Sed risus feugiat</li>
                    <li className="list-group-item">Sed risus feugiat fusce eu sit</li>
                    <li className="list-group-item">Sed risus feugiat fusce</li>
                  </ul>
                  <a href="#" className="btn btn-primary-outline">Get Started</a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section-testimonials text-center bg-inverse">
          <div className="container">
            <h3 className="sr-only">Testimonials</h3>
            <div id="carousel-testimonials" className="carousel slide" data-ride="carousel" data-interval="0">
              <div className="carousel-inner" role="listbox">
                <div className="carousel-item active">
                  <blockquote className="blockquote">
                    <img src="img/face1.jpg" height="80" width="80" alt="Avatar" className="img-circle" />
                    <p className="h3">Good design at the front-end suggests that everything is in order at the back-end, whether or not that is the case.</p>
                    <footer>Dmitry Fadeyev</footer>
                  </blockquote>
                </div>
                <div className="carousel-item">
                  <blockquote className="blockquote">
                    <img src="img/face2.jpg" height="80" width="80" alt="Avatar" className="img-circle" />
                    <p className="h3">It’s not about knowing all the gimmicks and photo tricks. If you haven’t got the eye, no program will give it to you.</p>
                    <footer>David Carson</footer>
                  </blockquote>
                </div>
                <div className="carousel-item">
                  <blockquote className="blockquote">
                    <img src="img/face3.jpg" height="80" width="80" alt="Avatar" className="img-circle" />
                    <p className="h3">There’s a point when you’re done simplifying. Otherwise, things get really complicated.</p>
                    <footer>Frank Chimero</footer>
                  </blockquote>
                </div>
                <div className="carousel-item">
                  <blockquote className="blockquote">
                    <img src="img/face4.jpg" height="80" width="80" alt="Avatar" className="img-circle" />
                    <p className="h3">Designing for clients that don’t appreciate the value of design is like buying new tires for a rental car.</p>
                    <footer>Joel Fisher</footer>
                  </blockquote>
                </div>
                <div className="carousel-item">
                  <blockquote className="blockquote">
                    <img src="img/face5.jpg" height="80" width="80" alt="Avatar" className="img-circle" />
                    <p className="h3">Every picture owes more to other pictures painted before than it owes to nature.</p>
                    <footer>E.H. Gombrich</footer>
                  </blockquote>
                </div>
              </div>
              <ol className="carousel-indicators">
                <li className="active">
                  <img src="img/face1.jpg" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="0" className="img-responsive img-circle" />
                </li>
                <li>
                  <img src="img/face2.jpg" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="1" className="img-responsive img-circle" /></li>
                <li>
                  <img src="img/face3.jpg" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="2" className="img-responsive img-circle" /></li>
                <li>
                  <img src="img/face4.jpg" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="3" className="img-responsive img-circle" /></li>
                <li>
                  <img src="img/face5.jpg" alt="Navigation avatar" data-target="#carousel-testimonials" data-slide-to="4" className="img-responsive img-circle" />
                </li>
              </ol>
            </div>
          </div>
        </section>
        <section className="section-text">
          <div className="container">
            <h3 className="text-center">Make your mark on the product industry</h3>
            <div className="row p-y-lg">
              <div className="col-md-5">
                <p className="wp wp-7">A posuere donec senectus suspendisse bibendum magna ridiculus a justo orci parturient suspendisse ad rhoncus cursus ut parturient viverra elit aliquam ultrices est sem. Tellus nam ad fermentum ac enim est duis facilisis congue a lacus adipiscing consequat risus consectetur scelerisque integer suspendisse a mus integer elit massa ut.</p>
              </div>
              <div className="col-md-5 col-md-offset-2 separator-x">
                <p className="wp wp-8">A posuere donec senectus suspendisse bibendum magna ridiculus a justo orci parturient suspendisse ad rhoncus cursus ut parturient viverra elit aliquam ultrices est sem. Tellus nam ad fermentum ac enim est duis facilisis congue a lacus adipiscing consequat risus consectetur scelerisque integer suspendisse a mus integer elit massa ut.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="section-news">
          <div className="container">
            <h3 className="sr-only">News</h3>
            <div className="bg-inverse">
              <div className="row">
                <div className="col-md-6 p-r-0">
                  <figure className="has-light-mask m-b-0 image-effect">
                    <img src="https://images.unsplash.com/photo-1442328166075-47fe7153c128?q=80&fm=jpg&w=1080&fit=max" alt="Article thumbnail" className="img-responsive" />
                  </figure>
                </div>
                <div className="col-md-6 p-l-0">
                  <article className="center-block">
                    <span className="label label-info">Featured article</span>
                    <br />
                    <h5><a href="#">Design studio with product designer Peter Finlan <span className="icon-arrow-right"></span></a></h5>
                    <p className="m-b-0">
                      <a href="#"><span className="label label-default text-uppercase"><span className="icon-tag"></span> Design Studio</span></a>
                      <a href="#"><span className="label label-default text-uppercase"><span className="icon-time"></span> 1 Hour Ago</span></a>
                    </p>
                  </article>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 col-md-push-6 p-l-0">
                  <figure className="has-light-mask m-b-0 image-effect">
                    <img src="https://images.unsplash.com/photo-1434394673726-e8232a5903b4?q=80&fm=jpg&w=1080&fit=max" alt="Article thumbnail" className="img-responsive" />
                  </figure>
                </div>
                <div className="col-md-6 col-md-pull-6 p-r-0">
                  <article className="center-block">
                    <span className="label label-info">Featured article</span>
                    <br />
                    <h5><a href="#">How bold, emotive imagery can connect with your audience <span className="icon-arrow-right"></span></a></h5>
                    <p className="m-b-0">
                      <a href="#"><span className="label label-default text-uppercase"><span className="icon-tag"></span> Design Studio</span></a>
                      <a href="#"><span className="label label-default text-uppercase"><span className="icon-time"></span> 1 Hour Ago</span></a>
                    </p>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer className="section-footer bg-inverse" role="contentinfo">
          <div className="container">
            <div className="row">
              <div className="col-md-6 col-lg-5">
                <div className="media">
                  <div className="media-left">
                    <span className="media-object icon-logo display-1"></span>
                  </div>
                  <small className="media-body media-bottom">
                    &copy; Land.io 2015. <br />
                    Designed by Peter Finlan, developed by Taty Grassini, exclusively for Codrops.
                    </small>
                </div>
              </div>
              <div className="col-md-6 col-lg-7">
                <ul className="list-inline m-b-0">
                  <li className="active"><a href="http://tympanus.net/codrops/?p=25217">About Land.io</a></li>
                  <li><a href="ui-elements.html">UI Kit</a></li>
                  <li><a href="https://github.com/tatygrassini/landio-html" target="_blank">GitHub</a></li>
                  <li><a className="scroll-top" href="#totop">Back to top <span className="icon-caret-up"></span></a></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>

      </div>
    );
  }
}

// ### Register Template
templates.register('home', {
  component : HomeTemplate,
  path      : '/h'
});
