// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { YieldEngine } from "./YieldEngine.sol";
import { YUSDe } from "./YUSDe.sol";

/**
 * @title Vault
 * @dev Main vault contract that manages USDe deposits and yUSDe minting
 * Handles the bridge between user deposits and yield generation
 */
contract Vault is Ownable, ReentrancyGuard {
    IERC20 public immutable usde;
    YieldEngine public immutable yieldEngine;
    YUSDe public immutable yusde;
    
    // Vault state
    mapping(address => uint256) public userDeposits;
    uint256 public totalDeposits;
    
    // Events
    event Deposited(address indexed user, uint256 usdeAmount, uint256 susdeAmount);
    event Withdrawn(address indexed user, uint256 susdeAmount, uint256 usdeAmount);
    event YUSDeMinted(address indexed user, uint256 susdeAmount, uint256 yusdeAmount);
    event YUSDeRedeemed(address indexed user, uint256 yusdeAmount, uint256 susdeAmount);
    
    constructor(
        address _usde,
        address _yieldEngine,
        address _yusde
    ) Ownable(msg.sender) {
        usde = IERC20(_usde);
        yieldEngine = YieldEngine(_yieldEngine);
        yusde = YUSDe(_yusde);
    }
    
    /**
     * @dev Deposit USDe and stake it in the yield engine
     * @param amount Amount of USDe to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(usde.balanceOf(msg.sender) >= amount, "Insufficient USDe balance");
        
        // Transfer USDe from user to this contract
        usde.transferFrom(msg.sender, address(this), amount);
        
        // Approve and stake in yield engine
        usde.approve(address(yieldEngine), amount);
        yieldEngine.stake(amount);
        
        // Update user deposits
        userDeposits[msg.sender] += amount;
        totalDeposits += amount;
        
        emit Deposited(msg.sender, amount, amount);
    }
    
    /**
     * @dev Withdraw USDe from the vault
     * @param amount Amount of sUSDe to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(userDeposits[msg.sender] >= amount, "Insufficient deposit balance");
        
        // Unstake from yield engine
        yieldEngine.unstake(amount);
        
        // Update user deposits
        userDeposits[msg.sender] -= amount;
        totalDeposits -= amount;
        
        // Transfer USDe + yield to user
        uint256 totalUsde = usde.balanceOf(address(this));
        usde.transfer(msg.sender, totalUsde);
        
        emit Withdrawn(msg.sender, amount, totalUsde);
    }
    
    /**
     * @dev Mint yUSDe tokens using sUSDe as collateral
     * @param susdeAmount Amount of sUSDe to use as collateral
     * @return yusdeAmount Amount of yUSDe minted
     */
    function mintYUSDe(uint256 susdeAmount) external nonReentrant returns (uint256) {
        require(susdeAmount > 0, "Amount must be greater than 0");
        require(yieldEngine.balanceOf(msg.sender) >= susdeAmount, "Insufficient sUSDe balance");
        
        // Transfer sUSDe from user to yUSDe contract
        yieldEngine.transferFrom(msg.sender, address(yusde), susdeAmount);
        
        // Mint yUSDe tokens
        uint256 yusdeAmount = yusde.mint(susdeAmount);
        
        emit YUSDeMinted(msg.sender, susdeAmount, yusdeAmount);
        return yusdeAmount;
    }
    
    /**
     * @dev Redeem yUSDe tokens to receive sUSDe
     * @param yusdeAmount Amount of yUSDe to redeem
     * @return susdeAmount Amount of sUSDe received
     */
    function redeemYUSDe(uint256 yusdeAmount) external nonReentrant returns (uint256) {
        require(yusdeAmount > 0, "Amount must be greater than 0");
        require(yusde.balanceOf(msg.sender) >= yusdeAmount, "Insufficient yUSDe balance");
        
        // Burn yUSDe and receive sUSDe
        uint256 susdeAmount = yusde.burn(yusdeAmount);
        
        // Transfer sUSDe back to user
        yieldEngine.transfer(msg.sender, susdeAmount);
        
        emit YUSDeRedeemed(msg.sender, yusdeAmount, susdeAmount);
        return susdeAmount;
    }
    
    /**
     * @dev Get user's total deposit balance
     * @param user User address
     * @return balance Total deposit balance
     */
    function getUserBalance(address user) external view returns (uint256) {
        return userDeposits[user];
    }
    
    /**
     * @dev Get user's sUSDe balance from yield engine
     * @param user User address
     * @return balance sUSDe balance
     */
    function getUserSUSDeBalance(address user) external view returns (uint256) {
        return yieldEngine.balanceOf(user);
    }
    
    /**
     * @dev Get user's yUSDe balance
     * @param user User address
     * @return balance yUSDe balance
     */
    function getUserYUSDeBalance(address user) external view returns (uint256) {
        return yusde.balanceOf(user);
    }
    
    /**
     * @dev Get user's yield from staking
     * @param user User address
     * @return yield Current yield amount
     */
    function getUserYield(address user) external view returns (uint256) {
        return yieldEngine.getUserYield(user);
    }
    
    /**
     * @dev Claim yield from staking
     */
    function claimYield() external nonReentrant {
        yieldEngine.claimYield();
    }
    
    /**
     * @dev Get total vault information
     * @return totalDeposits_ Total USDe deposited
     * @return totalStaked Total sUSDe staked
     * @return totalYUSDe Total yUSDe minted
     */
    function getVaultInfo() external view returns (
        uint256 totalDeposits_,
        uint256 totalStaked,
        uint256 totalYUSDe
    ) {
        totalDeposits_ = totalDeposits;
        totalStaked = yieldEngine.getTotalStaked();
        totalYUSDe = yusde.totalSupply();
    }
    
    /**
     * @dev Emergency function to withdraw USDe (only owner)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(usde.balanceOf(address(this)) >= amount, "Insufficient balance");
        usde.transfer(owner(), amount);
    }
}
