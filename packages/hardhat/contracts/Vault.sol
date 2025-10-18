// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./USDe.sol";
import "./sUSDe.sol";
import "./yUSDe.sol";

/**
 * @title Vault - Main vault contract for Ethygen
 * @dev Manages USDC → USDe conversion, staking, and margin token minting
 * This is the central hub for all user interactions with the platform
 */
contract Vault is Ownable, ReentrancyGuard, Pausable {
    // Token contracts
    USDe public immutable usde;
    sUSDe public immutable susde;
    yUSDe public immutable yusde;
    
    // External contracts (will be set after deployment)
    address public yieldEngine;
    address public marginTokenModule;
    address public perpDEX;
    
    // State variables
    mapping(address => uint256) public userUSDeBalance;
    mapping(address => uint256) public userStakedBalance;
    mapping(address => uint256) public userMarginBalance;
    
    uint256 public totalUSDeDeposited;
    uint256 public totalStaked;
    uint256 public totalMarginMinted;
    
    // Events
    event USDeDeposited(address indexed user, uint256 usdcAmount, uint256 usdeAmount);
    event USDeStaked(address indexed user, uint256 usdeAmount, uint256 susdeAmount);
    event USDeUnstaked(address indexed user, uint256 susdeAmount, uint256 usdeAmount);
    event MarginTokensMinted(address indexed user, uint256 susdeAmount, uint256 yusdeAmount);
    event MarginTokensRedeemed(address indexed user, uint256 yusdeAmount, uint256 susdeAmount);
    event ContractAddressUpdated(string contractType, address newAddress);

    constructor(address _usde, address _susde, address _yusde) Ownable(msg.sender) {
        usde = USDe(_usde);
        susde = sUSDe(_susde);
        yusde = yUSDe(_yusde);
    }

    /**
     * @dev Set external contract addresses (only owner)
     */
    function setContractAddresses(
        address _yieldEngine,
        address _marginTokenModule,
        address _perpDEX
    ) external onlyOwner {
        yieldEngine = _yieldEngine;
        marginTokenModule = _marginTokenModule;
        perpDEX = _perpDEX;
        
        emit ContractAddressUpdated("yieldEngine", _yieldEngine);
        emit ContractAddressUpdated("marginTokenModule", _marginTokenModule);
        emit ContractAddressUpdated("perpDEX", _perpDEX);
    }

    /**
     * @dev Deposit USDC and receive USDe (1:1 ratio)
     * In production, this would handle USDC → USDe conversion
     * For now, we'll mint USDe directly (simulating the conversion)
     * @param amount Amount of USDe to mint (simulating USDC deposit)
     */
    function depositUSDe(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        
        // In production: transfer USDC from user and mint USDe
        // For simulation: mint USDe directly
        usde.mint(msg.sender, amount);
        userUSDeBalance[msg.sender] += amount;
        totalUSDeDeposited += amount;
        
        emit USDeDeposited(msg.sender, amount, amount);
    }

    /**
     * @dev Stake USDe to receive sUSDe (yield-bearing tokens)
     * @param amount Amount of USDe to stake
     */
    function stakeUSDe(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(usde.balanceOf(msg.sender) >= amount, "Insufficient USDe balance");
        
        // Transfer USDe from user to vault
        usde.transferFrom(msg.sender, address(this), amount);
        
        // Mint sUSDe to user (1:1 ratio initially)
        susde.mint(msg.sender, amount);
        
        // Update balances
        userUSDeBalance[msg.sender] -= amount;
        userStakedBalance[msg.sender] += amount;
        totalStaked += amount;
        
        emit USDeStaked(msg.sender, amount, amount);
    }

    /**
     * @dev Unstake sUSDe to receive USDe (including accrued yield)
     * @param amount Amount of sUSDe to unstake
     */
    function unstakeUSDe(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(susde.balanceOf(msg.sender) >= amount, "Insufficient sUSDe balance");
        
        // Burn sUSDe from user
        susde.burn(msg.sender, amount);
        
        // Calculate USDe to return (includes yield)
        uint256 exchangeRate = susde.getExchangeRate();
        uint256 usdeToReturn = (amount * exchangeRate) / 1e18;
        
        // Transfer USDe to user (including yield)
        usde.transfer(msg.sender, usdeToReturn);
        
        // Update balances
        userStakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        
        emit USDeUnstaked(msg.sender, amount, usdeToReturn);
    }

    /**
     * @dev Convert sUSDe to yUSDe margin tokens (0.8:1 ratio)
     * @param amount Amount of sUSDe to convert
     */
    function mintMarginTokens(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(susde.balanceOf(msg.sender) >= amount, "Insufficient sUSDe balance");
        
        // Transfer sUSDe from user to vault
        susde.transferFrom(msg.sender, address(this), amount);
        
        // Mint yUSDe to user (0.8:1 ratio)
        uint256 yusdeAmount = yusde.mintFromStaked(msg.sender, amount);
        
        // Update balances
        userStakedBalance[msg.sender] -= amount;
        userMarginBalance[msg.sender] += yusdeAmount;
        totalMarginMinted += yusdeAmount;
        
        emit MarginTokensMinted(msg.sender, amount, yusdeAmount);
    }

    /**
     * @dev Convert yUSDe margin tokens back to sUSDe
     * @param amount Amount of yUSDe to convert
     */
    function redeemMarginTokens(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(yusde.balanceOf(msg.sender) >= amount, "Insufficient yUSDe balance");
        
        // Burn yUSDe from user
        uint256 susdeAmount = yusde.burnToStaked(msg.sender, amount);
        
        // Transfer sUSDe back to user
        susde.transfer(msg.sender, susdeAmount);
        
        // Update balances
        userMarginBalance[msg.sender] -= amount;
        userStakedBalance[msg.sender] += susdeAmount;
        totalMarginMinted -= amount;
        
        emit MarginTokensRedeemed(msg.sender, amount, susdeAmount);
    }

    /**
     * @dev Get user's total portfolio value in USDe
     * @param user User address
     * @return totalValue Total portfolio value
     */
    function getUserPortfolioValue(address user) external view returns (uint256 totalValue) {
        return userUSDeBalance[user] + userStakedBalance[user] + userMarginBalance[user];
    }

    /**
     * @dev Get user's staked balance with current yield
     * @param user User address
     * @return stakedValue Current value of staked position (including yield)
     */
    function getUserStakedValue(address user) external view returns (uint256 stakedValue) {
        if (userStakedBalance[user] == 0) return 0;
        
        uint256 exchangeRate = susde.getExchangeRate();
        return (userStakedBalance[user] * exchangeRate) / 1e18;
    }

    /**
     * @dev Emergency pause function (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause function (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
