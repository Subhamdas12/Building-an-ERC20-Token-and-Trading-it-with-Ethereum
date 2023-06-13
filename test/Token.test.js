const { expect } = require("chai");
const { ethers } = require("hardhat");
const converter = (n) => {
  return ethers.utils.parseEther(n.toString());
};
describe("Token", () => {
  let transactionResponse,
    transactionReceipt,
    token,
    user0,
    user1,
    user2,
    amount,
    nullAddress;
  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token");
    const accounts = await ethers.getSigners();
    user0 = accounts[0];
    user1 = accounts[1];
    user2 = accounts[2];
    token = await Token.connect(user0).deploy(
      "The Blockchain Century",
      "TBC",
      1000000
    );
    amount = converter(100);
    nullAddress = "0x0000000000000000000000000000000000000000";
  });
  describe("Deployments", () => {
    it("The name is same", async () => {
      expect(await token.getName()).to.equal("The Blockchain Century");
    });
    it("The symbol is same", async () => {
      expect(await token.getSymbol()).to.equal("TBC");
    });
    it("The total supply is same", async () => {
      expect(await token.getTotalSupply()).to.equal(converter(1000000));
    });
    it("The total supply increased the balance of the owner", async () => {
      expect(await token.balanceOf(user0.address)).to.equal(converter(1000000));
    });
  });
  describe("Transfer", () => {
    describe("Success", () => {
      beforeEach(async () => {
        transactionResponse = await token
          .connect(user0)
          .transfer(user0.address, user1.address, amount);
        transactionReceipt = await transactionResponse.wait();
      });
      it("The balance of user0 decreased", async () => {
        expect(await token.balanceOf(user0.address)).to.equal(
          converter(999900)
        );
      });
      it("The balance of user1 increased", async () => {
        expect(await token.balanceOf(user1.address)).to.equal(converter(100));
      });
      it("It emits a transfer event", async () => {
        const event = await transactionReceipt.events[0];
        expect(event.event).to.equal("Token__Transfer");
        const args = event.args;
        expect(args.from).to.equal(user0.address);
        expect(args.to).to.equal(user1.address);
        expect(args.value).to.equal(amount);
      });
    });
    describe("Failure", () => {
      it("If the amount is greater then the amount of the sender", async () => {
        await expect(
          token
            .connect(user0)
            .transfer(user0.address, user1.address, converter(10000000000000))
        ).to.be.revertedWith("Insufficient balance");
      });
    });
    it("Whether the receiver is a null address or not", async () => {
      await expect(
        token
          .connect(user0)
          .transfer(user0.address, nullAddress, converter(10000))
      ).to.be.revertedWith("Invalid address");
    });
  });
  describe("Approve", () => {
    describe("Success", () => {
      beforeEach(async () => {
        transactionResponse = await token
          .connect(user0)
          .approve(user1.address, amount);
        transactionReceipt = await transactionResponse.wait();
      });
      it("The approval is increased for user1 or not", async () => {
        expect(await token.allowance(user0.address, user1.address)).to.equal(
          amount
        );
      });
      it("It emits a apprve event", async () => {
        const event = await transactionReceipt.events[0];
        expect(event.event).to.equal("Token__Approval");
        const args = event.args;
        expect(args.owner).to.equal(user0.address);
        expect(args.spender).to.equal(user1.address);
        expect(args.value).to.equal(amount);
      });
    });
    describe("Failure", () => {
      it("The approval will not take place if the amount is greater then the amount of the owner", async () => {
        await expect(
          token.connect(user0).approve(user1.address, converter(10000000000000))
        ).to.be.revertedWith("Insufficient balance");
      });
      it("Whether the receiver is a null address or not", async () => {
        await expect(
          token.connect(user0).approve(nullAddress, amount)
        ).to.be.revertedWith("Invalid address");
      });
    });
  });
  describe("TranferFrom", () => {
    describe("Success", () => {
      beforeEach(async () => {
        transactionResponse = await token
          .connect(user0)
          .approve(user1.address, amount);
        transactionReceipt = await transactionResponse.wait();
        transactionResponse = await token
          .connect(user1)
          .transferFrom(user0.address, user2.address, amount);
        transactionReceipt = await transactionResponse.wait();
      });
      it("The balance of user0 decreased", async () => {
        expect(await token.balanceOf(user0.address)).to.equal(
          converter(999900)
        );
      });
      it("The balance of user1 increased", async () => {
        expect(await token.balanceOf(user2.address)).to.equal(converter(100));
      });
      it("It emits a transfer event", async () => {
        const event = await transactionReceipt.events[0];
        expect(event.event).to.equal("Token__Transfer");
        const args = event.args;
        expect(args.from).to.equal(user0.address);
        expect(args.to).to.equal(user2.address);
        expect(args.value).to.equal(amount);
      });
    });
    describe("Failure", () => {
      it("The transfer from will not work if the approval is not done", async () => {
        await expect(
          token
            .connect(user1)
            .transferFrom(user0.address, user2.address, amount)
        ).to.be.revertedWith("Insufficient allowance");
      });
      it("THe value of ethers in the owners balance is lesser then the amount willing to send", async () => {
        transactionResponse = await token
          .connect(user0)
          .approve(user1.address, amount);
        transactionReceipt = await transactionResponse.wait();
        await expect(
          token
            .connect(user1)
            .transferFrom(user0.address, user2.address, converter(10000000000))
        ).to.be.revertedWith("Insufficient balance");
      });
    });
  });
});
