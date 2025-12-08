// server/__mocks__/whatsapp-client.js
module.exports = {
  sendMessage: jest.fn().mockResolvedValue(true),
};
