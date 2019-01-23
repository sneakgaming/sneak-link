const logger = require('winston')
const db = require('./db')

// Returns the Embed object for a message containing team info
module.exports.getTeamInformationEmbed = (msg, userID, client, callback) => {
  db.checkExists('teams', { members: userID }, (err, exists) => {
    if (err || !exists) {
      callback(new Error('You are not in a team. Use `!t create <name>` to create a team.'), null)
    }
    else if (exists) {
      db.findOne('teams', { members: userID }, (err, team) => {
        if (err) {
          callback(new Error('Could not leave team.'), null)
        } else {
          getTeamMembersString(client, team, (membersString) => {
            callback(null,  {
              color: 0xffffff,
              thumbnail: {
                url: 'https://imgur.com/7ROyWB4.png',
              },
              title: '⚐ Team Information ⚐',
              description: '',
              fields: [
                {
                  name: `Name: ${team.name}`,
                  value: team.description || 'No team description set.',
                },
                {
                  name: 'Members',
                  value: membersString,
                },
                {
                  name: 'Stats',
                  value: '• Points: 0\n• Wins: 0',
                },
              ],
              footer: {
                icon_url: 'https://cdn.shopify.com/s/files/1/2351/3873/files/sneak-favicon_7a2ffde5-3653-4c4d-a14d-a2e94a2768d9_32x32.png?v=1540828357',
                text: `Team Size: ${team.members.length}/6`,
              },
            })
          })
        }
      })
    }
  })
}

module.exports.invite = (msg, userID, client, inviteeID, callback) => {
  db.checkExists('teams', { members: inviteeID }, (err, exists) => {
    if (err || exists) {
      callback(new Error('The user you are trying to invite is already in a team.'), null)
    } else {
      db.checkExists('teams', { captain: userID }, (err, exists) => {
        if (err) {
          callback(new Error('Could not invite a member.'))
        } else if (!exists) {
          callback(new Error('You do not have permissions to invite a member.'))
        } else {
          db.findOne('teams', { members: userID }, (err, team) => {
            if (err) {
              callback(new Error('Could not invite to team.'), null)
            } else {
              db.findOneAndUpdate('teams', { captain: userID }, { '$push': { invitees: inviteeID } }, (err, result) => {
                if (err || !result) {
                  callback(new Error('Could not invite to team.'))
                } else if (result) {
                  client.fetchUser(inviteeID).then((invitee) => {
                    invitee.sendEmbed({
                      color: 0xffffff,
                      title: ':envelope: Team Invite',
                      description: `You have been invited to join **${team.name}**!\n\nReact to accept or deny this request.`,
                      footer: {
                        text: `Performed by @<${userID}>`,
                      },
                    })
                      .then((sentEmbed) => {
                        callback(null)

                        // SEND THE INVITE
                        sentEmbed.react('✅').then(() => sentEmbed.react('❌'))
                        const filter = (reaction, user) => {
                          return ['✅', '❌'].includes(reaction.emoji.name) && user.id === inviteeID
                        }

                        sentEmbed.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                          .then(collected => {
                            const reaction = collected.first()

                            if (reaction.emoji.name === '✅') {
                              // ACCEPTED
                              db.findOneAndUpdate('teams', { captain: userID }, { '$push': { members: inviteeID } }, (err, result) => {
                                if (err || !result) {
                                  invitee.send('Something went wrong.')
                                  client.fetchUser(userID).then(user => user.send(`Something went wrong with your invitation to ${invitee.username}.`))
                                } else {
                                  renameUser(msg, invitee, team.name, (err) => {
                                    if (err) {
                                      invitee.send('Something went wrong.')
                                      client.fetchUser(userID).then(user => user.send(`Something went wrong with your invitation to ${invitee.username}.`))
                                    }
                                    else {
                                      invitee.send('You have accepted the invitation.')
                                      client.fetchUser(userID).then(user => user.send(`${invitee.username} has accepted your invitation!`))
                                    }
                                  })
                                }
                              })
                            }
                            else {
                              // DECLINED
                              invitee.send('You have declihned the invitation.')
                              client.fetchUser(userID).then(user => user.send(`${invitee.username} has declined your invitation.`))
                            }
                          })
                          .catch(() => {
                            sentEmbed.reply(`Your invite to join ${team.name} has expired.`)
                            client.fetchUser(userID).then(user => user.send(`${invitee.username} failed to respond to your invitation.`))
                          })
                      })
                      .catch(() => callback(new Error('Could not send message to invited member.')))
                  })
                }
              })
            }
          })
        }
      })
    }
  })
}

module.exports.leave = (msg, client, userID, callback) => {
  db.checkExists('teams', { members: userID }, (err, exists) => {
    if (err) {
      callback(new Error('Could not leave team.'))
    } else if (!exists) {
      callback(new Error('You\'re not a team. Use `!t create` to create a team.'))
    } else {
      db.findOneAndUpdate('teams', { members: userID }, { '$pull': { members: userID } }, (err, result) => {
        if (err) {
          logger.error(err.message)
          callback(new Error('Could not leave team.'))
        } else if (result) {
          client.fetchUser(userID).then(user => {
            renameUser(msg, user, '', () => {
              db.deleteMany('teams', { 'members.0': { '$exists': false } }, () => {
                callback(null)
              })
            })
          })
        }
      })
    }
  })
}

module.exports.create = (msg, client, teamName, userID, callback) => {
  logger.info('Create Team')

  if (teamName === null) {
    callback(new Error('No team name provided.'))
  }

  // Check if a team exists with this name
  db.checkExists('teams', { name: teamName }, (err, exists) => {
    if (err) {
      callback(new Error('Could not create the team. Please try again later.'))
    }

    if (exists) {
      callback(new Error(`A team already exists with the name \`${teamName}\``))
    } else {
      // Check if user is member of existing team
      db.checkExists('teams', { members: userID }, (err, exists) => {
        if (err) {
          callback(new Error('Could not create the team. Please try again later.'))
        }

        if (exists) {
          callback(new Error('You\'re already in a team. Use `!t leave` to leave your current team.'))
        } else {
          db.insertDocument('teams', { name: teamName, captain: userID, members:[userID] }, ()=> {
            client.fetchUser(userID).then((user) => {
              renameUser(msg, user, teamName, () => {
                callback(null)
              })
            }).catch(err => callback(err))
          })
        }
      })
    }
  })
}

const renameUser = (msg, user, teamName, callback) => {
  const guildMember = msg.guild.members.get(user.id)

  if (teamName !== '') {
    guildMember.setNickname(`[${teamName}] ${user.username}`).then(()=>callback(null)).catch(err => { logger.error(err); callback(err) })
  } else {
    guildMember.setNickname(user.username.replace(/\[.*?\] /g, '')).then(()=>callback(null)).catch(err => { logger.error(err);  callback(err)})
  }
}

const getTeamMembersString = (client, team, callback) => {
  var teamMembersFetched = 0
  var teamMembers = []
  var membersString = ''

  for (let index = 0; index < team.members.length; index++) {
    const memberID = team.members[index]
    client.fetchUser(memberID)
      .then((member) => {
        teamMembers.push(member)

        // Captain should always be first in member list.
        if(member.id === team.captain) {
          membersString += `• Captain: ${member.username}\n`
        } else {
          membersString += `• Member: ${member.username}\n`
        }

        if (++teamMembersFetched === team.members.length) {
          callback(membersString)
        }
      })
  }
}
