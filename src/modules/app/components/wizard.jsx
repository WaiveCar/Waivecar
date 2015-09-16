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
  }

  renderComponent(component) {
    return components.renderComponent(component, this.props);
  }

  /**
   * @method render
   */
  render() {
    return (
      <div className="wizard">
        {
          this.props.steps.map((step, stepIndex) => {
            return this.renderWizardStep(step, stepIndex)
          }.bind(this))
        }
      </div>
    );
  }

  renderWizardStep(step, stepIndex) {
    return (
      <div key={ stepIndex }>
        <h3>{ step.step } : { step.title}</h3>
        { this.renderComponent(step.component) }
        <div className="text-center">
          <div className="btn-group text-center" role="group" aria-label="Actions">
            { step.actions.cancel &&
              <button type="button" className="btn btn-danger-outline">{ step.actions.cancel }</button>
            }
            { step.actions.previous &&
              <button type="button" className="btn btn-secondary">{ step.actions.previous }</button>
            }
            { step.actions.next &&
              <button type="button" className="btn btn-primary-outline">{ step.actions.next }</button>
            }
          </div>
        </div>
      </div>
    );
  }
};