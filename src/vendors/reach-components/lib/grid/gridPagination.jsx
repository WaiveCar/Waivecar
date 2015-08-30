var React = require('react');
var _ = require('lodash');

var GridPagination = React.createClass({

  getDefaultProps : function(){
    return {
      "maxPage": 0,
      "nextText": "",
      "previousText": "",
      "currentPage": 0,
      "useGriddleStyles": true,
      "nextClassName": "griddle-next",
      "previousClassName": "griddle-previous",
      "nextIconComponent": null,
      "previousIconComponent": null
    }
  },

  pageChange : function(event){
    this.props.setPage(parseInt(event.target.value, 10) -1);
  },

  renderButton : function(type, action, icon, value) {
    let className  = 'btn btn-icon';
    let isDisabled = false;

    switch (type) {
      case 'first': {
        isDisabled = this.props.currentPage === 0;
        break;
      }
      case 'last' : {
        isDisabled = (this.props.currentPage + 1) === this.props.maxPage;
        break;
      }
      case 'prev' : {
        isDisabled = this.props.currentPage < 1;
        break;
      }
      case 'next' : {
        isDisabled = this.props.currentPage === (this.props.maxPage -1);
        break;
      }
    }

    icon = icon || 'more_horiz';
    if (isDisabled) className += ' btn-disabled';

    return (
      <button type="button" className={ className } disabled={ isDisabled } value={ value } onClick={ action }>
        <i className="material-icons">{ icon }</i>
      </button>
    );
  },

  render: function() {
    let options = [];

    for (var i = 1; i <= this.props.maxPage; i++) {
      let className = 'btn btn-icon';
      let min = 0;
      let max = 6;
      let current = this.props.currentPage + 1;

      if (current > 3) {
        min = current - 3;
        max = current + 3;
      }

      if (i === this.props.currentPage + 1) {
        className += ' btn-primary';
      }

      if (this.props.maxPage > 5) {
        if (i > min && i < max) {
          options.push(<button className={ className } onClick={this.pageChange} value={i} key={i}>{i}</button>);
        }
      } else {
          options.push(<button className={ className } onClick={this.pageChange} value={i} key={i}>{i}</button>);
      }
    }

    return (
      <div>
        <div className="griddle-page">
          { this.renderButton('first', this.pageChange, 'more_horiz', 1) }
          { this.renderButton('prev', this.props.previous, 'chevron_left') }
          { options }
          { this.renderButton('next', this.props.next, 'chevron_right') }
          { this.renderButton('last', this.pageChange, 'more_horiz', this.props.maxPage) }
        </div>
      </div>
    )
  }
});

module.exports = GridPagination;
