'use strict';

import React         from 'react';
import { relay }     from 'reach-react';
import { templates } from 'reach-ui';
import { snackbar }  from 'reach-components';

let index = 0;

/**
 * Renders the authentication layout for the application.
 * @class SandboxTemplate
 */
class SandboxTemplate extends React.Component {

  snack() {
    snackbar.notify({
      type    : 'success',
      message : `Sample message #${ index }`,
      action  : {
        title : 'DISMISS',
        click : function () {
          this.dismiss();
        }
      }
    });
    index++;
  }

  currentState() {
    console.log(relay.getState('snackbar'));
  }

  render() {
    return (
      <div>
        <button onClick={ this.snack }>Snackbar</button>
        <button onClick={ this.currentState }>State</button>
      </div>
    );
  }

}

// ### Register Template

templates.register('sandbox', {
  component : SandboxTemplate,
  path      : '/sandbox'
});