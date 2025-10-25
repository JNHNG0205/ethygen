const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to Ethereum Sepolia...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy MockUSDe
  console.log("\n1. Deploying MockUSDe...");
  const MockUSDe = await hre.ethers.getContractFactory("MockUSDe");
  const mockUSDe = await MockUSDe.deploy();
  await mockUSDe.waitForDeployment();
  const usdeAddress = await mockUSDe.getAddress();
  console.log("MockUSDe deployed to:", usdeAddress);

  // Deploy MockSUSDe
  console.log("\n2. Deploying MockSUSDe...");
  const MockSUSDe = await hre.ethers.getContractFactory("MockSUSDe");
  const mockSUSDe = await MockSUSDe.deploy();
  await mockSUSDe.waitForDeployment();
  const susdeAddress = await mockSUSDe.getAddress();
  console.log("MockSUSDe deployed to:", susdeAddress);

  // For Ethereum Sepolia, use the actual USDC address
  // Ethereum Sepolia USDC: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
  const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  console.log("\n3. Using Ethereum Sepolia USDC at:", usdcAddress);

  // Deploy USDCVault
  console.log("\n4. Deploying USDCVault...");
  const USDCVault = await hre.ethers.getContractFactory("USDCVault");
  const usdcVault = await USDCVault.deploy(
    usdcAddress,
    usdeAddress,
    susdeAddress
  );
  await usdcVault.waitForDeployment();
  const vaultAddress = await usdcVault.getAddress();
  console.log("USDCVault deployed to:", vaultAddress);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network: Ethereum Sepolia (Chain ID: 11155111)");
  console.log("Deployer:", deployer.address);
  console.log("\nDeployed Contracts:");
  console.log("- MockUSDe:", usdeAddress);
  console.log("- MockSUSDe:", susdeAddress);
  console.log("- USDC (existing):", usdcAddress);
  console.log("- USDCVault:", vaultAddress);
  console.log("=".repeat(60));

  // Wait for a few block confirmations before verifying
  console.log("\nWaiting for block confirmations...");
  await mockUSDe.deploymentTransaction().wait(5);
  await mockSUSDe.deploymentTransaction().wait(5);
  await usdcVault.deploymentTransaction().wait(5);

  // Verify contracts on Etherscan
  console.log("\nVerifying contracts on Etherscan...");
  
  try {
    console.log("\nVerifying MockUSDe...");
    await hre.run("verify:verify", {
      address: usdeAddress,
      constructorArguments: [],
    });
  } catch (error) {
    console.log("MockUSDe verification error:", error.message);
  }

  try {
    console.log("\nVerifying MockSUSDe...");
    await hre.run("verify:verify", {
      address: susdeAddress,
      constructorArguments: [],
    });
  } catch (error) {
    console.log("MockSUSDe verification error:", error.message);
  }

  try {
    console.log("\nVerifying USDCVault...");
    await hre.run("verify:verify", {
      address: vaultAddress,
      constructorArguments: [usdcAddress, usdeAddress, susdeAddress],
    });
  } catch (error) {
    console.log("USDCVault verification error:", error.message);
  }

  console.log("\nDeployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
