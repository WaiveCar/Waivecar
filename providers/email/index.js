'use strict';

let nodemailer        = require('nodemailer');
let mandrillTransport = require('nodemailer-mandrill-transport');
let Template          = require('email-templates').EmailTemplate;
let path              = require('path');

module.exports = class Email {

  constructor() {
    this.config    = Bento.config.email;
    this.templates = path.join(Bento.ROOT_PATH, this.config.templateFolder);
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
   * @param {String} templateName
   * @param {Object} context
   */
  *renderTemplate(templateName, context) {
    let templateLocation = path.join(this.templates, templateName);
    let template         = new Template(templateLocation);
    return yield (done) => {
      template.render(context, done);
    };
  }

  /**
   * Sends an Email based on a predefined Template
   * @param {Object} email
   */
  *send(email) {
    if (!this.transporter) {
      throw error.parse({
        code    : 'EMAIL_BAD_CONFIG',
        message : 'Invalid transport.'
      }, 400);
    }

    let content = yield this.renderTemplate(email.template, email.context);
    email.html  = content.html ? content.html : email.html;
    email.text  = content.text ? context.text : email.text;

    return yield (done) => {
      this.transporter.sendMail(email, done);
    };
  }

};
