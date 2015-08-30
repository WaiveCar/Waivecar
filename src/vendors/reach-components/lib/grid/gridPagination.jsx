/*
   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
*/
var React = require('react');
var _ = require('lodash');

//needs props maxPage, currentPage, nextFunction, prevFunction
var GridPagination = React.createClass({
    getDefaultProps: function(){
        return{
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
    pageChange: function(event){
        this.props.setPage(parseInt(event.target.value, 10) -1);
    },

    render: function(){
        let prevClass = 'btn btn-icon';
        let nextClass = 'btn btn-icon';
        let prevIsDisabled = false;
        let nextIsDisabled = false;

        if (this.props.currentPage < 1) {
            prevClass += ' btn-disabled';
            prevIsDisabled = true;
        }

        if (this.props.currentPage === (this.props.maxPage -1)) {
            nextClass += ' btn-disabled';
            nextIsDisabled = true;
        }

        let prev = <button type="button" className={ prevClass } disabled={ prevIsDisabled } onClick={this.props.previous}>
                 <i className="material-icons">chevron_left</i>
               </button>

        let next = <button type="button" className={ nextClass } disabled={ nextIsDisabled } onClick={this.props.next}>
                 <i className="material-icons">chevron_right</i>
               </button>

        var leftStyle = null;
        var middleStyle = null;
        var rightStyle = null;

        if(this.props.useGriddleStyles === true){
            var baseStyle = {
                "float": "left",
                minHeight: "1px",
                marginTop: "5px"
            };

            rightStyle = _.extend({textAlign:"right", width: "34%"}, baseStyle);
            middleStyle = _.extend({textAlign:"center", width: "33%"}, baseStyle);
            leftStyle = _.extend({ width: "33%"}, baseStyle)
        }

        var options = [];

        for(var i = 1; i<= this.props.maxPage; i++){
            let className = 'btn btn-icon';
            if (i === this.props.currentPage + 1) {
                className += ' btn-primary';
            }
            options.push(<button className={ className } onClick={this.pageChange} value={i} key={i}>{i}</button>);
        }

        return (
            <div style={this.props.useGriddleStyles ? { minHeight: "35px" } : null }>
                <div className="griddle-page" style={middleStyle}>
                    { prev }
                    { options }
                    { next}
                </div>
            </div>
        )
    }
})

module.exports = GridPagination;
