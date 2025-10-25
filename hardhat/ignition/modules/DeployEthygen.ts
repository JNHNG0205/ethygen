import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EthygenModule = buildModule("EthygenModule", (m) => {
  // Deploy USDe first (needed by other contracts)
  const usde = m.contract("USDe", [
    "USDe",
    "USDe", 
    18
  ]);

  // Deploy YieldEngine (needs USDe address)
  const yieldEngine = m.contract("YieldEngine", [usde]);

  // Deploy YUSDe (needs sUSDe address, which is YieldEngine)
  const yusde = m.contract("YUSDe", [yieldEngine]);

  // Deploy Vault (needs USDe, YieldEngine, and YUSDe addresses)
  const vault = m.contract("Vault", [
    usde,
    yieldEngine,
    yusde
  ]);

  // Deploy PerpDEX (needs YUSDe address)
  const perpDEX = m.contract("PerpDEX", [yusde]);

  // Set vault address in YUSDe contract
  m.call(yusde, "setVault", [vault]);

  return {
    usde,
    yieldEngine,
    yusde,
    vault,
    perpDEX,
  };
});

export default EthygenModule;
