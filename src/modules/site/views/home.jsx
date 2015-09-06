'use strict';

import React            from 'react';
import Reach            from 'reach-react';
import config           from 'config';
import { Anchor, Form, Layout } from 'reach-components';
import { Link }         from 'react-router';

let { Container, Row, Column } = Layout;
let { FormGroup }              = Form;

export default class HomeView extends React.Component {

  /**
   * @class HomeView
   * @constructor
   */
  constructor(...args) {
    super(...args);
  }

  /**
   * @method renderNavigation
   */
  renderNavigation() {
    return (
      <nav className="navbar navbar-dark bg-transparent">
        <Link className="navbar-brand" to="home">
          <img src="/images/brand.svg" alt="WaiveCar" />
        </Link>
        <ul className="nav navbar-nav pull-right">
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
            <Link to="login" className="nav-link">Login</Link>
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
      <Container isFluid={ true }>
        <Row id="download" className="section section-1 inverted">
          <Column>
            { this.renderNavigation() }
            <Row>
              <Column width={ 1 } />
              <Column width={ 6 }>
                <div className="tag">
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
                </div>
              </Column>
              <Column width={ 4 }>
                <img className="app-sample pull-right" src="/images/site/iphone.png" />
              </Column>
              <Column width={ 1 } />
            </Row>
            <Row>
              <Column>
                <div className="scroll text-center">
                  Learn how
                  <i className="material-icons">down</i>
                </div>
              </Column>
            </Row>
          </Column>
        </Row>
        <Row id="create-an-account" className="section section-2">
          <Column>
            <h3>Create an account</h3>
            <p className="lead">Once registered, you’ll be able to find, book, and start using electric cars for free.</p>
          </Column>
        </Row>
        <Row id="our-vision" className="section section-3 inverted">
          <Column className="text-center">
            <h3>Our Vision</h3>
            <p>We believe there are smarter ways for people in the city to benefit from cars.</p>
            <p>Our contribution is WaiveCar, a revolutionary system in which users can find, book and drive ad-displaying, electric cars for free, anywhere in the city.</p>
            <p>This is how people and companies can create a more sustainable future.</p>
            <a href="#" target="_blank" className="btn btn-primary text-center">Download App</a>
          </Column>
        </Row>
        <Row id="how-it-works" className="section section-4">
          <Column>
            <h2>How it works</h2>
            <Row>
              <Column width={ 3 } responsive={ true } className="text-center">
                <img className="img-circle" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="Generic placeholder image" width="140" height="140" />
                <h3>Find an available car near you</h3>
                <p>A map displays all available cars in your area. Each car has  important information such as charge level and exact directions to its location.</p>
              </Column>
              <Column width={ 3 } responsive={ true } className="text-center">
                <img className="img-circle" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="Generic placeholder image" width="140" height="140" />
                <h3>Book the car</h3>
                <p>Once you find the car you want, book it. The car will be booked for you and made unavailable to other WaiveCar users. Now you can go get it.</p>
              </Column>
              <Column width={ 3 } responsive={ true } className="text-center">
                <img className="img-circle" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="Generic placeholder image" width="140" height="140" />
                <h3>Connect and drive</h3>
                <p>The app will detect your position and unlock your WaiveCar, you can connect and unlock it using the mobile app. Drive safely and enjoy!</p>
              </Column>
              <Column width={ 3 } responsive={ true } className="text-center">
                <img className="img-circle" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="Generic placeholder image" width="140" height="140" />
                <h3>Leave it there, please</h3>
                <p>Once your free driving time is up, a map will show where you can drop the car off. There are rewards depending on where you do it.  </p>
              </Column>
            </Row>
          </Column>
        </Row>
        <Row id="pricing" className="section section-5 inverted">
          <Column width={ 6 } responsive={ true } className="tinted">
            <h2>Pricing</h2>
            <p>WaiveCar rides are free because the cars work as mobile advertising panels. You’re actually paying us just by driving the cars. Pretty sweet trade off, don’t you think?</p>
            <p>Driving a car is free within the first two hours, counting from the moment the car starts running. If you want to continue using the car, a $5,99 per extra hour fee will be charged to your account.</p>
          </Column>
          <Column width={ 6 } responsive={ true }>
          </Column>
        </Row>
        <Row id="about-us" className="section section-6">
          <Column>
            <h2>About Us</h2>
            <p>WaiveCar is a revolutionary form of transportation for citizens, a smart advertising medium for companies and a powerful way of fostering green, renewable energy in our communities.</p>
          </Column>
        </Row>
        <Row className="section section-7">
          <Column>
            { this.renderNavigation() }
          </Column>
        </Row>
      </Container>
   );
  }

}