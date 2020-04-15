import React from 'react';

function WorkRedirect() {
  return (
    <div className="login">
      <div className="title">
        New Site For&nbsp;
        <span className="title-site">WaiveWork</span>
        <div className="message-success">
          We have built an all-new site for our WaiveWork users. It is found
          at <a href="https://waivework.com/login">waivework.com</a>. If you believe this 
          redirection to be in error, please contact customer service at {' '} 
          <a href="mailto:support@waive.com">support@waive.com</a>.
        </div>
      </div>
    </div>
  );
}

export default WorkRedirect;
