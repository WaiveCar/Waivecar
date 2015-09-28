import React                from 'react';
import mixin                from 'react-mixin';
import update               from 'react/lib/update';
import { Navigation }       from 'react-router';
import { DragDropContext }  from 'react-dnd';
import HTML5Backend         from 'react-dnd/modules/backends/HTML5';
import { api }              from 'reach-react';
import { Snackbar, Button } from 'reach-components';
import components           from '../lib/components';
import resources            from '../lib/resources';
import newId                from './newid';
import Item                 from './item';
import ItemCategories       from './item-categories';
import ViewContainer        from './view-container';
import async                from 'async';

function createContentOrReturn(viewComponent, next) {
  if (viewComponent.type === 'content') {
    if (!viewComponent.options) {
      viewComponent.options = {};
    }
    if (!viewComponent.options.id) {
      let resource = resources.get('contents').store;
      let method = resource.method.toLowerCase();
      let action = resource.uri;
      api[method](action, {}, function(err, res) {
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
      data : null,
      layout : {
        type       : 'Container',
        category   : ItemCategories.CONTAINER,
        accepts    : [ ItemCategories.ROW, ItemCategories.COMPONENT ],
        components : null
      },
      items : [
        { name : 'Row',    type : 'row',     icon : 'border_horizontal', category : ItemCategories.ROW,    accepts : [ ItemCategories.COLUMN ],                        options : {} },
        { name : 'Column', type : 'column',  icon : 'border_vertical',   category : ItemCategories.COLUMN, accepts : [ ItemCategories.ROW, ItemCategories.COMPONENT ], options : { width : 12 } }
      ].concat(components.getAll()),
      lastDroppedItem : null
    };
  }

  /**
   * Checks if the View is of type update and requests data if it is.
   * @method componentDidMount
   */
  componentDidMount() {
    if (!this.isCreate()) {
      this.setData(this.id());
    }
  }

  /**
   * @method isCreate
   * @return {Boolean}
   */
  isCreate() {
    return this.id() === 'create';
  }

  /**
   * Returns the id defined in the route.
   * @method id
   * @return {Mixed}
   */
  id() {
    return this.props.viewId;
  }

  /**
   * Returns the resource for the current instance.
   * @method resource
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
   * @method setData
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

  transformToComponent(viewComponent, next) {
    delete viewComponent.id;
    delete viewComponent.icon;
    delete viewComponent.category;
    delete viewComponent.accepts;
    delete viewComponent.name;

    if (viewComponent.components) {
      async.map(viewComponent.components, this.transformToComponent, function(err, components) {
        viewComponent.components  = components;
        createContentOrReturn(viewComponent, next);
      })
    } else {
      createContentOrReturn(viewComponent, next);
    }
  }

  /**
   * @method submit
   */
  submit(event) {
    event.preventDefault();
    let resource = this.resource();
    let method = resource.method.toLowerCase();
    let action = resource.uri.replace(':id', this.id());
    let data = this.state.data;

    if (this.isCreate()) {
      action = resource.uri;
    }

    async.map(this.state.layout.components, this.transformToComponent, function(err, transformedComponents) {

      data.layout = {
        components : transformedComponents
      };

      api[method](action, data, function (err, res) {
        if (err) {
          Snackbar.notify({
            type    : 'danger',
            message : err.message
          });
          return;
        }

        // Snackbar.notify({
        //   type    : 'success',
        //   message : 'Record was successfully updated.'
        // });
        this.goBack();
      }.bind(this));
    }.bind(this));
  }

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

  renderFormActions() {
    let buttons = [];

    buttons.push({
      value : 'cancel',
      class : 'btn',
      click : () => {
        this.goBack();
      }.bind(this)
    });

    if (this.isCreate()) {
      buttons.push({
        value : 'submit',
        type  : 'submit',
        class : 'btn btn-primary',
        click : this.submit.bind(this)
      });
    } else {
      buttons.push({
        value : 'delete',
        class : 'btn btn-danger',
        click : () => {
          console.log('Delete: %s!', this.id());
        }.bind(this)
      });
      buttons.push({
        value : 'update',
        type  : 'button',
        class : 'btn btn-primary',
        click : this.submit.bind(this)
      });
    }

    return (
      <div className="form-actions">
        <div className="btn-group" role="group">
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
            );
          })
        }
        </div>
      </div>
    );
  }

  renderItems() {
    const { items } = this.state;
    return (
      <div className="pinned-right">
        <ul className="list-group">
        {
          items.map((item, index) =>
            <li className="list-group-item" key={ index }>
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
          )
        }
        </ul>
      </div>
    );
  }

  render() {
    const { layout, lastDroppedItem } = this.state;

    return (
      <div className="view-layout">
        <ViewContainer
          key             = { 'container' }
          type            = { layout.type }
          category        = { layout.category }
          components      = { layout.components }
          accepts         = { layout.accepts }
          lastDroppedItem = { lastDroppedItem }
          onDrop          = { this.handleDrop.bind(this) }
        />
        { this.renderFormActions() }
        <div className="temp-foot">{ JSON.stringify(this.state.layout) }</div>
        { this.renderItems() }
      </div>
    );
  }
}