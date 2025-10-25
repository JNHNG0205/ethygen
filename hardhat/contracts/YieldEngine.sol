// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title YieldEngine
 * @dev Manages USDe staking and sUSDe rewards
 * This contract handles the core yield generation mechanism
 */
contract YieldEngine is ERC20, Ownable, ReentrancyGuard {
    IERC20 public immutable usde;
    
    // Yield parameters
    uint256 public constant YIELD_RATE = 500; // 5% APY
    uint256 public constant FULL_RATE = 10000; // 100%
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    // Staking data
    mapping(address => uint256) public userStakedAmount;
    mapping(address => uint256) public userStakedTime;
    uint256 public totalStaked;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 yield);
    event YieldClaimed(address indexed user, uint256 yield);
    
    constructor(address _usde) ERC20("Staked USDe", "sUSDe") Ownable(msg.sender) {
        usde = IERC20(_usde);
    }
    
    /**
     * @dev Stake USDe tokens to receive sUSDe
     * @param amount Amount of USDe to stake
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(usde.balanceOf(msg.sender) >= amount, "Insufficient USDe balance");
        
        // Transfer USDe from user to this contract
        usde.transferFrom(msg.sender, address(this), amount);
        
        // Calculate yield for existing stake
        if (userStakedAmount[msg.sender] > 0) {
            _claimYield(msg.sender);
        }
        
        // Update staking data
        userStakedAmount[msg.sender] += amount;
        userStakedTime[msg.sender] = block.timestamp;
        totalStaked += amount;
        
        // Mint sUSDe tokens (1:1 ratio initially)
        _mint(msg.sender, amount);
        
        emit Staked(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Unstake sUSDe tokens to receive USDe + yield
     * @param amount Amount of sUSDe to unstake
     */
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient sUSDe balance");
        
        // Calculate yield
        uint256 yield = calculateYield(msg.sender, amount);
        uint256 totalUsde = amount + yield;
        
        // Burn sUSDe tokens
        _burn(msg.sender, amount);
        
        // Update staking data
        userStakedAmount[msg.sender] -= amount;
        totalStaked -= amount;
        
        // Transfer USDe + yield to user
        require(usde.balanceOf(address(this)) >= totalUsde, "Insufficient USDe in contract");
        usde.transfer(msg.sender, totalUsde);
        
        emit Unstaked(msg.sender, amount, yield);
    }
    
    /**
     * @dev Calculate yield for a user's stake
     * @param user User address
     * @param amount Amount to calculate yield for
     * @return yield Yield amount
     */
    function calculateYield(address user, uint256 amount) public view returns (uint256) {
        if (userStakedTime[user] == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - userStakedTime[user];
        uint256 yield = (amount * YIELD_RATE * timeElapsed) / (FULL_RATE * SECONDS_PER_YEAR);
        
        return yield;
    }
    
    /**
     * @dev Claim yield without unstaking
     */
    function claimYield() external nonReentrant {
        require(userStakedAmount[msg.sender] > 0, "No staked amount");
        
        uint256 yield = calculateYield(msg.sender, userStakedAmount[msg.sender]);
        require(yield > 0, "No yield to claim");
        
        // Update staking time to reset yield calculation
        userStakedTime[msg.sender] = block.timestamp;
        
        // Transfer yield to user
        require(usde.balanceOf(address(this)) >= yield, "Insufficient USDe for yield");
        usde.transfer(msg.sender, yield);
        
        emit YieldClaimed(msg.sender, yield);
    }
    
    /**
     * @dev Internal function to claim yield for a user
     * @param user User address
     */
    function _claimYield(address user) internal {
        if (userStakedTime[user] == 0) return;
        
        uint256 yield = calculateYield(user, userStakedAmount[user]);
        if (yield > 0) {
            userStakedTime[user] = block.timestamp;
            usde.transfer(user, yield);
            emit YieldClaimed(user, yield);
        }
    }
    
    /**
     * @dev Get user's total yield
     * @param user User address
     * @return yield Total yield amount
     */
    function getUserYield(address user) external view returns (uint256) {
        return calculateYield(user, userStakedAmount[user]);
    }
    
    /**
     * @dev Get user's staking info
     * @param user User address
     * @return stakedAmount Amount staked
     * @return stakedTime Time of last stake
     * @return yield Current yield
     */
    function getUserStakingInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 stakedTime,
        uint256 yield
    ) {
        stakedAmount = userStakedAmount[user];
        stakedTime = userStakedTime[user];
        yield = calculateYield(user, stakedAmount);
    }
    
    /**
     * @dev Get total staked amount
     * @return totalStakedAmount Total staked amount
     */
    function getTotalStaked() external view returns (uint256) {
        return totalStaked;
    }
}
