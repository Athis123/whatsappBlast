// server/whatsapp-client.js
const { Client, LocalAuth } = require("whatsapp-web.js");

function createClient() {
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true },
  });

  client.initialize();

  return {
    sendMessage: (jid, message) => client.sendMessage(jid, message),
  };
}

module.exports = createClient;
