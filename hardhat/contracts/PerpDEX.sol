// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { YUSDe } from "./YUSDe.sol";

/**
 * @title PerpDEX
 * @dev Perpetual DEX for margin trading using yUSDe as collateral
 * Integrates with Pyth price feeds for accurate pricing
 */
contract PerpDEX is Ownable, ReentrancyGuard {
    IERC20 public immutable yusde;
    
    // Position data
    struct Position {
        uint256 size;           // Position size
        uint256 entryPrice;     // Entry price
        uint256 collateral;     // Collateral amount
        bool isLong;           // Long or short position
        uint256 timestamp;     // Position timestamp
    }
    
    // User positions
    mapping(address => Position) public positions;
    mapping(address => bool) public hasPosition;
    
    // Trading parameters
    uint256 public constant LEVERAGE_MULTIPLIER = 10000; // 100% in basis points
    uint256 public constant MAX_LEVERAGE = 1000; // 10x leverage (1000 basis points)
    uint256 public constant LIQUIDATION_THRESHOLD = 8000; // 80% liquidation threshold
    
    // Price feed (mock for now - integrate with Pyth)
    mapping(string => uint256) public priceFeeds;
    
    // Events
    event PositionOpened(
        address indexed user,
        uint256 size,
        uint256 entryPrice,
        uint256 collateral,
        bool isLong
    );
    event PositionClosed(
        address indexed user,
        uint256 size,
        uint256 exitPrice,
        uint256 pnl
    );
    event PositionLiquidated(
        address indexed user,
        uint256 size,
        uint256 liquidationPrice
    );
    event PriceUpdated(string symbol, uint256 price);
    
    constructor(address _yusde) Ownable(msg.sender) {
        yusde = IERC20(_yusde);
    }
    
    /**
     * @dev Open a new position
     * @param size Position size
     * @param collateral Collateral amount in yUSDe
     * @param isLong Long or short position
     * @param symbol Trading symbol (e.g., "ETH/USD")
     */
    function openPosition(
        uint256 size,
        uint256 collateral,
        bool isLong,
        string memory symbol
    ) external nonReentrant {
        require(size > 0, "Size must be greater than 0");
        require(collateral > 0, "Collateral must be greater than 0");
        require(!hasPosition[msg.sender], "Position already exists");
        require(yusde.balanceOf(msg.sender) >= collateral, "Insufficient yUSDe balance");
        
        // Get current price
        uint256 currentPrice = priceFeeds[symbol];
        require(currentPrice > 0, "Price feed not available");
        
        // Calculate leverage
        uint256 leverage = (size * LEVERAGE_MULTIPLIER) / collateral;
        require(leverage <= MAX_LEVERAGE, "Leverage too high");
        
        // Transfer collateral from user
        yusde.transferFrom(msg.sender, address(this), collateral);
        
        // Create position
        positions[msg.sender] = Position({
            size: size,
            entryPrice: currentPrice,
            collateral: collateral,
            isLong: isLong,
            timestamp: block.timestamp
        });
        hasPosition[msg.sender] = true;
        
        emit PositionOpened(msg.sender, size, currentPrice, collateral, isLong);
    }
    
    /**
     * @dev Close an existing position
     * @param symbol Trading symbol
     */
    function closePosition(string memory symbol) external nonReentrant {
        require(hasPosition[msg.sender], "No position exists");
        
        Position memory position = positions[msg.sender];
        uint256 currentPrice = priceFeeds[symbol];
        require(currentPrice > 0, "Price feed not available");
        
        // Calculate PnL
        uint256 pnl = calculatePnL(position, currentPrice);
        uint256 totalValue = position.collateral + pnl;
        
        // Transfer total value back to user
        if (totalValue > 0) {
            yusde.transfer(msg.sender, totalValue);
        }
        
        // Clear position
        delete positions[msg.sender];
        hasPosition[msg.sender] = false;
        
        emit PositionClosed(msg.sender, position.size, currentPrice, pnl);
    }
    
    /**
     * @dev Liquidate a position
     * @param user User to liquidate
     * @param symbol Trading symbol
     */
    function liquidatePosition(address user, string memory symbol) external nonReentrant {
        require(hasPosition[user], "No position exists");
        
        Position memory position = positions[user];
        uint256 currentPrice = priceFeeds[symbol];
        require(currentPrice > 0, "Price feed not available");
        
        // Check if position should be liquidated
        require(shouldLiquidate(position, currentPrice), "Position not liquidatable");
        
        // Calculate liquidation value
        uint256 liquidationValue = (position.collateral * LIQUIDATION_THRESHOLD) / LEVERAGE_MULTIPLIER;
        
        // Transfer liquidation value to liquidator
        yusde.transfer(msg.sender, liquidationValue);
        
        // Clear position
        delete positions[user];
        hasPosition[user] = false;
        
        emit PositionLiquidated(user, position.size, currentPrice);
    }
    
    /**
     * @dev Calculate PnL for a position
     * @param position Position data
     * @param currentPrice Current price
     * @return pnl Profit or loss
     */
    function calculatePnL(Position memory position, uint256 currentPrice) public pure returns (uint256) {
        if (position.isLong) {
            // Long position: profit when price increases
            if (currentPrice > position.entryPrice) {
                return (position.size * (currentPrice - position.entryPrice)) / position.entryPrice;
            } else {
                return 0; // Loss is capped at collateral
            }
        } else {
            // Short position: profit when price decreases
            if (currentPrice < position.entryPrice) {
                return (position.size * (position.entryPrice - currentPrice)) / position.entryPrice;
            } else {
                return 0; // Loss is capped at collateral
            }
        }
    }
    
    /**
     * @dev Check if position should be liquidated
     * @param position Position data
     * @param currentPrice Current price
     * @return shouldLiquidate True if should be liquidated
     */
    function shouldLiquidate(Position memory position, uint256 currentPrice) public pure returns (bool) {
        uint256 pnl = calculatePnL(position, currentPrice);
        uint256 totalValue = position.collateral + pnl;
        uint256 liquidationThreshold = (position.collateral * LIQUIDATION_THRESHOLD) / LEVERAGE_MULTIPLIER;
        
        return totalValue < liquidationThreshold;
    }
    
    /**
     * @dev Update price feed (mock function - integrate with Pyth)
     * @param symbol Trading symbol
     * @param price New price
     */
    function updatePrice(string memory symbol, uint256 price) external onlyOwner {
        require(price > 0, "Price must be greater than 0");
        priceFeeds[symbol] = price;
        emit PriceUpdated(symbol, price);
    }
    
    /**
     * @dev Get position info for a user
     * @param user User address
     * @return position Position data
     */
    function getPosition(address user) external view returns (Position memory) {
        return positions[user];
    }
    
    /**
     * @dev Get position health (collateral ratio)
     * @param user User address
     * @param symbol Trading symbol
     * @return health Health ratio (in basis points)
     */
    function getPositionHealth(address user, string memory symbol) external view returns (uint256) {
        if (!hasPosition[user]) return 0;
        
        Position memory position = positions[user];
        uint256 currentPrice = priceFeeds[symbol];
        if (currentPrice == 0) return 0;
        
        uint256 pnl = calculatePnL(position, currentPrice);
        uint256 totalValue = position.collateral + pnl;
        
        return (totalValue * LEVERAGE_MULTIPLIER) / position.collateral;
    }
    
    /**
     * @dev Emergency function to withdraw yUSDe (only owner)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(yusde.balanceOf(address(this)) >= amount, "Insufficient balance");
        yusde.transfer(owner(), amount);
    }
}
