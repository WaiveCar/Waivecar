import React                 from 'react';
import { relay }             from 'bento';
import { templates, editor } from './index';
import policies              from 'policies';

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
        <ViewEditor viewId={ this.props.params.id } />
      </div>
    );
  }

}

// ### Register Template
/*
templates.register('editor', {
  component : EditorTemplate,
  path      : '/views/:id',
  onEnter   : policies.isAuthenticated
});
*/
