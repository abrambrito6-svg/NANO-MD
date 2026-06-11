global.comandos.set("owner", {
  name: "owner",
  run: async (client, m) => {

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Owner
TEL;type=CELL;type=VOICE;waid=50252642025:50252642025
END:VCARD`

    await client.sendMessage(m.chat, {
      contacts: {
        displayName: "Owner",
        contacts: [{ vcard }]
      }
    })

  }
});
