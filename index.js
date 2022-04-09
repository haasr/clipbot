const fs = require('fs');
const { Client, Intents } = require('discord.js');
const clipboardListener = require('clipboard-event');
const { clipboard } = require('electron');
const clipboardEx = require('electron-clipboard-ex');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

let DISCORD_CLIPBOT_TOKEN = process.env.DISCORD_CLIPBOT_TOKEN
let DISCORD_CLIPBOARD_CHANNEL_ID = process.env.DISCORD_CLIPBOARD_CHANNEL_ID

client.on('ready', () => {
    tag = client.user.tag;
    console.log('[ Starting client ]')
    console.log('> Logged in as ' + tag);
    client.user.setStatus('available') // Can be 'available', 'idle', 'dnd', or 'invisible'
    console.log(`> ${tag}'s status is set to available`);
});

client.on('messageCreate', msg => {
    if (msg.content.toLowerCase().startsWith('!clear')) {
        let lim = 99;
        try {
            x = msg.content.split(' ')[1].trim();
            lim = parseInt(x);
            (lim > 99) ? 99: lim;
        }
        catch {}
        async function del() {
            let fetched;
            if (lim == 0) { // Let 0 specify all messages.
                do {
                    fetched = await msg.channel.messages.fetch({limit: 20});
                    msg.channel.bulkDelete(fetched, true);
                }
                while(fetched.size >= 0);
            }
            else {
                msg.channel.bulkDelete(lim, true);
            }
        }
        del();
    }
})

clipboardListener.startListening();
clipboardListener.on('change', () => {
    let paths = clipboardEx.readFilePaths();
    client.channels.fetch(DISCORD_CLIPBOARD_CHANNEL_ID).then(chan => {
        try {
            if (paths.length > 0) {
                for (let i = 0; i < paths.length; i++) {
                    paths[i] = paths[i].replaceAll('\\', '/');
                }
                chan.send({ files: paths });
            }
            else if (clipboard.readText() != '')
                chan.send("\n" + clipboard.readText());
        }catch (e) {
            console.log(e);
        }
    });
});

client.login(DISCORD_CLIPBOT_TOKEN);