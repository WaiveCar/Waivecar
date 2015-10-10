'use strict';

import React                             from 'react';
import { relay, api }                    from 'reach-react';
import { Grid }                          from 'reach-components';
import { Link }                          from 'react-router';
import { components, fields, resources } from 'reach-ui';

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
      relay.dispatch(this.resourceName(), {
        type : 'index',
        data : data
      });
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
   * @method getHeadings
   */
  getHeadings() {
    let headings = this.props.fields.map((field) => {
      return {
        displayName : field.label,
        columnName  : field.name
      };
    });

    let self = this;
    headings.push({
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

    return headings;
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

  /**
   * @method render
   */
  render() {
    return (
      <div id="table-component" className="component-container">
        { this.createButton() }
        <Grid
          useGriddleStyles = { false }
          resultsPerPage   = { 25 }
          results          = { this.state[this.props.resource] }
          showFilter       = { true }
          showSettings     = { true }
          columns          = { this.getColumns() }
          columnMetadata   = { this.getHeadings() }
        />
      </div>
    );
  }
}

// ### Register Component
export default {
  build : function() {
    return {
      name    : 'Table',
      type    : 'table',
      icon    : 'view_list',
      class   : UITable,
      options : [
        {
          label     : 'Resource',
          component : 'react-select',
          name      : 'resource',
          options   : resources.getSelectList(),
          helpText : 'Select resource for this table'
        },
        {
          label     : 'Fields',
          component : 'react-multi-select',
          name      : 'fields',
          helpText  : 'Select resource fields to appear in table',
          options   : {
            connector : 'resource',
            values    : fields.getSelectList()
          }
        },
        {
          name      : 'actions',
          label     : 'Actions',
          component : 'react-multi-select',
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
          helpText  : 'Select Actions'
        }
      ]
    };
  }
}