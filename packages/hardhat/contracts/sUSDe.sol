// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title sUSDe - Staked USDe
 * @dev Yield-bearing token representing staked USDe positions
 * Users receive sUSDe when they stake USDe, and sUSDe accrues yield over time
 */
contract sUSDe is ERC20, Ownable {
    // Yield tracking
    uint256 public totalStaked; // Total USDe staked
    uint256 public totalYieldAccrued; // Total yield accrued
    uint256 public constant YIELD_RATE = 850; // 8.5% APY (850 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    
    // Last yield update timestamp
    uint256 public lastYieldUpdate;
    
    // Yield calculation precision
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    event YieldAccrued(uint256 amount, uint256 timestamp);
    event StakingUpdate(uint256 totalStaked, uint256 totalYieldAccrued);

    constructor() ERC20("Staked USDe", "sUSDe") Ownable(msg.sender) {
        lastYieldUpdate = block.timestamp;
    }

    /**
     * @dev Mint sUSDe tokens when USDe is staked (only owner - YieldEngine)
     * @param to Address to mint tokens to
     * @param amount Amount to mint (1:1 with USDe staked)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        totalStaked += amount;
        _updateYield();
        emit StakingUpdate(totalStaked, totalYieldAccrued);
    }

    /**
     * @dev Burn sUSDe tokens when unstaking (only owner - YieldEngine)
     * @param from Address to burn tokens from
     * @param amount Amount to burn
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
        totalStaked -= amount;
        _updateYield();
        emit StakingUpdate(totalStaked, totalYieldAccrued);
    }

    /**
     * @dev Update yield accrual based on time elapsed
     */
    function _updateYield() internal {
        if (totalStaked > 0 && block.timestamp > lastYieldUpdate) {
            uint256 timeElapsed = block.timestamp - lastYieldUpdate;
            uint256 yieldAccrued = (totalStaked * YIELD_RATE * timeElapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
            
            if (yieldAccrued > 0) {
                totalYieldAccrued += yieldAccrued;
                emit YieldAccrued(yieldAccrued, block.timestamp);
            }
        }
        lastYieldUpdate = block.timestamp;
    }

    /**
     * @dev Get current yield per token (includes accrued yield)
     * @return yieldPerToken Amount of yield per sUSDe token
     */
    function getYieldPerToken() external view returns (uint256 yieldPerToken) {
        if (totalSupply() == 0) return 0;
        
        uint256 currentYieldAccrued = totalYieldAccrued;
        if (totalStaked > 0 && block.timestamp > lastYieldUpdate) {
            uint256 timeElapsed = block.timestamp - lastYieldUpdate;
            uint256 additionalYield = (totalStaked * YIELD_RATE * timeElapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
            currentYieldAccrued += additionalYield;
        }
        
        return currentYieldAccrued;
    }

    /**
     * @dev Get exchange rate: how much USDe you get for 1 sUSDe
     * @return exchangeRate USDe amount per sUSDe (scaled by 1e18)
     */
    function getExchangeRate() external view returns (uint256 exchangeRate) {
        if (totalSupply() == 0) return 1e18; // 1:1 if no tokens minted
        
        uint256 totalYieldAccruedNow = totalYieldAccrued;
        if (totalStaked > 0 && block.timestamp > lastYieldUpdate) {
            uint256 timeElapsed = block.timestamp - lastYieldUpdate;
            uint256 additionalYield = (totalStaked * YIELD_RATE * timeElapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
            totalYieldAccruedNow += additionalYield;
        }
        
        // Exchange rate = (totalStaked + totalYield) / totalSupply
        return ((totalStaked + totalYieldAccruedNow) * 1e18) / totalSupply();
    }
}
