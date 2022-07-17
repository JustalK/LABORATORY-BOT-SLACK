/**
* The endpoint of managing the slack event
* @module routes/slack
*/
'use strict'
const eventsApi = require('@slack/events-api')
const slackEvents = eventsApi.createEventAdapter(process.env.SIGNING_SECRET)
const { WebClient, LogLevel } = require('@slack/web-api')

const client = new WebClient(process.env.BOT_TOKEN, {
  logLevel: LogLevel.DEBUG
})

const writeMessageInChannel = async (event, text) => {
  return client.chat.postMessage({
    channel: event.channel,
    text
  })
}

slackEvents.on('message', async (event) => {
  if (!event.subtype && !event.bot_id) {
    if (event.text === '~nudge') {
      writeMessageInChannel(event, `No problem! I know where you are:\nchannel ID: ${event.channel}\n\nI dont have a nudge for you yet!`)
    } else {
      writeMessageInChannel(event, 'Wrong command!\n~nudge: For getting a message')
    }
  }
})

module.exports = slackEvents.expressMiddleware()
