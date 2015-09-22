'use strict';

import React                             from 'react';
import Reach                             from 'reach-react';
import mixin                             from 'react-mixin';
import { Navigation }                    from 'react-router';
import { Form, Snackbar }                from 'reach-components';
import { components, fields, resources } from 'reach-ui';

@mixin.decorate(Navigation)

class UIForm extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      id : this.props.params.id
    }
  }

  /**
   * @method fields
   */
  fields() {
    let list   = fields.get(this.props.fields.id);
    let action = this.state.id === 'create' ? 'create' : 'update';
    return this.props.fields[action].map((value) => {
      if (list.hasOwnProperty(value)) {
        return list[value];
      }
    });
  }

  /**
   * @method render
   */
  render() {
    return (
      <Form 
        fields  = { this.fields() }
        buttons = { [] }
      />
    );
  }

}

// ### Register Component

components.register({
  type  : 'form',
  class : UIForm
});