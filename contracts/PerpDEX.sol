// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PerpDEX - Perpetual Trading Engine
 * @notice Perpetual futures DEX with 10x leverage using yUSDe as collateral
 * @dev Uses Pyth Oracle for price feeds and manages long/short positions
 */
contract PerpDEX is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Constants
    bytes32 public constant LIQUIDATOR_ROLE = keccak256("LIQUIDATOR_ROLE");
    uint256 public constant MAX_LEVERAGE = 10;
    uint256 public constant MIN_LEVERAGE = 1;
    uint256 public constant LIQUIDATION_THRESHOLD = 5000; // 50% margin ratio
    uint256 public constant RATIO_DENOMINATOR = 10000;
    uint256 public constant PRICE_PRECISION = 1e8; // Pyth uses 8 decimals

    // State variables
    IERC20 public immutable yUSDe;
    address public pythOracle;
    uint256 public minimumCollateral;
    uint256 public positionCounter;

    // Position tracking
    struct Position {
        address trader;
        uint256 collateral; // yUSDe amount
        uint256 leverage; // 1-10x
        bool isLong; // true = long, false = short
        uint256 entryPrice; // Price at position open (8 decimals from Pyth)
        uint256 positionSize; // collateral * leverage
        uint256 timestamp;
        bytes32 priceFeedId; // Pyth price feed ID
        bool isActive;
    }

    // Mappings
    mapping(uint256 => Position) public positions;
    mapping(address => uint256[]) public traderPositions;
    
    // Funding rate tracking
    uint256 public lastFundingTimestamp;
    int256 public cumulativeFundingRate;
    uint256 public totalLongPositions;
    uint256 public totalShortPositions;

    // Events
    event PositionOpened(
        uint256 indexed positionId,
        address indexed trader,
        uint256 collateral,
        uint256 leverage,
        bool isLong,
        uint256 entryPrice,
        uint256 positionSize
    );
    
    event PositionClosed(
        uint256 indexed positionId,
        address indexed trader,
        int256 pnl,
        uint256 closingPrice
    );
    
    event Liquidated(
        uint256 indexed positionId,
        address indexed trader,
        address indexed liquidator,
        uint256 collateralSeized
    );
    
    event CollateralUpdated(
        uint256 indexed positionId,
        uint256 newCollateral,
        bool isAdd
    );
    
    event FundingRateUpdated(int256 fundingRate, uint256 timestamp);

    // Errors
    error ZeroAmount();
    error InvalidLeverage();
    error InsufficientCollateral();
    error PositionNotFound();
    error PositionNotActive();
    error Unauthorized();
    error NotLiquidatable();
    error InvalidAddress();
    error TransferFailed();

    /**
     * @notice Constructor
     * @param _yUSDe Address of yUSDe token
     * @param _pythOracle Address of Pyth Oracle contract
     * @param _minimumCollateral Minimum collateral required (in yUSDe)
     */
    constructor(
        address _yUSDe,
        address _pythOracle,
        uint256 _minimumCollateral
    ) {
        if (_yUSDe == address(0) || _pythOracle == address(0)) revert InvalidAddress();
        
        yUSDe = IERC20(_yUSDe);
        pythOracle = _pythOracle;
        minimumCollateral = _minimumCollateral;
        lastFundingTimestamp = block.timestamp;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(LIQUIDATOR_ROLE, msg.sender);
    }

    /**
     * @notice Open a new perpetual position
     * @param collateral Amount of yUSDe to use as collateral
     * @param leverage Leverage multiplier (1-10x)
     * @param isLong True for long position, false for short
     * @param priceFeedId Pyth price feed ID for the asset
     */
    function openPosition(
        uint256 collateral,
        uint256 leverage,
        bool isLong,
        bytes32 priceFeedId
    ) external nonReentrant returns (uint256 positionId) {
        if (collateral == 0) revert ZeroAmount();
        if (collateral < minimumCollateral) revert InsufficientCollateral();
        if (leverage < MIN_LEVERAGE || leverage > MAX_LEVERAGE) revert InvalidLeverage();

        // Get current price from Pyth Oracle (mock for now, replace with actual Pyth integration)
        uint256 currentPrice = _getPriceFromPyth(priceFeedId);

        // Calculate position size
        uint256 positionSize = collateral * leverage;

        // Transfer collateral from trader to contract
        yUSDe.safeTransferFrom(msg.sender, address(this), collateral);

        // Create position
        positionId = positionCounter++;
        positions[positionId] = Position({
            trader: msg.sender,
            collateral: collateral,
            leverage: leverage,
            isLong: isLong,
            entryPrice: currentPrice,
            positionSize: positionSize,
            timestamp: block.timestamp,
            priceFeedId: priceFeedId,
            isActive: true
        });

        // Track trader positions
        traderPositions[msg.sender].push(positionId);

        // Update global position tracking
        if (isLong) {
            totalLongPositions += positionSize;
        } else {
            totalShortPositions += positionSize;
        }

        emit PositionOpened(
            positionId,
            msg.sender,
            collateral,
            leverage,
            isLong,
            currentPrice,
            positionSize
        );

        return positionId;
    }

    /**
     * @notice Close an existing position
     * @param positionId ID of the position to close
     */
    function closePosition(uint256 positionId) external nonReentrant {
        Position storage position = positions[positionId];
        
        if (!position.isActive) revert PositionNotActive();
        if (position.trader != msg.sender) revert Unauthorized();

        // Get current price
        uint256 currentPrice = _getPriceFromPyth(position.priceFeedId);

        // Calculate P&L
        int256 pnl = _calculatePnL(positionId, currentPrice);

        // Mark position as closed
        position.isActive = false;

        // Update global position tracking
        if (position.isLong) {
            totalLongPositions = totalLongPositions > position.positionSize 
                ? totalLongPositions - position.positionSize 
                : 0;
        } else {
            totalShortPositions = totalShortPositions > position.positionSize 
                ? totalShortPositions - position.positionSize 
                : 0;
        }

        // Handle profit/loss
        if (pnl > 0) {
            // Profit: return collateral + profit
            uint256 totalReturn = position.collateral + uint256(pnl);
            yUSDe.safeTransfer(position.trader, totalReturn);
        } else if (pnl < 0) {
            // Loss: return collateral - loss (if any left)
            uint256 loss = uint256(-pnl);
            if (loss >= position.collateral) {
                // Total loss, no return
                // Collateral stays in contract as protocol revenue
            } else {
                uint256 remaining = position.collateral - loss;
                yUSDe.safeTransfer(position.trader, remaining);
            }
        } else {
            // No profit/loss: return collateral
            yUSDe.safeTransfer(position.trader, position.collateral);
        }

        emit PositionClosed(positionId, position.trader, pnl, currentPrice);
    }

    /**
     * @notice Liquidate an undercollateralized position
     * @param positionId ID of the position to liquidate
     */
    function liquidatePosition(uint256 positionId) external nonReentrant {
        Position storage position = positions[positionId];
        
        if (!position.isActive) revert PositionNotActive();

        // Get current price
        uint256 currentPrice = _getPriceFromPyth(position.priceFeedId);

        // Check if position is liquidatable
        if (!_isLiquidatable(positionId, currentPrice)) revert NotLiquidatable();

        // Mark position as closed
        position.isActive = false;

        // Update global position tracking
        if (position.isLong) {
            totalLongPositions = totalLongPositions > position.positionSize 
                ? totalLongPositions - position.positionSize 
                : 0;
        } else {
            totalShortPositions = totalShortPositions > position.positionSize 
                ? totalShortPositions - position.positionSize 
                : 0;
        }

        // Liquidation: collateral goes to liquidator (can be modified for partial rewards)
        uint256 liquidatorReward = (position.collateral * 500) / RATIO_DENOMINATOR; // 5% reward
        uint256 protocolFee = position.collateral - liquidatorReward;

        yUSDe.safeTransfer(msg.sender, liquidatorReward);
        // Protocol fee stays in contract

        emit Liquidated(positionId, position.trader, msg.sender, position.collateral);
    }

    /**
     * @notice Add or remove collateral from an active position
     * @param positionId ID of the position
     * @param amount Amount of yUSDe to add/remove
     * @param isAdd True to add collateral, false to remove
     */
    function updateCollateral(
        uint256 positionId,
        uint256 amount,
        bool isAdd
    ) external nonReentrant {
        Position storage position = positions[positionId];
        
        if (!position.isActive) revert PositionNotActive();
        if (position.trader != msg.sender) revert Unauthorized();
        if (amount == 0) revert ZeroAmount();

        if (isAdd) {
            // Add collateral
            yUSDe.safeTransferFrom(msg.sender, address(this), amount);
            position.collateral += amount;
        } else {
            // Remove collateral
            if (amount > position.collateral) revert InsufficientCollateral();
            
            uint256 newCollateral = position.collateral - amount;
            
            // Ensure new collateral meets minimum requirements
            if (newCollateral < minimumCollateral) revert InsufficientCollateral();
            
            // Check that position won't be liquidatable after removal
            uint256 currentPrice = _getPriceFromPyth(position.priceFeedId);
            int256 pnl = _calculatePnL(positionId, currentPrice);
            
            int256 newValue = int256(newCollateral) + pnl;
            uint256 marginRatio = newValue > 0 
                ? (uint256(newValue) * RATIO_DENOMINATOR) / position.positionSize 
                : 0;
            
            if (marginRatio < LIQUIDATION_THRESHOLD) revert InsufficientCollateral();
            
            position.collateral = newCollateral;
            yUSDe.safeTransfer(msg.sender, amount);
        }

        emit CollateralUpdated(positionId, position.collateral, isAdd);
    }

    /**
     * @notice Get the current value of a position
     * @param positionId ID of the position
     * @return currentValue Current value of the position in yUSDe
     */
    function getPositionValue(uint256 positionId) public view returns (int256 currentValue) {
        Position memory position = positions[positionId];
        
        if (!position.isActive) return 0;

        uint256 currentPrice = _getPriceFromPyth(position.priceFeedId);
        int256 pnl = _calculatePnL(positionId, currentPrice);
        
        currentValue = int256(position.collateral) + pnl;
    }

    /**
     * @notice Calculate P&L for a position
     * @param positionId ID of the position
     * @param currentPrice Current price from oracle
     * @return pnl Profit/loss amount (positive = profit, negative = loss)
     */
    function _calculatePnL(uint256 positionId, uint256 currentPrice) internal view returns (int256 pnl) {
        Position memory position = positions[positionId];

        int256 priceDelta;
        
        if (position.isLong) {
            // Long: profit when price goes up
            priceDelta = int256(currentPrice) - int256(position.entryPrice);
        } else {
            // Short: profit when price goes down
            priceDelta = int256(position.entryPrice) - int256(currentPrice);
        }

        // P&L = (price delta / entry price) * position size
        // Using int256 to handle negative values
        pnl = (priceDelta * int256(position.positionSize)) / int256(position.entryPrice);
    }

    /**
     * @notice Check if a position is liquidatable
     * @param positionId ID of the position
     * @param currentPrice Current price from oracle
     * @return isLiquidatable True if position can be liquidated
     */
    function _isLiquidatable(uint256 positionId, uint256 currentPrice) internal view returns (bool) {
        Position memory position = positions[positionId];
        
        if (!position.isActive) return false;

        int256 pnl = _calculatePnL(positionId, currentPrice);
        int256 currentValue = int256(position.collateral) + pnl;

        // Position is liquidatable if current value is less than 50% of position size
        if (currentValue <= 0) return true;
        
        uint256 marginRatio = (uint256(currentValue) * RATIO_DENOMINATOR) / position.positionSize;
        
        return marginRatio < LIQUIDATION_THRESHOLD;
    }

    /**
     * @notice Accumulate funding rate (simple implementation)
     * @dev Rewards long holders if shorts > longs, and vice versa
     */
    function accumulateFundingRate() external {
        if (block.timestamp < lastFundingTimestamp + 1 hours) {
            return; // Only update once per hour
        }

        int256 fundingRate;
        
        if (totalLongPositions > totalShortPositions) {
            // More longs: longs pay shorts
            fundingRate = -int256((totalLongPositions - totalShortPositions) * 100 / totalLongPositions);
        } else if (totalShortPositions > totalLongPositions) {
            // More shorts: shorts pay longs
            fundingRate = int256((totalShortPositions - totalLongPositions) * 100 / totalShortPositions);
        }

        cumulativeFundingRate += fundingRate;
        lastFundingTimestamp = block.timestamp;

        emit FundingRateUpdated(fundingRate, block.timestamp);
    }

    /**
     * @notice Get price from Pyth Oracle
     * @dev This is a mock implementation - replace with actual Pyth integration
     * @param priceFeedId Pyth price feed ID
     * @return price Current price (8 decimals)
     */
    function _getPriceFromPyth(bytes32 priceFeedId) internal view returns (uint256 price) {
        // Mock implementation - returns a dummy price
        // In production, integrate with Pyth Oracle:
        // IPyth pyth = IPyth(pythOracle);
        // PythStructs.Price memory priceData = pyth.getPriceUnsafe(priceFeedId);
        // price = uint256(uint64(priceData.price));
        
        // For testing, return mock price based on feed ID
        if (priceFeedId == bytes32(uint256(1))) {
            return 2000 * PRICE_PRECISION; // ETH: $2000
        } else if (priceFeedId == bytes32(uint256(2))) {
            return 40000 * PRICE_PRECISION; // BTC: $40000
        }
        
        return 1 * PRICE_PRECISION; // Default: $1
    }

    /**
     * @notice Get all positions for a trader
     * @param trader Address of the trader
     * @return positionIds Array of position IDs
     */
    function getTraderPositions(address trader) external view returns (uint256[] memory) {
        return traderPositions[trader];
    }

    /**
     * @notice Get position details
     * @param positionId ID of the position
     * @return position Position struct
     */
    function getPosition(uint256 positionId) external view returns (Position memory) {
        return positions[positionId];
    }

    /**
     * @notice Update Pyth Oracle address (admin only)
     * @param newOracle New Pyth Oracle address
     */
    function updatePythOracle(address newOracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newOracle == address(0)) revert InvalidAddress();
        pythOracle = newOracle;
    }

    /**
     * @notice Update minimum collateral (admin only)
     * @param newMinimum New minimum collateral amount
     */
    function updateMinimumCollateral(uint256 newMinimum) external onlyRole(DEFAULT_ADMIN_ROLE) {
        minimumCollateral = newMinimum;
    }

    /**
     * @notice Emergency withdraw (admin only)
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token).safeTransfer(msg.sender, amount);
    }
}
