import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying Ethygen contracts...");

  // Deploy mock tokens first
  const usde = await deploy("USDe", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  const susde = await deploy("sUSDe", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  const yusde = await deploy("yUSDe", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Deploy Vault contract
  const vault = await deploy("Vault", {
    from: deployer,
    args: [usde.address, susde.address, yusde.address],
    log: true,
    autoMine: true,
  });

  // Deploy YieldEngine contract
  const yieldEngine = await deploy("YieldEngine", {
    from: deployer,
    args: [usde.address, susde.address],
    log: true,
    autoMine: true,
  });

  // Deploy PerpDEX contract
  const perpDEX = await deploy("PerpDEX", {
    from: deployer,
    args: [yusde.address],
    log: true,
    autoMine: true,
  });

  // Set contract addresses in Vault
  const vaultContract = await hre.ethers.getContractAt("Vault", vault.address);
  await vaultContract.setContractAddresses(
    yieldEngine.address,
    yusde.address, // Using yUSDe as margin token module for simplicity
    perpDEX.address
  );

  // Set ownership for tokens (Vault should be owner of tokens)
  const usdeContract = await hre.ethers.getContractAt("USDe", usde.address);
  await usdeContract.transferOwnership(vault.address);

  const susdeContract = await hre.ethers.getContractAt("sUSDe", susde.address);
  await susdeContract.transferOwnership(vault.address);

  const yusdeContract = await hre.ethers.getContractAt("yUSDe", yusde.address);
  await yusdeContract.transferOwnership(vault.address);

  console.log("Ethygen contracts deployed successfully!");
  console.log("USDe:", usde.address);
  console.log("sUSDe:", susde.address);
  console.log("yUSDe:", yusde.address);
  console.log("Vault:", vault.address);
  console.log("YieldEngine:", yieldEngine.address);
  console.log("PerpDEX:", perpDEX.address);
};

export default func;
func.tags = ["Ethygen"];
