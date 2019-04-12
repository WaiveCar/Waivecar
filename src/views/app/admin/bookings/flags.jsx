import React	from 'react';
import async	from 'async';
import { api } from 'bento';

module.exports = class BookingFlags extends React.Component {
	constructor(...args) {
		super(...args)
		this.state = {
			showingFlags : [],
			missingFlags : []
		}
	}

	flagSet(flag, state) {
		//if state if true then the flag is not active
		this.setState({'processing': true})
		api.put(`/bookings/${this.props.booking.id}/flags`, {[flag]: state}, (err, res) => {
			//"processing" is regarding the "delay" of the api call
			this.setState({'processing': false})

			var showingFlags = this.state.showingFlags
			var relevantFlags = this.state.missingFlags
			if (state) {
				showingFlags.push(flag);
				relevantFlags = relevantFlags.filter(row => row != flag);
			} else {
				relevantFlags.push(flag);
				showingFlags = showingFlags.filter(row => row != flag);
			}
			this.setState({
				showingFlags : showingFlags,
				missingFlags : relevantFlags
			})
		});
	}

	componentDidMount() {
		var notToShow = ["drove", "tikdStart", "tikdEnd", "try-end", "1hr45-warning", "first-sync",]
		var relevantFlags= ["rush"];
		var showingFlags = [];
		//Sorting through the flags of the booking prop
		Object.keys(this.props.booking.flags).map((flag, i) => {
			var relevantFlagString = false;
			relevantFlags.map((relevantFlag, i) => {
				if(relevantFlag == flag) {
					relevantFlagString = true;
					var index = relevantFlags.indexOf(flag);
					relevantFlags.splice(index,1)
				}
			})
			if (relevantFlagString) {
				showingFlags.push(flag);
			} else {
				var showBool = notToShow.every((str, index, array) => {
					return (str != flag);
				})
				if (showBool == true) {
					showingFlags.push(flag);
				}
			}

		})
		this.setState({showingFlags : showingFlags})
		this.setState({missingFlags : relevantFlags})
	}

	render () {
		return(
			<div className = "box">
				<h3>Flags {this.state.processing && <small style={{ display: "inline-block" }}>&#8987;  Working...</small>}</h3>
				<div className = "box-content flags">
				<br/>
					{this.state.showingFlags.map((flag,i) => {
						return (
							<button onClick={(e) => this.flagSet(flag,false)} key = {i} className = "btn btn-link flags-button">
									&#x2714; {flag}
								</button>
						)
					})}
					{this.state.missingFlags.map((flag,i) => {
						return (
								<button onClick={(e) => this.flagSet(flag,true)} key = {i} className = "btn btn-link flags-button not-active">
								 &#x2717; {flag}
								</button>
						)
					})}
				</div>
			</div>
		);
	}
}
