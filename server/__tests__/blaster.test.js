// server/__tests__/blaster.test.js
const autoBlast = require("../blaster");

const mockClient = {
  sendMessage: jest.fn().mockResolvedValue(true),
};

describe("Auto Blast", () => {
  beforeEach(() => {
    mockClient.sendMessage.mockClear(); // reset call count sebelum tiap test
  });

  it("should send messages to all contacts", async () => {
    const kontakList = [{ telepon: "0811111111" }, { telepon: "0822222222" }];
    const pesan = "Ini pesan massal";

    await autoBlast(mockClient, kontakList, pesan);

    expect(mockClient.sendMessage).toHaveBeenCalledTimes(2);
    expect(mockClient.sendMessage).toHaveBeenCalledWith(
      "0811111111@c.us",
      pesan
    );
    expect(mockClient.sendMessage).toHaveBeenCalledWith(
      "0822222222@c.us",
      pesan
    );
  });
});
