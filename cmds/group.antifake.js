export default {

  command: ['antifake'],
  category: 'grupo',

  isAdmin: true,
  botAdmin: true,

  run: async (
    client,
    m,
    args,
    usedPrefix
  ) => {

    const chat =
      global.db.data.chats[m.chat]

    if (
      !('antifake' in chat)
    ) {

      chat.antifake = false
    }

    const type =
      args[0]?.toLowerCase()

    if (!type) {

      return m.reply(
`🩸 *ANTIFAKE*

Estado:
${
chat.antifake
? '✅ ON'
: '❌ OFF'
}

${usedPrefix}antifake on
${usedPrefix}antifake off

🥀 Permitidos:
50-59`
      )
    }

    if (type === 'on') {

      chat.antifake = true

      return m.reply(
        '🩸 Antifake activado.'
      )
    }

    if (type === 'off') {

      chat.antifake = false

      return m.reply(
        '🥀 Antifake desactivado.'
      )
    }
  }
}

export async function participantsUpdate(
  { id, participants, action },
  client
) {

  try {

    if (action !== 'add')
      return

    const chat =
      global.db.data.chats[id]

    if (!chat?.antifake)
      return

    for (const user of participants) {

      const number =
        user.split('@')[0]

      const allowed =
        /^(50|51|52|53|54|55|56|57|58|59)/.test(number)

      if (allowed)
        continue

      try {

        await client.sendMessage(

          id,

          {

            text:
`🚫 Intruso detectado:

@${number}

🥀 Kurumi eliminó al fake.`,

            mentions: [user]

          }
        )

        await client.groupParticipantsUpdate(

          id,

          [user],

          'remove'
        )

      } catch (e) {

        console.log(e)
      }
    }

  } catch (e) {

    console.log(e)
  }
}
