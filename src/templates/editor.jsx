'use strict';

import React                from 'react';
import Reach, { relay }     from 'reach-react';
import UI                   from 'reach-ui';
import { editor, templates, views } from 'reach-ui';
import policies             from 'policies';
import Header               from 'views/app/header';
import 'styles/editor/style.scss';

let { ViewEditor } = editor;

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
        <Header />
        <ViewEditor viewId={ this.props.params.id } />
      </div>
    );
  }
}

// ### Register Template

templates.register('editor', {
  component : EditorTemplate,
  path      : '/views/:id',
  onEnter   : policies.isAuthenticated
});
