// server/blaster.js
async function autoBlast(client, kontakList, pesan) {
  for (const kontak of kontakList) {
    await client.sendMessage(kontak.telepon + "@c.us", pesan);
  }
}

module.exports = autoBlast;
