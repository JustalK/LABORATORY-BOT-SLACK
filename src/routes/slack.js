const eventsApi = require('@slack/events-api')
const slackEvents = eventsApi.createEventAdapter(process.env.SIGNING_SECRET || '993adb4ac097aadcad8b304ab276d861')
const { WebClient, LogLevel } = require('@slack/web-api')

const client = new WebClient(process.env.BOT_TOKEN || 'xoxb-3230192996481-3802065341878-a23cOwV1W7sj3LlrkDCIMPE6', {
  logLevel: LogLevel.DEBUG
})

app.use('/', slackEvents.expressMiddleware())
slackEvents.on('message', async (event) => {
  console.log(event)
})
