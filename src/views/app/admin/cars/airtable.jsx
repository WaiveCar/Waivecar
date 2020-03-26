import React, {Component} from 'react';

export default class Airtable extends Component {
  constructor(props) {
    super(props);
    this.state = {airtableData: null};
  }

  componentDidMount() {
    let {car} = this.props;
    this.setState({airtableData: JSON.parse(car.airtableData)});
  }

  render() {
    let {airtableData} = this.state;
    console.log(airtableData);
    return (
      <div className="box">
        <h3>Data From Airtable </h3>
        <div className="box-content">
          {airtableData ? (
            <div>
              {Object.keys(airtableData).map(key => (
                <div className="row">
                  {key}: {airtableData[key]}
                </div>
              ))}
            </div>
          ) : (
            <div>No Airtable Data Found</div>
          )}
        </div>
      </div>
    );
  }
}
