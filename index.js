const fs = require('fs');
const { Client, Intents } = require('discord.js');
const clipboardListener = require('clipboard-event');
const { clipboard } = require('electron');
const clipboardEx = require('electron-clipboard-ex');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

let DISCORD_CLIPBOT_TOKEN = process.env.DISCORD_CLIPBOT_TOKEN
let DISCORD_CLIPBOARD_CHANNEL_ID = process.env.DISCORD_CLIPBOARD_CHANNEL_ID

process.on('unhandledRejection', p => {
});

client.on('ready', () => {
    tag = client.user.tag;
    console.log('[ Starting client ]')
    console.log('> Logged in as ' + tag);
    client.user.setStatus('available') // Can be 'available', 'idle', 'dnd', or 'invisible'
    console.log(`> ${tag}'s status is set to available`);
});

client.on("message", msg => {
    if (msg.content.toLowerCase() == '!clear') {
        async function wipe() {
            var msg_size = 100;
            while (msg_size == 100) {
                await msg.channel.bulkDelete(100)
            .then(messages => msg_size = messages.size)
            .catch(console.error);
            }
            msg.channel.send(`<@${msg.author.id}>\n> ${msg.content}`);
        }
        wipe()
    }
});

clipboardListener.startListening();
clipboardListener.on('change', () => {
    client.channels.fetch(DISCORD_CLIPBOARD_CHANNEL_ID).then(chan => {
        try {
            let paths = clipboardEx.readFilePaths();
            if (paths.length > 0) {
                let path = paths[(paths.length - 1)].replaceAll('\\', '/');
                chan.send({ files: [path] });
            }
            else
                chan.send("\n" + clipboard.readText());
        }catch (e) {
            console.log(e);
        }
    });
});

client.login(DISCORD_CLIPBOT_TOKEN);