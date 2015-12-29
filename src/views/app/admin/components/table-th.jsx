import React from 'react';

module.exports = class ThSort extends React.Component {

  /**
   * Sorts the table list by the provided object field.
   * @param  {String} field
   * @return {Void}
   */
  sort(field) {
    let { key, order } = this.state.sort;
    this.setState({
      sort : {
        key   : field,
        order : () => {
          if (key !== field) {
            return 'DESC';
          }
          return order === 'DESC' ? 'ASC' : 'DESC'
        }()
      }
    });
  }

  /**
   * Returns sort state ui arrows.
   * @return {Object}
   */
  renderSortState() {
    if (this.props.sort) {
      return (
        <span>
          <div className="sort-spacer" />
          <i className="material-icons ASC">arrow_drop_up</i>
          <i className="material-icons DESC">arrow_drop_down</i>
        </span>
      );
    }
  }

  /**
   * Returns a table header that enables sort on .box tables.
   * @return {Object}
   */
  render() {
    let { value, className, style, sort, ctx } = this.props;
    return (
      <th id={ sort } className={ `${ className }${ sort ? ' sortable' : '' }` } style={ style } onClick={ this.sort.bind(ctx, sort) }>
        <span>{ value }</span>
        {
          this.renderSortState()
        }
      </th>
    );
  }

};
