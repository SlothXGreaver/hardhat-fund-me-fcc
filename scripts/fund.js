const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log(`FundMe Contract is at: ${fundMe.address}`);
    console.log("Funding Contract, Please Wait...");
    const transactionResponse = await fundMe.fund({
        value: ethers.utils.parseEther("0.1"),
    });
    await transactionResponse.wait(1);
    console.log("Contract Funded!!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
