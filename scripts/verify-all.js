const hre = require("hardhat");

async function main() {
  console.log("Verifying all deployed contracts on Ethereum Sepolia...\n");

  // Contract addresses from deployment
  const contracts = {
    MockUSDe: {
      address: "0xdca94060C89d143a25b8da14DD1DECF35d78ddaA",
      constructorArgs: []
    },
    MockSUSDe: {
      address: "0xA902ecec737Ee480c176e27cB4f01C6B8bb4F4d9",
      constructorArgs: []
    },
    USDCVault: {
      address: "0x76f3580cb3914734Edc56441Df5a175125d5Ecf6",
      constructorArgs: [
        "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC (Sepolia testnet)
        "0xdca94060C89d143a25b8da14DD1DECF35d78ddaA", // MockUSDe
        "0xA902ecec737Ee480c176e27cB4f01C6B8bb4F4d9"  // MockSUSDe
      ]
    },
    MockYUSDe: {
      address: "0xC025554405A61a53C4dcf0cFFa133F540BBb1aB7",
      constructorArgs: [
        "0xA902ecec737Ee480c176e27cB4f01C6B8bb4F4d9" // MockSUSDe
      ]
    },
    PerpDEX: {
      address: "0x6181c3f389D205D6831aC0A402b913F4684Ed877",
      constructorArgs: [
        "0xC025554405A61a53C4dcf0cFFa133F540BBb1aB7", // MockYUSDe
        "0xDd24F84d36BF92C65F92307595335bdFab5Bbd21", // Pyth Oracle
        hre.ethers.parseEther("10") // Minimum collateral
      ]
    }
  };

  let successCount = 0;
  let failCount = 0;

  for (const [contractName, contractInfo] of Object.entries(contracts)) {
    console.log("=".repeat(60));
    console.log(`Verifying ${contractName}...`);
    console.log(`Address: ${contractInfo.address}`);
    
    try {
      await hre.run("verify:verify", {
        address: contractInfo.address,
        constructorArguments: contractInfo.constructorArgs,
      });
      
      console.log(`✅ ${contractName} verified successfully!`);
      successCount++;
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`✅ ${contractName} already verified!`);
        successCount++;
      } else {
        console.log(`❌ ${contractName} verification failed:`);
        console.log(error.message);
        failCount++;
      }
    }
    console.log();
  }

  console.log("=".repeat(60));
  console.log("VERIFICATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total contracts: ${Object.keys(contracts).length}`);
  console.log(`Successfully verified: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log("=".repeat(60));

  console.log("\nView verified contracts on Etherscan:");
  for (const [contractName, contractInfo] of Object.entries(contracts)) {
    console.log(`${contractName}: https://sepolia.etherscan.io/address/${contractInfo.address}#code`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
