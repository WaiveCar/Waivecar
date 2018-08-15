import React, { Component } from 'react';

module.exports = class Job extends Component {
  render() {
    return (
      <div className='container'>
        <div className='row'>
          <div className="col-xs-12 col-md-8 col-md-push-2 faq">
          <h2 id="experienced-startup-developer">Experienced startup developer</h2>
          <p>Waivecar is a funded cash-flow positive startup in Santa Monica paying market rates with benefits looking for a full-time developer to join a small team.</p>
          <p>Send us one or more of the following you believe reliably represent you:</p>
          <ul>
          <li>resume</li>
          <li>github account</li>
          <li>hacker news/reddit account name</li>
          <li>portfolio or personal website</li>
          </ul>
          <p>Please feel free to apply if you have a lot of experience in programming and startups regardless of whether you’ve done the particular technologies we work with: javascript (react, angular, es6 harmony etc) and mobile (android, swift, etc).</p>
          <p>You should be able to be able to get to Santa Monica in a reasonable amount of time - although we are comfortable with offsite work.</p>
          <p>The most important thing for us is your process, character, and intuition with regard to software development.</p>
          <p>If you could include a cover letter talking about how you’d address this, that’d be great:</p>
          <blockquote>
          <p>Let’s say a non-technical person reports a problem and proposes a solution, what do you see as your job and list of priorities?</p>
          </blockquote>
          <p>Apply to chris@(domain this is on).</p>
          </div>
        </div>
      </div>
    );
  }
}
