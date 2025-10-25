const hre = require("hardhat");

async function main() {
  console.log("Deploying yUSDe and PerpDEX to Ethereum Sepolia...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Use the already deployed MockSUSDe address
  const mockSUSDeAddress = "0xA902ecec737Ee480c176e27cB4f01C6B8bb4F4d9";
  console.log("\n1. Using deployed MockSUSDe at:", mockSUSDeAddress);

  // Deploy MockYUSDe
  console.log("\n2. Deploying MockYUSDe...");
  const MockYUSDe = await hre.ethers.getContractFactory("MockYUSDe");
  const mockYUSDe = await MockYUSDe.deploy(mockSUSDeAddress);
  await mockYUSDe.waitForDeployment();
  const mockYUSDeAddress = await mockYUSDe.getAddress();
  console.log("MockYUSDe deployed to:", mockYUSDeAddress);

  // Deploy PerpDEX
  console.log("\n3. Deploying PerpDEX...");
  
  // Pyth Oracle on Ethereum Sepolia: 0xDd24F84d36BF92C65F92307595335bdFab5Bbd21
  const pythOracleAddress = "0xDd24F84d36BF92C65F92307595335bdFab5Bbd21";
  const minimumCollateral = hre.ethers.parseEther("10"); // 10 yUSDe minimum
  
  const PerpDEX = await hre.ethers.getContractFactory("PerpDEX");
  const perpDEX = await PerpDEX.deploy(
    mockYUSDeAddress,
    pythOracleAddress,
    minimumCollateral
  );
  await perpDEX.waitForDeployment();
  const perpDEXAddress = await perpDEX.getAddress();
  console.log("PerpDEX deployed to:", perpDEXAddress);

  // Grant MINTER_ROLE to PerpDEX on MockYUSDe
  console.log("\n4. Setting up permissions...");
  const MINTER_ROLE = await mockYUSDe.MINTER_ROLE();
  await mockYUSDe.grantRole(MINTER_ROLE, perpDEXAddress);
  console.log("Granted MINTER_ROLE to PerpDEX on MockYUSDe");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network: Ethereum Sepolia (Chain ID: 11155111)");
  console.log("Deployer:", deployer.address);
  console.log("\nDeployed Contracts:");
  console.log("- MockSUSDe (existing):", mockSUSDeAddress);
  console.log("- MockYUSDe:", mockYUSDeAddress);
  console.log("- PerpDEX:", perpDEXAddress);
  console.log("\nConfiguration:");
  console.log("- Pyth Oracle:", pythOracleAddress);
  console.log("- Minimum Collateral:", hre.ethers.formatEther(minimumCollateral), "yUSDe");
  console.log("- Mint Ratio: 0.8:1 (sUSDe → yUSDe)");
  console.log("- Max Leverage: 10x");
  console.log("=".repeat(60));

  // Wait for a few block confirmations before verifying
  console.log("\nWaiting for block confirmations...");
  await mockYUSDe.deploymentTransaction().wait(5);
  await perpDEX.deploymentTransaction().wait(5);

  // Verify contracts on Etherscan
  console.log("\nVerifying contracts on Etherscan...");
  
  try {
    console.log("\nVerifying MockYUSDe...");
    await hre.run("verify:verify", {
      address: mockYUSDeAddress,
      constructorArguments: [mockSUSDeAddress],
    });
  } catch (error) {
    console.log("MockYUSDe verification error:", error.message);
  }

  try {
    console.log("\nVerifying PerpDEX...");
    await hre.run("verify:verify", {
      address: perpDEXAddress,
      constructorArguments: [mockYUSDeAddress, pythOracleAddress, minimumCollateral],
    });
  } catch (error) {
    console.log("PerpDEX verification error:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("NEXT STEPS");
  console.log("=".repeat(60));
  console.log("1. Get sUSDe tokens from MockSUSDe:", mockSUSDeAddress);
  console.log("2. Approve MockYUSDe to spend your sUSDe");
  console.log("3. Mint yUSDe from sUSDe at 0.8:1 ratio");
  console.log("4. Approve PerpDEX to spend your yUSDe");
  console.log("5. Open perpetual positions with up to 10x leverage");
  console.log("\nPyth Price Feed IDs for Sepolia:");
  console.log("- ETH/USD: 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace");
  console.log("- BTC/USD: 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43");
  console.log("=".repeat(60));

  console.log("\nDeployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
