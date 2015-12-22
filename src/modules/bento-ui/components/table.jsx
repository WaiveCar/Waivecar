import React          from 'react';
import { Link }       from 'react-router';
import { relay, api } from 'bento';
import { Grid }       from 'bento-web';
import components     from '../lib/components';
import fields         from '../lib/fields';
import resources      from '../lib/resources';
import moment         from 'moment';

class UITable extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    relay.subscribe(this, this.resourceName());
    this.tableActions = this.tableActions.bind(this);
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    let { index } = resources.get(this.resourceName());
    if (!index) {
      throw new Error(`Table component is missing ${ this.resourceName() }`);
    }
    api.get(index.uri, (error, data) => {
      if (error) {
        return console.log(error);
      }
      this[this.resourceName()].index(data);
    }.bind(this));
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    relay.unsubscribe(this, this.resourceName());
  }

  /**
   * Returns the current resource name.
   * @method resourceName
   * @return {String}
   */
  resourceName() {
    return this.props.resource;
  }

  /**
   * @method delete
   * @param  {Int} id
   */
  delete(id) {
    let resource = resources.get(this.resourceName());
    api.delete(resource.delete.uri.replace(':id', id), (error) => {
      if (error) {
        throw new Error(error);
      }
    });
  }

  /**
   * @method tableActions
   * @param  {Int} id
   */
  tableActions(id) {
    return (
      <div className="text-center">
        { this.getEditAction(id) }
        { this.getDeleteAction(id) }
      </div>
    );
  }

  /**
   * @method getEditAction
   * @param  {Number} id
   * @return {JSX}
   */
  getEditAction(id) {
    if (this.props.actions.indexOf('update') > -1) {
      return (
        <Link className="grid-action" to={ `/${ this.resourceName() }/${ id }` }>
          <i className="material-icons" role="edit">edit</i>
        </Link>
      );
    }
  }

  /**
   * @method getDeleteAction
   * @param  {Number} id
   * @return {JSX}
   */
  getDeleteAction(id) {
    if (this.props.actions.indexOf('delete') > -1) {
      return (
        <button className="grid-action danger" onClick={ this.delete.bind(this, id) }>
          <i className="material-icons" role="delete">delete</i>
        </button>
      );
    }
  }

  /**
   * @method getMetadata
   */
  getMetadata() {
    let list  = fields.get(this.props.resource);
    let fieldList = this.props.fields;
    let metadata = this.props.fields.map((value, index) => {
      if (list.hasOwnProperty(value)) {
        let field = list[value];
        let meta = {
          displayName : field.label,
          columnName  : field.name
        };
        if (field.type === 'date') {
          meta.cssClassName = 'table-col-lg';
          meta.customComponent = React.createClass({
            render : function() {
              let date = moment(this.props.data).format('h:mm.ss YY-MM-DD');
              return <span>{ date }</span>;
            }
          });
        } else if (field.component === 'checkbox') {
          meta.cssClassName = 'table-col-xs';
          meta.customComponent = React.createClass({
            render : function() {
              if (this.props.data === true) {
                return <span className="text-success"><i className="material-icons" role="true">check</i></span>;
              }

              return <span className="text-muted"><i className="material-icons" role="true">close</i></span>;
            }
          });
        }
        return meta;
      }
    });

    let self = this;
    metadata.push({
      name            : 'id',
      columnName      : 'actions',
      displayName     : 'Actions',
      locked          : true,
      visible         : true,
      customComponent : React.createClass({
        render : function() {
          return self.tableActions(this.props.rowData.id);
        }
      })
    });

    return metadata;
  }

  /**
   * @method getColumns
   */
  getColumns() {
    let columns = this.props.fields.map((field) => {
      return field;
    });
    columns.push('actions');
    return columns;
  }

  createButton() {
    if (this.props.actions.indexOf('create') > -1) {
      return (
        <Link className="btn btn-icon btn-primary command-primary-action" to={ `/${ this.resourceName() }/create` }>
          <i className="material-icons" role="edit">add</i>
        </Link>
      );
    }
  }

  renderListLinkItem(item, index) {
    let route = `/${ this.resourceName() }/${ item.id }`;
    let text = <span>{ item.id } <small className="pull-right">{ updated }</small></span>
    let updated = moment(item.updatedAt).format('hh:mm.ss');

    if (item.license) {
      text = <span>{ item.license } ({ item.id }) <small className="pull-right">{ updated }</small></span>
    }

    return (
      <Link key={ index } className="list-group-item" to={ route }>
        { text }
      </Link>
    );
  }

  /**
   * @method render
   */
  render() {
    return (
      <div id="table-component" className="component-container">
        { this.createButton() }
        <div className="hidden-md-down">
          <Grid
            useGriddleStyles = { false }
            resultsPerPage   = { 25 }
            results          = { this.state[this.props.resource] }
            showFilter       = { true }
            showSettings     = { true }
            columns          = { this.getColumns() }
            columnMetadata   = { this.getMetadata() }
          />
        </div>
        <div className="hidden-lg-up visible-md-down">
          <div className="list-group">
            {
              this.state[this.props.resource]
                ? this.state[this.props.resource].map(this.renderListLinkItem.bind(this))
                : <div className="list-group-item">Loading</div>
            }
          </div>
        </div>
      </div>
    );
  }
}

// ### Register Component
module.exports = {
  build : function() {
    return {
      name    : 'Table',
      type    : 'table',
      order   : 4,
      icon    : 'view_list',
      class   : UITable,
      options : [
        {
          label     : 'Resource',
          component : 'select',
          name      : 'resource',
          options   : resources.getSelectList(),
          helpText : 'Select resource for this table',
          required  : true
        },
        {
          label     : 'Fields',
          component : 'multi-select',
          name      : 'fields',
          helpText  : 'Select resource fields to appear in table',
          options   : {
            connector : 'resource',
            values    : fields.getSelectList()
          },
          required  : true
        },
        {
          name      : 'actions',
          label     : 'Actions',
          component : 'multi-select',
          options   : [
            {
              name : 'Create',
              value : 'create'
            },
            {
              name : 'Update',
              value : 'update'
            },
            {
              name : 'Delete',
              value : 'delete'
            }
          ],
          helpText  : 'Select Actions',
          required  : true
        }
      ]
    };
  }
}
