// Discord.js bot
const logger = require('winston')
const db = require('./db')
const client = require('./bot').default

logger.remove(logger.transports.Console)
logger.add(new logger.transports.Console, {
  colorize: true,
})
logger.level = 'debug'

db.initialize(() => {
  client.login(process.env.BOT_TOKEN)
})
