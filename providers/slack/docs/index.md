# Slack

 - [Introduction](#introduction)
 - [Setup](#setup)
 - [Message](#message)

## [Introduction](#introduction)

Provides a easy to use slack communication class targeting channel webhooks for sending messages.

## [Setup](#setup)

To send messages to your slack channel via the API create your environment configuration, go to your slack team and setup Integrations > Incoming WebHooks, then add a new integration agains the channel you wish to communicate with.

Sample configuration:

```js
module.exports = {
  slack : {
    channels : {
      foobar : 'slack_webhook_url'
    }
  }
}
```

## [Message](#message)

Once you have set up your configuration and created a incoming webhooks integration with your slack team you can start sending messages.

You can do that like so:

```js
let Slack = Bento.provider('slack');
let slack = new Slack('foobar');

yield slack.message({
  text        : 'Message Text',
  attachments : [
    {
      fallback : 'Message Text',
      color    : '#D00000',
      fields   : [
        {
          title : 'Some Title',
          value : 'Value of the field.',
          short : false
        }
      ]
    }
  ]
});
```

You can read up on how to create your messages at the following [link](https://api.slack.com/incoming-webhooks).