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
		console.log("clicked flag: " + flag);
		if (state)
			console.log("Flag is going to be set to active")
		else console.log("Flag is going to be set to not active")
		this.setState({'processing': true})
		api.put(`/bookings/${this.props.booking.id}/flags`, {[flag]: state}, (err, res) => {
			console.log(res.flags)
			console.log("This state")
			console.log(this.state)
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

			console.log(showingFlags)
		//	console.log(missingFlags)
	//		debugger;
			this.setState({
				showingFlags : showingFlags,
				missingFlags : relevantFlags
			})
			//debugger;
			/*debugger;
			if(!state) {
				var pos = res.flags.indexOf(flag);
				var len = res.flags.length;
				var str = res.flags.slice(0,pos-1);
				str += res.flags.slice((pos+flag.length)+2,len);
				res.flags = str; + this.state.relevantFlags
			} else {
				console.log(res.flags)
				res.flags = res.flags.replace("]" , ",\""+flag+"\"]");
			}
			console.log(res.flags)
			console.log(res); */

		});
	}

	componentDidMount() {
		var notToShow = ["drove", "tikdStart", "tikdEnd", "try-end", "1hr45-warning", "first-sync",]
		var relevantFlags= ["rush"];
		var showingFlags = [];
		console.log("keys of bookingFlags: "  + Object.keys(this.props.booking.flags));
		console.log(Object.keys(this.props.booking.flags));
		//Sorting through the flags of the booking prop
		Object.keys(this.props.booking.flags).map((flag, i) => {
			var relevantFlagString = false;
			relevantFlags.map((relevantFlag, i) => {
				if(relevantFlag == flag) {
					relevantFlagString = true;
					console.log(typeof relevantFlags)
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
		//debugger;
		this.setState({showingFlags : showingFlags})
		this.setState({missingFlags : relevantFlags})

		console.log("showingFlags: " + showingFlags)
		console.log("showingFlags state")
		console.log(this.state.showingFlags)
		console.log("relevantFlags: " + relevantFlags)
		console.log("relevantFlags state")
		console.log(this.state.relevantFlags)

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
