const { Client, GatewayIntentBits } = require('discord.js')
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        // ...
    ]
})



client.once('ready', () => {
    console.log('Collins Content bot is Online!');
});







/* 
Put this ...
AT THE END !!!
*/

client.login('MTAzNDY5MTI0MTgxMzczNzUwMw.GwFMiX.qRrDW01WQH3bEgGVhLi6dDaQERcluBj42ZDCsI')

