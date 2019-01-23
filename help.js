module.exports.getAllHelpEmbed = () => {
  const fieldList = []
  helpDescriptions.forEach(element => {
    fieldList.push({ name: element.usage, value: element.value })
  })

  return {
    color: 0xffffff,
    thumbnail: {
      url: 'https://imgur.com/7ROyWB4.png',
    },
    title: 'Team Commands',
    description: '[optional] <required>',
    fields: fieldList,
    footer: {
      icon_url: 'https://cdn.shopify.com/s/files/1/2351/3873/files/sneak-favicon_7a2ffde5-3653-4c4d-a14d-a2e94a2768d9_32x32.png?v=1540828357',
      text: 'For extra help, feel free to ask staff',
    },
  }
}

module.exports.getHelpMessage = (name) => {
  var result = null

  helpDescriptions.forEach(element => {
    if (element.name === name) {
      result = `**Name:** ${element.name}\n**Description:** ${element.value}\n**Usage:** ${element.usage}\n**Cooldown:** ${element.cooldown}`
    }
  })

  return result
}

const helpDescriptions = [
  { name: 'color',  usage: '!t color <color_id>', value: 'Set your team color', cooldown: '5 seconds' },
  { name: 'create', usage: '!t create <name>', value: 'Create a team',  cooldown: '10 seconds' },
  { name: 'description', usage: '!t description <description>', value: 'Set your team description',  cooldown: '5 seconds' },
  { name: 'disband', usage: '!t disband', value: 'Disband your team',  cooldown: '10 seconds' },
  { name: 'help', usage: '!t help [command]', value: 'List of all commands or description of a single command',  cooldown: '3 seconds' },
  { name: 'icon', usage: '!t icon', value: 'Attach your team icon via discord attachment (drag and drop)',  cooldown: '30 seconds' },
  { name: 'invite', usage: '!t invite <@players...>', value: 'Invite a player to your team',  cooldown: '3 seconds' },
  { name: 'kick', usage: '!t kick <@player>', value: '- Kick a player from your team', cooldown: '5 seconds'  },
  { name: 'leave', usage: '!t leave', value: '- Leave your current team', cooldown: '5 seconds'  },
  { name: 'leavepartner', usage: '!t leavepartner', value: '- Leave your current duo partner, this will delete your league wins and points', cooldown: '5 seconds'  },
  { name: 'partner', usage: '!t partner <@player>', value: '- Invite someone to be your partner', cooldown: '5 seconds'  },
  { name: 'prefix', usage: '!t prefix <prefix>', value: '- Set your teams prefix', cooldown: '3 seconds'  },
  { name: 'removeprefix', usage: '!t removeprefix', value: '- Remove your teams prefix', cooldown: '3 seconds'  },
  { name: 'rename', usage: '!t rename <name>', value: '- Rename your team', cooldown: '5 seconds'  },
  { name: 'setrole', usage: '!t setrole <@player>', value: '- Set the team role of a player', cooldown: '5 seconds'  },
  { name: 'submitduo', usage: '!t submitduo <server_id> <placement> <proof>', value: '- Submit your Duo match placement to be moderator approved', cooldown: '5 seconds'  },
  { name: 'submitsolo', usage: '!t submitsolo <server_id> <placement> <proof>', value: '- Submit your Solo match placement to be moderator approved', cooldown: '5 seconds'  },
  { name: 'submit', usage: '!t submit <server_id> <placement> <proof>', value: '- Submit your Squad match placement to be moderator approved', cooldown: '5 seconds'  },
  { name: 'uninvite', usage: '!t uninvite <@player>', value: '- Uninvite a player from your team', cooldown: '5 seconds'  },
]
