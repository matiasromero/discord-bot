require('dotenv').config({
    path: __dirname + '/.env'
});
const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();

const app = require('./src');

client.login(process.env['TOKEN']).then(() => {
    client.on('message', mensaje => {

        if (mensaje.content.includes('m!')) {

            let args = [];
            let comando = mensaje.content.split('m!')[1];

            // SI EL STRING TIENE ESPACIOS
            if (/\s/.test(comando)) {

                args = comando.split(' '); // DIVIDIMOS EN ARRAYS POR ESPACIOS
                comando = args.shift(); // SACAMOS EL PRIMER ITEM QUE SERÍA EL COMANDO, LO DEMÁS SON LOS ARGUMENTOS QUE LE SIGUEN
            }

            if (comando.length > 1) {

                leerComando(comando, args, mensaje).then((res) => {

                }).catch((err) => {
                    mensaje.reply(err.message);
                });

            }
        }
    });

    client.on("ready", async () => {
        console.log("Men BOT by Matias Romero");
        console.log("Node Version: " + process.version);
        console.log("Discord.js Version: " + Discord.version);

        await client.user.setActivity((client.guilds.cache.size).toString() + " servers !help", {
            type: "PLAYING"
        });
    });

    client.on("guildCreate", async () => {
        await client.user.setActivity((client.guilds.cache.size).toString() + " servers !help", {
            type: "PLAYING"
        });
    });
}).catch(console.error);

async function leerComando(comando, args, mensaje) {

    if (mensaje.member.id !== client.user.id) {
        switch (comando) {
            case 'help':
                let msg = "m!<frase>: dice alguna frases randoms (Ej: c!popo)\n" +
                    "m!sonidos: Muestra los sonidos disponibles para reproducir";
                mensaje.reply(msg);
                break;
            case 'automatico':
                app.automatico.modoAutomatico(true, args, mensaje);
                break;
            case 'manual':
                app.automatico.modoAutomatico(false, args, mensaje);
                break;

            case 'sonidos':

                let audios = [];

                await fs.readdir('./audios/', (err, archivos) => {

                    archivos.forEach(archivo => {
                        audios.push(archivo.replace('.mp3', ''));
                    });

                    mensaje.reply("Todos los sonidos que hay para reproducir son: " + audios.join(' - '));
                });

                break;

                // case 'escuchar': app.escuchar.agregarEscucha(mensaje); break;

            default:

                const voiceChannel = mensaje.member.voice.channel;

                if (!voiceChannel) throw new Error('Men metete a un chanel para escucharme');
                if (!fs.existsSync('./audios/' + comando + '.mp3')) throw new Error('mmm ese comandovich no lo tengo');

                // SI ESTÁ EN MODO AUTOMÁTICO
                const automatico = app.data.automatico.get(mensaje.guild.id);
                if (automatico) throw new Error('El bot está en modo automático men, desactivalo con c!manual');

                try {
                    app.sonidos.agregarCola(comando, mensaje);
                } catch (err) {
                    throw new Error(err);
                }

                break;
        }
    }
}