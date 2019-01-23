const logger = require('winston')
const teams = require('./teams')
const help = require('./help')

const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', () => {
  logger.info(`Logged in as ${client.user.tag}!`)
  client.user.setActivity('your commands', { type: 'LISTENING' })
})

client.on('guildMemberAdd', (member) => {
  member.addRole('520304426737598474').then().catch(err => logger.info(err))
})

client.on('message', msg => {
  const message = msg.content

  const user = msg.author.username
  const userID = msg.author.id

  if (message.substring(0, 2) === '!t') {
    var args = message.substring(3).split(' ')
    var cmd = args[0]

    args = args.splice(1)

    if (cmd === 'ping') {
      client.reply('Pong!')
    }
    else if (cmd === 'create') {
      const teamName = getArgument(args, 0)

      teams.create(msg, client, teamName, userID, (err) => {
        if (err) {
          msg.reply(`${err.message}`)
        } else {
          msg.reply(`You have created the team \`${teamName}!\``)
        }
      })
    }
    else if (cmd === 'leave') {
      teams.leave(msg, client, userID, (err) => {
        if (err) {
          msg.reply(`${err.message}`)
        } else {
          msg.reply('You have left your team.')
        }
      })
    }
    else if (cmd === 'info') {
      teams.getTeamInformationEmbed(msg, userID, client, (err, embedObj) => {
        if (err) {
          msg.reply(`${err.message}`)
        } else {
          msg.reply('', { embed: embedObj })
        }
      })
    }
    else if (cmd === 'invite') {
      const userToInvite = getArgument(args, 0)
      const inviteeID = userToInvite.replace(/[<@!>]/g, '')

      teams.invite(msg, userID, client, inviteeID, (err, embed) => {
        if (err) {
          msg.reply(`${err.message}`)
        } else {
          msg.reply('You have successfully invited a user.')
        }
      })
    }
    else if (cmd === 'help') {
      const singleCommand = getArgument(args, 0)

      if (singleCommand == null) {
        msg.channel.send('', { embed: help.getAllHelpEmbed() })
      }
      else {
        const helpResult = help.getHelpMessage(singleCommand)

        if (helpResult == null) {
          msg.reply(`No command found with name ${singleCommand}`)
        } else {
          msg.channel.send(helpResult)
        }

      }
    }
  }
})

const getArgument = (args, index) => {
  if (index >= args.length) {
    return null
  }

  return args[index]
}

module.exports.default = client
