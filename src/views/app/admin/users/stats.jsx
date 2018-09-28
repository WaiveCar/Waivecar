import React, {component} from 'react';

const Stats = ({stats}) => {
  console.log('stats: ', stats);
  return (
    <div>
      {stats ? (
        <div className="box">
          <h3>
            Stats
            <small>Statistics on this user's usage</small>
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
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Stats;
