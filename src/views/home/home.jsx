'use strict';

import React                    from 'react';
import Reach                    from 'bento';
import config                   from 'config';
import { Anchor, Form, Layout } from 'bento-web';
import { Link }                 from 'react-router';

let { Container, Row, Column } = Layout;
let { FormGroup }              = Form;

module.exports = class HomeView extends React.Component {

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
        <Row className="section section-7">
          <Column>
            { this.renderNavigation() }
          </Column>
        </Row>
      </Container>
   );
  }

}
