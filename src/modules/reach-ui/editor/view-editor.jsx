import React                from 'react';
import UI                   from 'reach-ui';
import mixin                from 'react-mixin';
import update               from 'react/lib/update';
import { Navigation }       from 'react-router';
import { DragDropContext }  from 'react-dnd';
import HTML5Backend         from 'react-dnd/modules/backends/HTML5';
import { api }              from 'reach-react';
import { Form, snackbar, Button } from 'reach-components';
import components           from '../lib/components';
import resources            from '../lib/resources';
import fields               from '../lib/fields';
import newId                from './newid';
import Item                 from './item';
import ItemCategories       from './item-categories';
import ViewContainer        from './view-container';
import async                from 'async';

/**
 * @param  {Object}
 * @param  {Function}
 * @return {Mixed}
 */
function createContentOrReturn(viewComponent, next) {
  if (viewComponent.type === 'content') {
    if (!viewComponent.options) {
      viewComponent.options = {};
    }
    if (!viewComponent.options.id) {
      let resource = resources.get('contents').store;
      let method = resource.method.toLowerCase();
      let action = resource.uri;
      api[method](action, { html : '<p>Awaiting Text</p>' }, function(err, res) {
        viewComponent.options = { id : res.id };
        return next(err, viewComponent);
      });
    } else {
      return next(null, viewComponent);
    }
  } else {
    return next(null, viewComponent);
  }
}

@DragDropContext(HTML5Backend)
@mixin.decorate(Navigation)
export default class ViewLayout extends React.Component {

  constructor(...args) {
    super(...args);
    this.transformToComponent     = this.transformToComponent.bind(this);
    this.transformToViewComponent = this.transformToViewComponent.bind(this);

    this.state = {
      data   : null,
      layout : {
        type       : 'Container',
        category   : ItemCategories.CONTAINER,
        accepts    : [ ItemCategories.ROW, ItemCategories.COMPONENT ],
        components : null
      },
      items : [
        { name : 'Row',    type : 'row',     icon : 'border_horizontal', category : ItemCategories.ROW,    accepts : [ ItemCategories.COLUMN ], options : {} },
        { name : 'Column', type : 'column',  icon : 'border_vertical',   category : ItemCategories.COLUMN, accepts : [ ItemCategories.ROW, ItemCategories.COMPONENT ], options : { width : 12 } }
      ].concat(components.getAll()),
      lastDroppedItem : null
    };
  }

  /**
   * Updates data if view is of type create.
   * @return {Void}
   */
  componentDidMount() {
    if (!this.isCreate()) {
      this.setData(this.id());
    }
  }

  /**
   * @return {Boolean}
   */
  isCreate() {
    return this.id() === 'create';
  }

  /**
   * Returns the id defined in the route.
   * @return {Mixed}
   */
  id() {
    return this.props.viewId;
  }

  /**
   * Returns the resource for the current instance.
   * @return {Object}
   */
  resource() {
    let resource = resources.get('views');
    if (this.id() === 'create') {
      return resource.store;
    }
    return resource.update;
  }

  /**
   * Updates the data state based on the provided id.
   * @param  {Mixed} id
   */
  setData(id) {
    let resource = this.resource();
    api.get(resource.uri.replace(':id', id), (error, data) => {
      if (error) {
        throw new Error(error);
      }

      let layout = this.state.layout;
      if (data.layout && data.layout.components) {
        layout.components = data.layout.components.map(this.transformToViewComponent);
      }

      this.setState({
        data   : data,
        layout : layout
      });
    }.bind(this));
  }

  /**
   * @param {Component} component
   * @param {Number}    index
   */
  transformToViewComponent(component, index) {
    let defaults = this.state.items.find(f => f.type === component.type);
    component.id = newId();
    if (component.components) {
      component.components = component.components.map(this.transformToViewComponent);
    } else if (component.category !== ItemCategories.COMPONENT) {
      component.components = [];
    }
    return { ...defaults, ...component };
  }

  /**
   * @param  {Object}
   * @param  {Function}
   * @return {Mixed}
   */
  transformToComponent(viewComponent, next) {
    let component = {
      type : viewComponent.type,
      options : viewComponent.options
    }
    if (viewComponent.category !== ItemCategories.COMPONENT) {
      component.components = viewComponent.components;
    }
    if (component.components) {
      async.map(component.components, this.transformToComponent, function(err, components) {
        component.components = components;
        createContentOrReturn(component, next);
      })
    } else {
      createContentOrReturn(component, next);
    }
  }

  /**
   * @param  {Object}
   * @return {Void}
   */
  submit() {
    let resource = this.resource();
    let data     = this.refs.form.data();
    let comps    = Object.assign({}, this.state.layout.components);
    let method   = resource.method.toLowerCase();
    let action   = resource.uri.replace(':id', this.id());

    if (this.isCreate()) {
      action = resource.uri;
    }

    async.map(comps, this.transformToComponent, function(err, transformedComponents) {
      data.layout = {
        components : transformedComponents
      };

      console.log(data);

      api[method](action, data, function (err, res) {
        if (err) {
          snackbar.notify({
            type    : 'danger',
            message : err.message
          });
          return;
        }
        snackbar.notify({
          type    : 'success',
          message : 'Record was successfully updated.'
        });
        // I think when youre in the editor you don't want to go back, I click save alot when
        // making changes as a reflex and being removed from the editor feels unatural.
        // this.goBack();
      }.bind(this));
    }.bind(this));
  }

