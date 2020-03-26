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
              <table>
                <thead>
                  <tr>
                    <th style={{width: '30%'}}>Property</th>
                    <th style={{width: '50%'}}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(airtableData).map((key, i) => (
                    <tr key={i}>
                      <td>{key}</td>
                      <td>
                        {typeof airtableData[key] !== 'object'
                          ? typeof airtableData[key] !== 'boolean'
                            ? airtableData[key]
                            : airtableData[key].toString()
                          : airtableData[key].join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>No Airtable Data Found</div>
          )}
        </div>
      </div>
    );
  }
}
