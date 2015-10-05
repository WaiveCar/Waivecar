'use strict';

import React     from 'react';
import { relay } from 'reach-react';
import UI        from './index';
import policies  from 'policies';
import 'styles/editor/style.scss';

console.log(UI);

let { ViewEditor } = UI.editor;

/**
 * @class EditorTemplate
 */
class EditorTemplate extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    relay.subscribe(this, 'views');
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'views');
  }

  /**
   * @method render
   */
  render() {
    return (
      <div id="editor">
        <ViewEditor viewId={ this.props.params.id } />
      </div>
    );
  }
  
}

// ### Register Template

UI.templates.register('editor', {
  component : EditorTemplate,
  path      : '/views/:id',
  onEnter   : policies.isAuthenticated
});