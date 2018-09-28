import React, {component} from 'react';

const Stats = ({stats}) => {
  console.log('stats: ', stats);
  return (
    <div>
      {stats ? (
        <div className="box">
          <h3>
            Statistics
            <small>on this user's usage</small>
          </h3>
          <div className="box-content">
            <div>
              <label
                className="form-control-label"
                style={{color: '#666', fontWeight: 300}}>
                Total Rides: {stats.totalBookings}
              </label>
              <label
                className="form-control-label"
                style={{color: '#666', fontWeight: 300}}>
                Total Spent: ${stats.totalSpent}
              </label>
            </div>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => console.log('24 Hours')}>
              24 Hours
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => console.log('7 Days')}>
              7 Days
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => console.log('30 Days')}>
              30 Days
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => console.log('All Time')}>
              All Times
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Stats;
