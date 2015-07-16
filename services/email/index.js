/**
  Email
  ========
  @author  Matt Ginty (c) 2015
  @license MIT
 */

'use strict';

// ### Dependencies

let nodemailer        = require('nodemailer');
let mandrillTransport = require('nodemailer-mandrill-transport');
let Template          = require('email-templates').EmailTemplate;
let path              = require('path');

// ### Module

module.exports = (function () {

  /**
   * @class Facebook
   */
  function Email() {
    this.config      = Reach.config.email;
    this.templates   = path.join(Reach.ROOT_PATH, this.config.templateFolder);

    switch (this.config.transportName) {
      case 'mandrill': {
        this.transporter = nodemailer.createTransport(mandrillTransport(this.config.transport));
        break;
      }
      default: {
        this.transporter = null;
        break;
      }
    }
  }

  /**
   * Render Email from Template
   * @method renderTemplate
   * @param {string} templateName
   * @param {object} context
   */
  Email.prototype.renderTemplate = function *(templateName, context) {
    let self             = this;
    let templateLocation = path.join(self.templates, templateName);
    let template         = new Template(templateLocation);

    return yield function(done) {
      template.render(context, done);
    }
  };

  /**
   * Sends an Email based on a predefined Template
   * @method send
   * @param {obejct} email
   */
  Email.prototype.send = function *(email) {
    let self = this;

    if (!self.transporter) {
      let error    = new Error('Invalid Transport');
      error.status = 400;
      error.code   = 'EMAIL_BAD_CONFIG'
      throw error;
    }

    let content = yield self.renderTemplate(email.template, email.context);
    email.html  = content.html ? content.html : email.html;
    email.text  = content.text ? context.text : email.text;

    return yield function(done) {
      self.transporter.sendMail(email, done);
    }
  };

  return Email;

})();
