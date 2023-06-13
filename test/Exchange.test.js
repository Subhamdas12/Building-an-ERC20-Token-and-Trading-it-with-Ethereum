const { ethers } = require("hardhat");
const { expect } = require("chai");
const converter = (n) => {
  return ethers.utils.parseEther(n.toString());
};
describe("Exchange", () => {
  let transactionResponse,
    transactionReceipt,
    exchange,
    token,
    user0,
    user1,
    user2;
  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token");
    const Exchange = await ethers.getContractFactory("Exchange");
    const accounts = await ethers.getSigners();
    user0 = accounts[0];
    user1 = accounts[1];
    user2 = accounts[2];
    token = await Token.connect(user0).deploy(
      "The Blockchain century",
      "TBC",
      500
    );
    exchange = await Exchange.connect(user0).deploy(1, token.address);
    token
      .connect(user0)
      .transfer(user0.address, exchange.address, converter(450));
  });
  describe("Deployments", () => {
    it("Tokens are transfered to the exchange contract or not", async () => {
      expect(await token.balanceOf(exchange.address)).to.equal(converter(450));
    });
    it("balance of user0 decreased to 50 ethers", async () => {
      expect(await token.balanceOf(user0.address)).to.equal(converter(50));
    });
  });
  describe("BuyToken", () => {
    describe("Success", () => {
      beforeEach(async () => {
        transactionResponse = await exchange
          .connect(user0)
          .buyToken(converter(2), { value: converter(2) });
        transactionReceipt = await transactionResponse.wait();
      });
      it("The balance of user0 increased by 2 tokens", async () => {
        expect(await token.balanceOf(user0.address)).to.equal(converter(52));
      });
      it("The purchase for the user0 increased", async () => {
        expect(await exchange.purchase(user0.address)).to.equal(converter(2));
      });
    });
    describe("Failure", () => {
      it("THe purchase wont be completed if the amount doesnot match", async () => {
        await expect(
          exchange.connect(user0).buyToken(converter(2), {
            value: converter(3),
          })
        ).to.be.revertedWith("Invalid amount");
      });
      it("When the contract doesnot have enough number of tokens for the user", async () => {
        await expect(
          exchange
            .connect(user0)
            .buyToken(converter(501), { value: converter(501) })
        ).to.be.revertedWith("We dont have that much amount");
      });
    });
  });
  describe("SellToken", () => {
    describe("Success", () => {
      beforeEach(async () => {
        transactionResponse = await exchange
          .connect(user0)
          .buyToken(converter(4), { value: converter(4) });
        transactionReceipt = await transactionResponse.wait();
        transactionResponse = await token
          .connect(user0)
          .approve(exchange.address, converter(3));
        transactionReceipt = await transactionResponse.wait();
        transactionResponse = await exchange
          .connect(user0)
          .sellToken(converter(3));
        transactionReceipt = await transactionResponse.wait();
      });
      it("The amount of token for user0 decreased or not", async () => {
        expect(await token.balanceOf(user0.address)).to.equal(converter(51));
      });
      it("The purchase amount will decrease", async () => {
        expect(await exchange.purchase(user0.address)).to.equal(converter(1));
      });
    });
    describe("Failure", () => {
      it("If the seller doesnot have enough tokens", async () => {
        await exchange
          .connect(user0)
          .buyToken(converter(4), { value: converter(4) });
        await expect(
          exchange.connect(user0).sellToken(converter(999999999))
        ).to.be.revertedWith("Insufficient balance");
      });
      it("If the contract doesnot have enough ethers", async () => {
        await exchange
          .connect(user0)
          .buyToken(converter(4), { value: converter(4) });
        await token.connect(user0).approve(exchange.address, converter(5));
        await expect(
          exchange.connect(user0).sellToken(converter(5))
        ).to.be.revertedWith("Insufficient purcahse");
      });
    });
  });
});
