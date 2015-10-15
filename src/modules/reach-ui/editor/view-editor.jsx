import React                      from 'react';
import UI                         from 'reach-ui';
import mixin                      from 'react-mixin';
import update                     from 'react/lib/update';
import { History }                from 'react-router';
import { DragDropContext }        from 'react-dnd';
import HTML5Backend               from 'react-dnd-html5-backend';
import { api }                    from 'reach-react';
import { Form, snackbar, Button } from 'reach-components';
import components                 from '../lib/components';
import resources                  from '../lib/resources';
import fields                     from '../lib/fields';
import Item                       from './view-item';
import ItemCategories             from './item-categories';
import ViewContainer              from './view-container';
import async                      from 'async';
import { helpers  }               from 'reach-react';
import search                     from './lib/search';
import transform                  from './lib/transform';

@DragDropContext(HTML5Backend)
@mixin.decorate(History)
export default class ViewLayout extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      data     : {
        template : 'app',
        title    : null,
        class    : null,
        path     : null,
        policy   : 'isAnyone',
        menus    : []
      },
      layout   : {
        editorId   : 0,
        type       : 'container',
        category   : ItemCategories.CONTAINER,
        accepts    : [ ItemCategories.COMPONENT ],
        components : [ ]
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
        layout.components = data.layout.components.map(transform.toViewComponent);
      }

      this.setState({
        data   : data,
        layout : layout
      });
    }.bind(this));
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

    async.map(comps, transform.toComponent, function(err, transformedComponents) {
      data.layout = {
        components : transformedComponents
      };

      if (data.menus) {
        data.menu = {
          parent    : null,
          title     : data.title,
          icon      : 'dashboard',
          locations : data.menus
        }
      }

      api[method](action, data, function (err, res) {
        if (err) {
          snackbar.notify({
            type    : 'danger',
            message : err.message
          });
          return;
        }
        console.log(res);
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
   * Updated a ViewComponent in-place and saves it to State
   * @param  {Object} viewComponent
   */
  handleUpdate(viewComponent) {
    let layout = this.state.layout;
    let found = search.findViewComponent(null, 0, layout, viewComponent.editorId);
    Object.assign(found.component, viewComponent);
    this.setState({
      layout : layout
    });
  }

  /**
   * @param  {String} item
   */
  handleDrop(item) {
    let layout = this.state.layout;
    let row    = Object.assign({}, this.state.items.find((i) => i.type == 'row'));
    let column = Object.assign({}, this.state.items.find((i) => i.type == 'column'));
    row.editorId     = helpers.random(10);
    column.editorId  = helpers.random(10);

    if (item.zone === 'all' && !item.nearest) {
      column.components = [ item.viewComponent ];
      row.components    = [ column ];
      layout.components = [ row ];
    } else {
      let parentType = [ 'top', 'bottom' ].indexOf(item.zone) > -1 ? 'row' : 'column';
      let container = search.findViewComponent(null, 0, layout, parentType == 'row' ? item.row : item.column);
      switch (item.zone) {
        case 'right'  :
          container.index   = container.index + 1;
        case 'left'   :
          column.components = [ item.viewComponent ];
          container.parent.components.splice(container.index, 0, column);
          let columnWidth = Math.floor(12 / container.parent.components.length) || 12;
          container.parent.components.forEach((c) => {
            c.options.width = columnWidth;
          });
          break;
        case 'bottom' :
          container.index   = container.index + 1;
        case 'top'    :
          column.components = [ item.viewComponent ];
          row.components    = [ column ]
          container.parent.components.splice(container.index, 0, row);
          break;
      }
    }

    this.setState({
      layout          : layout,
      lastDroppedItem : item.viewComponent
    });
  }

  /**
   * @return {Object}
   */
  render() {
    return (
      <div id='ui-editor'>
        <div className='ui-content'>
          { this.renderViewContainer() }
        </div>
        <div className='ui-toolbar'>
          { this.renderToolbarTitle('View Settings') }
          <div className='container'>
            { this.renderSettings() }
          </div>
          { this.renderToolbarTitle('Components') }
          { this.renderItems() }
          { this.renderActions() }
          {
            this.state.data && this.state.data.path ? <a className='ui-toolbar-view-link' href={ this.state.data.path }>Go to view</a> : ''
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
        onUpdate        = { this.handleUpdate.bind(this) }
      />
    );
  }

  /**
   * @param  {String}
   * @return {Object} div
   */
  renderToolbarTitle(title) {
    return <div className='ui-toolbar-title'>{ title }</div>
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
            value : 'isActive'
          },
          {
            name  : 'Administrators',
            value : 'isAdministrator'
          }
        ]
      },
      {
        label     : 'Menus',
        name      : 'menus',
        component : 'react-multi-select',
        options : [
          {
            name  : 'Sidebar',
            value : 'sidebar'
          },
          {
            name  : 'Nav',
            value : 'nav'
          }
        ]
      }
    ];

    return (
      <Form
        ref       = 'form'
        className = 'form-inline ui-view-settings'
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
    const components = items.filter((f) => { return f.category === ItemCategories.COMPONENT; });
    return (
      <ul className='ui-component-list'>
      {
        components.map((item, index) => {
          return <li className='ui-component' key={ index }>
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
        this.history.goBack();
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
      <div className='ui-toolbox-actions'>
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