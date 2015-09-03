import React      from 'react';
import Reach      from 'reach-react';
import { Header } from './components/header';
import './styles/style.scss';

export default class AppLayout extends React.Component {
  render() {
    return (
      <div id="app">
        <Header />
        { this.props.children }
      </div>
    );
  }
}