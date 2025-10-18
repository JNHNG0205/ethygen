// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./USDe.sol";
import "./sUSDe.sol";

/**
 * @title YieldEngine - Manages yield generation and distribution
 * @dev Handles staking USDe and distributing yield to sUSDe holders
 * In production, this would integrate with real yield sources like Aave, Compound, etc.
 */
contract YieldEngine is Ownable, ReentrancyGuard {
    // Token contracts
    USDe public immutable usde;
    sUSDe public immutable susde;
    
    // Yield sources (mock for now)
    struct YieldSource {
        string name;
        uint256 apy; // APY in basis points (850 = 8.5%)
        bool active;
        uint256 totalDeposited;
    }
    
    YieldSource[] public yieldSources;
    
    // Yield tracking
    uint256 public totalYieldGenerated;
    uint256 public lastYieldDistribution;
    uint256 public constant YIELD_DISTRIBUTION_INTERVAL = 1 days;
    
    // Events
    event YieldSourceAdded(string name, uint256 apy);
    event YieldDistributed(uint256 totalYield, uint256 timestamp);
    event USDeStaked(address indexed user, uint256 amount);
    event USDeUnstaked(address indexed user, uint256 amount);

    constructor(address _usde, address _susde) Ownable(msg.sender) {
        usde = USDe(_usde);
        susde = sUSDe(_susde);
        
        // Initialize mock yield sources
        yieldSources.push(YieldSource({
            name: "Aave USDC Lending",
            apy: 420, // 4.2%
            active: true,
            totalDeposited: 0
        }));
        
        yieldSources.push(YieldSource({
            name: "Compound USDC",
            apy: 380, // 3.8%
            active: true,
            totalDeposited: 0
        }));
        
        yieldSources.push(YieldSource({
            name: "Strategy Fee",
            apy: 50, // 0.5% fee
            active: true,
            totalDeposited: 0
        }));
        
        lastYieldDistribution = block.timestamp;
    }

    /**
     * @dev Add a new yield source (only owner)
     * @param name Name of the yield source
     * @param apy APY in basis points
     */
    function addYieldSource(string memory name, uint256 apy) external onlyOwner {
        yieldSources.push(YieldSource({
            name: name,
            apy: apy,
            active: true,
            totalDeposited: 0
        }));
        
        emit YieldSourceAdded(name, apy);
    }

    /**
     * @dev Toggle yield source active status (only owner)
     * @param sourceIndex Index of the yield source
     */
    function toggleYieldSource(uint256 sourceIndex) external onlyOwner {
        require(sourceIndex < yieldSources.length, "Invalid source index");
        yieldSources[sourceIndex].active = !yieldSources[sourceIndex].active;
    }

    /**
     * @dev Stake USDe for yield generation
     * @param amount Amount of USDe to stake
     */
    function stakeUSDe(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(usde.balanceOf(msg.sender) >= amount, "Insufficient USDe balance");
        
        // Transfer USDe from user
        usde.transferFrom(msg.sender, address(this), amount);
        
        // Distribute to yield sources (simplified - equal distribution)
        uint256 amountPerSource = amount / yieldSources.length;
        for (uint256 i = 0; i < yieldSources.length; i++) {
            if (yieldSources[i].active) {
                yieldSources[i].totalDeposited += amountPerSource;
            }
        }
        
        emit USDeStaked(msg.sender, amount);
    }

    /**
     * @dev Unstake USDe from yield generation
     * @param amount Amount of USDe to unstake
     */
    function unstakeUSDe(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(usde.balanceOf(address(this)) >= amount, "Insufficient staked USDe");
        
        // Remove from yield sources (simplified - equal distribution)
        uint256 amountPerSource = amount / yieldSources.length;
        for (uint256 i = 0; i < yieldSources.length; i++) {
            if (yieldSources[i].totalDeposited >= amountPerSource) {
                yieldSources[i].totalDeposited -= amountPerSource;
            }
        }
        
        // Transfer USDe back to user
        usde.transfer(msg.sender, amount);
        
        emit USDeUnstaked(msg.sender, amount);
    }

    /**
     * @dev Distribute yield to sUSDe holders
     * This function would be called periodically to distribute accrued yield
     */
    function distributeYield() external {
        require(block.timestamp >= lastYieldDistribution + YIELD_DISTRIBUTION_INTERVAL, "Too early to distribute");
        
        uint256 totalYield = calculateTotalYield();
        if (totalYield > 0) {
            // In a real implementation, this would update the sUSDe exchange rate
            // For now, we'll just track the total yield generated
            totalYieldGenerated += totalYield;
            lastYieldDistribution = block.timestamp;
            
            emit YieldDistributed(totalYield, block.timestamp);
        }
    }

    /**
     * @dev Calculate total yield generated since last distribution
     * @return totalYield Total yield amount
     */
    function calculateTotalYield() public view returns (uint256 totalYield) {
        uint256 timeElapsed = block.timestamp - lastYieldDistribution;
        
        for (uint256 i = 0; i < yieldSources.length; i++) {
            if (yieldSources[i].active && yieldSources[i].totalDeposited > 0) {
                // Calculate yield: (principal * apy * time) / (365 days * 10000)
                uint256 sourceYield = (yieldSources[i].totalDeposited * yieldSources[i].apy * timeElapsed) / 
                                     (365 days * 10000);
                totalYield += sourceYield;
            }
        }
        
        return totalYield;
    }

    /**
     * @dev Get current total APY across all active yield sources
     * @return totalAPY Total APY in basis points
     */
    function getTotalAPY() external view returns (uint256 totalAPY) {
        for (uint256 i = 0; i < yieldSources.length; i++) {
            if (yieldSources[i].active) {
                totalAPY += yieldSources[i].apy;
            }
        }
        return totalAPY;
    }

    /**
     * @dev Get yield source information
     * @param sourceIndex Index of the yield source
     * @return name Name of the yield source
     * @return apy APY in basis points
     * @return active Whether the source is active
     * @return totalDeposited Total amount deposited in this source
     */
    function getYieldSource(uint256 sourceIndex) external view returns (
        string memory name,
        uint256 apy,
        bool active,
        uint256 totalDeposited
    ) {
        require(sourceIndex < yieldSources.length, "Invalid source index");
        YieldSource memory source = yieldSources[sourceIndex];
        return (source.name, source.apy, source.active, source.totalDeposited);
    }

    /**
     * @dev Get total number of yield sources
     * @return count Number of yield sources
     */
    function getYieldSourceCount() external view returns (uint256 count) {
        return yieldSources.length;
    }

    /**
     * @dev Get total staked amount across all yield sources
     * @return totalStaked Total staked amount
     */
    function getTotalStaked() external view returns (uint256 totalStaked) {
        for (uint256 i = 0; i < yieldSources.length; i++) {
            totalStaked += yieldSources[i].totalDeposited;
        }
        return totalStaked;
    }
}
