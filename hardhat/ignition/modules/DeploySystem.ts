import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeploySystemModule = buildModule("DeploySystem", (m) => {
  // USDe token
  const usde = m.contract("USDe", ["USDe", "USDe", 6]);
  
  // Deploy YieldEngine
  const yieldEngine = m.contract("YieldEngine", [usde]);
  
  // Deploy YUSDe margin token
  const yusde = m.contract("YUSDe", [yieldEngine]);
  
  // Deploy Vault
  const vault = m.contract("Vault", [usde, yieldEngine, yusde]);
  
  // Deploy PerpDEX
  const perpDex = m.contract("PerpDEX", [yusde]);
  
  // Set vault address in YUSDe
  m.call(yusde, "setVault", [vault]);
  
  return {
    usde,
    yieldEngine,
    yusde,
    vault,
    perpDex,
  };
});

export default DeploySystemModule;
