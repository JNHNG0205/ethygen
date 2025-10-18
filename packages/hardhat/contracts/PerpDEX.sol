// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./yUSDe.sol";

/**
 * @title PerpDEX - Perpetual Trading Exchange
 * @dev Handles perpetual trading using yUSDe margin tokens
 * Integrates with Pyth for price feeds (mock implementation for now)
 */
contract PerpDEX is Ownable, ReentrancyGuard {
    // Token contract
    yUSDe public immutable yusde;
    
    // Position structure
    struct Position {
        address trader;
        string asset; // ETH, BTC, SOL, etc.
        bool isLong;
        uint256 size; // Position size in USD
        uint256 margin; // Margin amount in yUSDe
        uint256 leverage;
        uint256 entryPrice;
        uint256 timestamp;
        bool isActive;
    }
    
    // Price feeds (mock - would use Pyth in production)
    mapping(string => uint256) public assetPrices; // Asset symbol => price in USD (scaled by 1e8)
    
    // Positions tracking
    mapping(uint256 => Position) public positions;
    mapping(address => uint256[]) public userPositions;
    uint256 public nextPositionId = 1;
    
    // Risk management
    uint256 public constant MAX_LEVERAGE = 10; // 10x max leverage
    uint256 public constant LIQUIDATION_THRESHOLD = 8000; // 80% (8000 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    
    // Fees
    uint256 public constant TRADING_FEE = 10; // 0.1% (10 basis points)
    uint256 public constant FUNDING_FEE = 1; // 0.01% (1 basis point) per hour
    
    // Events
    event PositionOpened(
        uint256 indexed positionId,
        address indexed trader,
        string asset,
        bool isLong,
        uint256 size,
        uint256 margin,
        uint256 leverage,
        uint256 entryPrice
    );
    event PositionClosed(
        uint256 indexed positionId,
        address indexed trader,
        uint256 pnl,
        bool isProfit
    );
    event PositionLiquidated(
        uint256 indexed positionId,
        address indexed trader,
        uint256 loss
    );
    event PriceUpdated(string asset, uint256 price, uint256 timestamp);

    constructor(address _yusde) Ownable(msg.sender) {
        yusde = yUSDe(_yusde);
        
        // Initialize mock prices
        assetPrices["ETH"] = 245032000000; // $2,450.32 (scaled by 1e8)
        assetPrices["BTC"] = 4312015000000; // $43,120.15
        assetPrices["SOL"] = 9845000000; // $98.45
    }

    /**
     * @dev Update asset price (only owner - would be called by Pyth in production)
     * @param asset Asset symbol
     * @param price Price in USD (scaled by 1e8)
     */
    function updatePrice(string memory asset, uint256 price) external onlyOwner {
        assetPrices[asset] = price;
        emit PriceUpdated(asset, price, block.timestamp);
    }

    /**
     * @dev Open a perpetual position
     * @param asset Asset to trade (ETH, BTC, SOL, etc.)
     * @param isLong True for long position, false for short
     * @param margin Margin amount in yUSDe
     * @param leverage Leverage multiplier (1-10x)
     */
    function openPosition(
        string memory asset,
        bool isLong,
        uint256 margin,
        uint256 leverage
    ) external nonReentrant {
        require(margin > 0, "Margin must be greater than 0");
        require(leverage >= 1 && leverage <= MAX_LEVERAGE, "Invalid leverage");
        require(assetPrices[asset] > 0, "Asset not supported");
        require(yusde.balanceOf(msg.sender) >= margin, "Insufficient yUSDe balance");
        
        // Transfer margin from trader
        yusde.transferFrom(msg.sender, address(this), margin);
        
        // Calculate position size
        uint256 size = margin * leverage;
        
        // Get current price
        uint256 currentPrice = assetPrices[asset];
        
        // Create position
        Position memory newPosition = Position({
            trader: msg.sender,
            asset: asset,
            isLong: isLong,
            size: size,
            margin: margin,
            leverage: leverage,
            entryPrice: currentPrice,
            timestamp: block.timestamp,
            isActive: true
        });
        
        uint256 positionId = nextPositionId++;
        positions[positionId] = newPosition;
        userPositions[msg.sender].push(positionId);
        
        emit PositionOpened(positionId, msg.sender, asset, isLong, size, margin, leverage, currentPrice);
    }

    /**
     * @dev Close a position
     * @param positionId Position ID to close
     */
    function closePosition(uint256 positionId) external nonReentrant {
        Position storage position = positions[positionId];
        require(position.isActive, "Position not active");
        require(position.trader == msg.sender, "Not position owner");
        
        // Calculate PnL
        (uint256 pnl, bool isProfit) = calculatePnL(positionId);
        
        // Calculate total return (margin + pnl)
        uint256 totalReturn;
        if (isProfit) {
            totalReturn = position.margin + pnl;
        } else {
            // Loss cannot exceed margin
            totalReturn = position.margin > pnl ? position.margin - pnl : 0;
        }
        
        // Return funds to trader
        if (totalReturn > 0) {
            yusde.transfer(msg.sender, totalReturn);
        }
        
        // Mark position as closed
        position.isActive = false;
        
        emit PositionClosed(positionId, msg.sender, pnl, isProfit);
    }

    /**
     * @dev Liquidate a position
     * @param positionId Position ID to liquidate
     */
    function liquidatePosition(uint256 positionId) external {
        Position storage position = positions[positionId];
        require(position.isActive, "Position not active");
        
        // Check if position should be liquidated
        require(shouldLiquidate(positionId), "Position not eligible for liquidation");
        
        // Calculate loss (entire margin)
        uint256 loss = position.margin;
        
        // Mark position as closed
        position.isActive = false;
        
        emit PositionLiquidated(positionId, position.trader, loss);
    }

    /**
     * @dev Calculate PnL for a position
     * @param positionId Position ID
     * @return pnl PnL amount (positive for profit, negative for loss)
     * @return isProfit True if profitable
     */
    function calculatePnL(uint256 positionId) public view returns (uint256 pnl, bool isProfit) {
        Position memory position = positions[positionId];
        require(position.isActive, "Position not active");
        
        uint256 currentPrice = assetPrices[position.asset];
        uint256 priceChange;
        
        if (position.isLong) {
            // Long position: profit when price goes up
            if (currentPrice > position.entryPrice) {
                priceChange = currentPrice - position.entryPrice;
                pnl = (position.size * priceChange) / position.entryPrice;
                isProfit = true;
            } else {
                priceChange = position.entryPrice - currentPrice;
                pnl = (position.size * priceChange) / position.entryPrice;
                isProfit = false;
            }
        } else {
            // Short position: profit when price goes down
            if (currentPrice < position.entryPrice) {
                priceChange = position.entryPrice - currentPrice;
                pnl = (position.size * priceChange) / position.entryPrice;
                isProfit = true;
            } else {
                priceChange = currentPrice - position.entryPrice;
                pnl = (position.size * priceChange) / position.entryPrice;
                isProfit = false;
            }
        }
        
        return (pnl, isProfit);
    }

    /**
     * @dev Check if a position should be liquidated
     * @param positionId Position ID
     * @return shouldLiquidate True if position should be liquidated
     */
    function shouldLiquidate(uint256 positionId) public view returns (bool) {
        Position memory position = positions[positionId];
        if (!position.isActive) return false;
        
        (uint256 pnl, bool isProfit) = calculatePnL(positionId);
        
        if (isProfit) return false;
        
        // Check if loss exceeds liquidation threshold
        uint256 lossPercentage = (pnl * BASIS_POINTS) / position.margin;
        return lossPercentage >= LIQUIDATION_THRESHOLD;
    }

    /**
     * @dev Get user's active positions
     * @param user User address
     * @return activePositions Array of active position IDs
     */
    function getUserActivePositions(address user) external view returns (uint256[] memory activePositions) {
        uint256[] memory userPos = userPositions[user];
        uint256 activeCount = 0;
        
        // Count active positions
        for (uint256 i = 0; i < userPos.length; i++) {
            if (positions[userPos[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create array with active positions
        activePositions = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < userPos.length; i++) {
            if (positions[userPos[i]].isActive) {
                activePositions[index] = userPos[i];
                index++;
            }
        }
        
        return activePositions;
    }

    /**
     * @dev Get position details
     * @param positionId Position ID
     * @return position Position details
     */
    function getPosition(uint256 positionId) external view returns (Position memory position) {
        return positions[positionId];
    }

    /**
     * @dev Get current price for an asset
     * @param asset Asset symbol
     * @return price Price in USD (scaled by 1e8)
     */
    function getPrice(string memory asset) external view returns (uint256 price) {
        return assetPrices[asset];
    }
}
