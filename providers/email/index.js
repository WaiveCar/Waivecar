'use strict';

let nodemailer        = require('nodemailer');
let mandrillTransport = require('nodemailer-mandrill-transport');
let mailgunTransport  = require('nodemailer-mailgun-transport');
let Template          = require('email-templates').EmailTemplate;
let path              = require('path');
let fs                = require('fs');
let error             = Bento.Error;

module.exports = class Email {

  constructor() {
    this.config    = Bento.config.email;
    this.templates = path.join(Bento.ROOT_PATH, this.config.templateFolder);
    switch (this.config.transportName) {
      case 'mailgun': {
        this.transporter = nodemailer.createTransport(mailgunTransport(this.config.transport));
        break;
      }
      default: {
        this.transporter = null;
        break;
      }
    }
  }

  *renderTemplate(templateName, context) {
    let templateLocation = path.join(this.templates, templateName);
    let template         = new Template(templateLocation);
    return yield (done) => {
      template.render(context, done);
    };
  }

  *send(email) {
    email._t = new Date();
    // This is an exceptionally magical mode
    // where all the mail gets funneled off to
    // a single email address and its actual 
    // destination gets set in the header.
    //
    // This is designed for diagnostics and
    // debugging. see #754.
    if(this.config.recipient) {
      email.subject += " DBG:" + email.to;
      email.to = this.config.recipient;
    }

    fs.appendFile('/var/log/outgoing/email.txt', JSON.stringify(email) + '\n', function(){});

    if (!this.transporter) {
      throw error.parse({
        code    : 'EMAIL_BAD_CONFIG',
        message : 'Invalid transport.'
      }, 400);
    }
    let content = yield this.renderTemplate(email.template, email.context);
    email.html  = content.html ? content.html.trim() : email.html.trim();
    email.text  = content.text ? context.text : email.text;
    return yield (done) => {
      this.transporter.sendMail(email, done);
    };
  }

};
