import React from 'react';

function Forbidden() {
  return (
    <div>
      <div className="box">
        <h3>
          Forbidden
          <small>This page has restricted access</small>
        </h3>
        <div className="box-content" style={{textAlign: 'center'}}>
          Your account does not have access to this page. If you believe this
          restriction to be in error, do not hesitate to contact us at{' '}
          <a href="mailto:support@waive.com">support@waive.com</a>.
        </div>
      </div>
    </div>
  );
}

export default Forbidden;
