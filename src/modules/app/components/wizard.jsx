'use strict';

import React      from 'react';
import Reach      from 'reach-react';
import { Layout } from 'reach-components';
import components from '../components';
import UI         from '../ui';

let { Container, Row, Column } = Layout;
let Relay = Reach.Relay;

export default class WizardComponent extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      step : 0,
      max  : this.props.steps.length - 1
    };
  }

  cancel() {
    this.setState({
      step : 0
    })
  }

  nextStep() {
    if (this.state.step < this.state.max) {
      this.setState({
        step : this.state.step + 1
      });
    }
  }

  previousStep() {
    if (this.state.step > 0) {
      this.setState({
        step : this.state.step - 1
      });
    }
  }

  renderComponent(component) {
    let props = { params : { id : 'MOCK_1' } };

    return components.renderComponent(component, props);
  }

  /**
   * @method render
   */
  render() {
    let step          = this.props.steps[this.state.step];
    let progressValue = (this.state.step / this.state.max) * 100;
    let progressStyle = {
      width : progressValue + '%'
    };

    return (
      <div className="wizard">
        <h3 className="wizard-progress text-center">{ step.title }</h3>
        <progress className="progress" value={ progressValue } max="100">
          <div className="progress">
            <span className="progress-bar" style={ progressStyle }>{ progressStyle.width }</span>
          </div>
        </progress>
        { this.renderWizardStep(step) }
      </div>
    );
  }

  renderWizardStep(step) {
    return (
      <div className="wizard-step" key={ this.state.step }>
        { this.renderComponent(step.component) }
        <div className="text-center">
          <div className="btn-group text-center" role="group" aria-label="Actions">
            { step.actions.cancel &&
              <button type="button" onClick={ this.cancel.bind(this) } className="btn btn-danger-outline">{ step.actions.cancel }</button>
            }
            { step.actions.previous &&
              <button type="button" onClick={ this.previousStep.bind(this) } className="btn btn-secondary">{ step.actions.previous }</button>
            }
            { step.actions.next &&
              <button type="button" onClick={ this.nextStep.bind(this) } className="btn btn-primary-outline">{ step.actions.next }</button>
            }
          </div>
        </div>
      </div>
    );
  }
};