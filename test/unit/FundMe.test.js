const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe;
          let deployer;
          let mockV3Aggregator;
          const sendValue = "1000000000000000000";
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("constructor", async function () {
              it("Test: Aggregator Addresses get set Correctly", async function () {
                  const response = await fundMe.priceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          describe("fund", async function () {
              it("Test: Transaction Fails if there's Not Enough Eth", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't send enough ETH!"
                  );
              });
              it("Test: Updates the 'Amount Funded' Data", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.addressToAmountFunded(deployer);
                  assert.equal(response.toString(), sendValue.toString());
              });
              it("Test: Adds Funders to the Array of Funders", async function () {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.funders(0);
                  assert.equal(funder, deployer);
              });
          });

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });

              it("Test: Withdraw Eth from a Single Funder", async function () {
                  //arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it("Test: Withdraw Eth from a Multiple Funders", async function () {
                  //1hr DEBUG for "Needs a signer to send transaction". SAME CODE: BUG???
                  //     const accounts = await ethers.getSigners();
                  const accounts = await ethers.getSigners();
                  //     for (i = 1; 1 < 6; i++) {
                  //         const fundMeConnectedContract = await fundMe.connect(
                  //             accounts[i]
                  //         );
                  //         await fundMeConnectedContract.fund({ value: sendValue });
                  //     }
                  for (i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  //     const startingFundMeBalance = await fundMe.provider.getBalance(
                  //         fundMe.address
                  //     );
                  //     const startingDeployerBalance = await fundMe.provider.getBalance(
                  //         deployer
                  //     );
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //     const transactionResponse = await fundMe.withdraw();
                  const transactionResponse = await fundMe.withdraw();
                  //     const transactionReceipt = await transactionResponse.wait();
                  const transactionReceipt = await transactionResponse.wait();
                  //     const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  //     const gasCost = gasUsed.mul(effectiveGasPrice);
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  //     const endingFundMeBalance = await fundMe.provider.getBalance(
                  //         fundMe.address
                  //     );
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  //     const endingDeployerBalance = await fundMe.provider.getBalance(
                  //         deployer
                  //     );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  assert.equal(endingFundMeBalance, 0); //THIS IS AN EXTRA LINE, BUT STILL PASSES
                  //     assert.equal(
                  //         startingFundMeBalance.add(startingDeployerBalance).toString(),
                  //         endingDeployerBalance.add(gasCost).toString()
                  //     );
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
                  //     await expect(fundMe.funders(0)).to.be.reverted;
                  await expect(fundMe.funders(0)).to.be.reverted;
                  //     for (i = 1; 1 < 6; i++) {
                  //         assert.equal(
                  //             await fundMe.addressToAmountFunded(accounts[i].address),
                  //             0
                  //         );
                  //     }
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              it("Test: Only Allows the Owner to Withdraw Funds", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner");
              });
          });
      });