  /**
   * @param  {String} item
   * @return {String}
   */
  handleDrop(item) {
    let layout = this.state.layout;
    if (!layout.components) {
      if (item.category === ItemCategories.COMPONENT) {
        layout.components = item;
      } else {
        layout.components = [ item ];
      }
    } else {
      let existing = layout.components.find(l => l.id === item.id);
      if (existing) {
        existing = item;
      } else {
        layout.components.push(item);
      }
    }

    this.setState({
      layout          : layout,
      lastDroppedItem : item
    });
  }

  /**
   * @return {Object}
   */
  render() {
    return (
      <div id="ui-editor">
        <div className="ui-content">
          { this.renderViewContainer() }
        </div>
        <div className="ui-toolbar">
          { this.renderToolbarTitle('View Settings') }
          <div className="container">
            { this.renderSettings() }
          </div>
          { this.renderToolbarTitle('Components') }
          { this.renderItems() }
          { this.renderActions() }
          {
            this.state.data && this.state.data.path ? <a className="ui-toolbar-view-link" href={ this.state.data.path }>Go to view</a> : ''
          }
        </div>
      </div>
    );
  }

  /**
   * @return {Object} ViewContainer
   */
  renderViewContainer() {
    const { layout, lastDroppedItem } = this.state;
    return (
      <ViewContainer
        key             = { 'container' }
        type            = { layout.type }
        category        = { layout.category }
        components      = { layout.components }
        accepts         = { layout.accepts }
        lastDroppedItem = { lastDroppedItem }
        onDrop          = { this.handleDrop.bind(this) }
      />
    );
  }

  /**
   * @param  {String}
   * @return {Object} div
   */
  renderToolbarTitle(title) {
    return <div className="ui-toolbar-title">{ title }</div>
  }

  /**
   * @return {Object} Form
   */
  renderSettings() {
    let list   = UI.fields.get('views');
    let action = this.isCreate() ? 'create' : 'update';
    let fields = [
      {
        label     : 'Template',
        component : 'select',
        name      : 'template',
        options   : [
          {
            name  : 'App',
            value : 'app'
          },
          {
            name  : 'Home',
            value : 'home'
          },
          {
            name  : 'Site',
            value : 'site'
          },
        ]
      },
      {
        label     : 'Title',
        component : 'input',
        type      : 'text',
        name      : 'title'
      },
      {
        label     : 'Class',
        component : 'input',
        type      : 'text',
        name      : 'class'
      },
      {
        label     : 'Path',
        component : 'input',
        type      : 'text',
        name      : 'path'
      },
      {
        label     : 'Limited To',
        component : 'select',
        type      : 'text',
        name      : 'policy',
        options   : [
          {
            name  : 'Anyone',
            value : 'isAnyone'
          },
          {
            name  : 'Authenticated Users',
            value : 'isAuthenticated'
          },
          {
            name  : 'Active Users',
            value : 'isPending'
          },
          {
            name  : 'Administrators',
            value : 'isAdministrator'
          }
        ]
      }
    ];

    return (
      <Form
        ref       = "form"
        className = "form-inline ui-view-settings"
        default   = { this.state.data }
        fields    = { fields }
      />
    );
  }

  /**
   * @return {Object} ul
   */
  renderItems() {
    const { items } = this.state;
    return (
      <ul className="ui-component-list">
      {
        items.map((item, index) => {
          return <li className="ui-component" key={ index }>
            <Item
              key      = { index }
              id       = { `item-${ index }`}
              name     = { item.name }
              type     = { item.type }
              icon     = { item.icon }
              category = { item.category }
              accepts  = { item.accepts }
              options  = { item.options }
            />
          </li>
        })
      }
      </ul>
    );
  }

  /**
   * @return {Object} div
   */
  renderActions() {
    let buttons = [];

    buttons.push({
      value : 'Cancel',
      class : 'ui-action-btn',
      click : () => {
        this.goBack();
      }.bind(this)
    });

    if (this.isCreate()) {
      buttons.push({
        value : 'Create',
        class : 'ui-action-btn',
        click : this.submit.bind(this)
      });
    } else {
      buttons.push({
        value : 'Delete',
        class : 'ui-action-btn',
        click : () => {
          console.log('Delete: %s!', this.id());
        }.bind(this)
      });
      buttons.push({
        value : 'Save',
        class : 'ui-action-btn',
        click : this.submit.bind(this)
      });
    }

    return (
      <div className="ui-toolbox-actions">
      {
        buttons.map((btn, i) => {
          return (
            <Button
              key       = { i }
              className = { btn.class }
              type      = { btn.type || 'button' }
              value     = { btn.value }
              style     = { btn.style || null }
              onClick   = { btn.click }
            />
          )
        })
      }
      </div>
    );
  }

}