const chalk = require('chalk');
const gradient = require('gradient-string');
const selfbot = require('discord.js-selfbot-v13');
const fs = require('fs');

const config = require('./config.js');
const tokens = fs.readFileSync('tokens.txt', 'utf-8').toString().split('\n');

process.on('unhandledRejection', (reason, promise) => console.log(`${chalk.redBright('[ERROR]')} Unhandled rejection at ${promise}, reason: ${reason}`));
process.on('uncaughtException', (err, origin) => console.log(`${chalk.redBright('[ERROR]')} Uncaught exception: ${err} at ${origin}}`));

let joined = 0;
let failed = 0;

console.log(gradient.rainbow('Discord Token Joiner (+ booster)!'));
console.log(gradient.rainbow('   > Built by @uutu & updated by @iamthonk\n'));

async function join(token, tokens) {
  let client = config.captcha_api_key ? new selfbot.Client({
    captchaService: config.captcha_service.toLowerCase(),
    captchaKey: config.captcha_api_key,
    checkUpdate: false
  }) : new selfbot.Client({ checkUpdate: false });

  client.on('ready', async () => {
    console.log(chalk.green('Logged in as @') + gradient.cristal(client.user.username));

    await client.fetchInvite(config.inviteCode).then(async (invite) => {
      await invite.acceptInvite(true).then(async () => {
        console.log(chalk.greenBright(`${chalk.greenBright('[SUCCESS]')} Joined as @${gradient.passion(client.user.username)}`));
        joined++;

        if (client.token === tokens[tokens.length - 1]) {
          console.log(`${chalk.magentaBright('[INFO]')} Joined ${gradient.passion(joined)} servers and failed to join ${gradient.passion(failed)} servers}`);
          process.exit(0);
        };

        if (config.boost.enabled) {
          setTimeout(async () => {
            const allBoosts = await client.billing.fetchGuildBoosts();
            allBoosts.each(async (boost) => {
              await boost.unsubscribe().catch((err) => {});

              setTimeout(async () => {
                await boost.subscribe(config.boost.serverId);
                console.log(`${chalk.greenBright('[SUCCESS]')} Boosted Server as @${gradient.passion(client.user.username)}}`);
              }, 500);
            });

          }, config.boost.delay);
        };
      }).catch((err) => {
        console.log(`${chalk.redBright('[ERROR]')} Failed to join as @${gradient.cristal(client.user.username)}`);
        failed++;

        console.error(chalk.redBright(err));

        if (client.token === tokens[tokens.length - 1]) {
          console.log(`${chalk.magentaBright('[INFO]')} Joined ${gradient.passion(joined)} servers and failed to join ${gradient.passion(failed)} servers}`);
          process.exit(0);
        };
      });
    }).catch((err) => {
      console.error(err);
    });
  });

  client.login(token).catch(() => {
    console.log(`${chalk.redBright('[ERROR]')} Invalid token: ${gradient.instagram(token)}`);
    
    if (client.token === tokens[tokens.length - 1]) {
      console.log(`${chalk.magentaBright('[INFO]')} Joined ${gradient.passion(joined)} servers and failed to join ${gradient.passion(failed)} servers}`);
      process.exit(0);
    };
  });
}

(async () => {
  for (i in tokens) {
    await new Promise((resolve) => setTimeout(resolve, i * config.joinDelay));
    join(tokens[i]?.trim()?.replace('\r', '')?.replace('\n', ''), tokens);
  }
})();