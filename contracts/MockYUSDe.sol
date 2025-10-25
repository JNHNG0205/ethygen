// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MockYUSDe - Mock Yield Margin Token
 * @notice ERC-20 token representing margin collateral for perpetual trading
 * @dev MockYUSDe is minted from sUSDe at 0.8:1 ratio and continues earning yield from underlying staked assets
 */
contract MockYUSDe is ERC20, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Constants
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 public constant MINT_RATIO = 8000; // 0.8:1 ratio (80%)
    uint256 public constant RATIO_DENOMINATOR = 10000;

    // State variables
    IERC20 public immutable sUSDe;
    
    // Track sUSDe backing for each user
    mapping(address => uint256) public sUSDeBackingAmount;
    mapping(address => uint256) public lastYieldSyncTimestamp;
    
    // Total sUSDe held by this contract
    uint256 public totalSUSDeHeld;

    // Events
    event Minted(address indexed user, uint256 sUSDeAmount, uint256 yUSDeAmount);
    event Burned(address indexed user, uint256 yUSDeAmount, uint256 sUSDeAmount);
    event YieldRedeemed(address indexed user, uint256 yUSDeAmount, uint256 sUSDeAmount, uint256 yieldAmount);

    // Errors
    error ZeroAmount();
    error InsufficientBalance();
    error InsufficientBacking();
    error TransferFailed();

    /**
     * @notice Constructor
     * @param _sUSDe Address of the sUSDe token contract
     */
    constructor(address _sUSDe) ERC20("Mock Yield Margin USDe", "yUSDe") {
        require(_sUSDe != address(0), "Invalid sUSDe address");
        sUSDe = IERC20(_sUSDe);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @notice Mint yUSDe from sUSDe at 0.8:1 ratio
     * @dev Input 100 sUSDe → Output 80 yUSDe
     * @param amount Amount of sUSDe to convert
     */
    function mint(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        // Calculate yUSDe amount at 0.8:1 ratio
        uint256 yUSDeAmount = (amount * MINT_RATIO) / RATIO_DENOMINATOR;

        // Transfer sUSDe from user to this contract
        sUSDe.safeTransferFrom(msg.sender, address(this), amount);

        // Track backing amount for user
        sUSDeBackingAmount[msg.sender] += amount;
        lastYieldSyncTimestamp[msg.sender] = block.timestamp;
        totalSUSDeHeld += amount;

        // Mint yUSDe to user
        _mint(msg.sender, yUSDeAmount);

        emit Minted(msg.sender, amount, yUSDeAmount);
    }

    /**
     * @notice Burn yUSDe and redeem underlying sUSDe (without yield)
     * @param amount Amount of yUSDe to burn
     */
    function burn(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance();

        // Calculate sUSDe to return (reverse of mint ratio)
        uint256 sUSDeAmount = (amount * RATIO_DENOMINATOR) / MINT_RATIO;

        if (sUSDeBackingAmount[msg.sender] < sUSDeAmount) revert InsufficientBacking();

        // Update tracking
        sUSDeBackingAmount[msg.sender] -= sUSDeAmount;
        totalSUSDeHeld -= sUSDeAmount;

        // Burn yUSDe
        _burn(msg.sender, amount);

        // Transfer sUSDe back to user
        sUSDe.safeTransfer(msg.sender, sUSDeAmount);

        emit Burned(msg.sender, amount, sUSDeAmount);
    }

    /**
     * @notice Redeem yUSDe + accrued yield as sUSDe
     * @dev This calculates yield based on time held and returns sUSDe + yield
     * @param amount Amount of yUSDe to redeem
     */
    function redeemWithYield(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance();

        // Calculate base sUSDe to return
        uint256 baseSUSDeAmount = (amount * RATIO_DENOMINATOR) / MINT_RATIO;

        if (sUSDeBackingAmount[msg.sender] < baseSUSDeAmount) revert InsufficientBacking();

        // Calculate accrued yield (simple time-based yield calculation)
        // Assuming 5% APY on sUSDe backing
        uint256 timeElapsed = block.timestamp - lastYieldSyncTimestamp[msg.sender];
        uint256 yieldAmount = (baseSUSDeAmount * 500 * timeElapsed) / (10000 * 365 days);

        uint256 totalSUSDeToReturn = baseSUSDeAmount + yieldAmount;

        // Ensure we don't return more than available
        uint256 availableSUSDe = sUSDe.balanceOf(address(this));
        if (totalSUSDeToReturn > availableSUSDe) {
            totalSUSDeToReturn = availableSUSDe;
            yieldAmount = totalSUSDeToReturn > baseSUSDeAmount ? totalSUSDeToReturn - baseSUSDeAmount : 0;
        }

        // Update tracking
        sUSDeBackingAmount[msg.sender] -= baseSUSDeAmount;
        totalSUSDeHeld = totalSUSDeHeld > baseSUSDeAmount ? totalSUSDeHeld - baseSUSDeAmount : 0;

        // Burn yUSDe
        _burn(msg.sender, amount);

        // Transfer sUSDe + yield back to user
        sUSDe.safeTransfer(msg.sender, totalSUSDeToReturn);

        emit YieldRedeemed(msg.sender, amount, baseSUSDeAmount, yieldAmount);
    }

    /**
     * @notice Mint yUSDe to a specific address (only callable by MINTER_ROLE)
     * @param to Address to mint to
     * @param sUSDeAmount Amount of sUSDe backing
     */
    function mintTo(address to, uint256 sUSDeAmount) external onlyRole(MINTER_ROLE) nonReentrant {
        if (sUSDeAmount == 0) revert ZeroAmount();
        if (to == address(0)) revert("Invalid address");

        uint256 yUSDeAmount = (sUSDeAmount * MINT_RATIO) / RATIO_DENOMINATOR;

        // Transfer sUSDe from caller to this contract
        sUSDe.safeTransferFrom(msg.sender, address(this), sUSDeAmount);

        // Track backing
        sUSDeBackingAmount[to] += sUSDeAmount;
        lastYieldSyncTimestamp[to] = block.timestamp;
        totalSUSDeHeld += sUSDeAmount;

        // Mint yUSDe
        _mint(to, yUSDeAmount);

        emit Minted(to, sUSDeAmount, yUSDeAmount);
    }

    /**
     * @notice Burn yUSDe from a specific address (only callable by MINTER_ROLE)
     * @param from Address to burn from
     * @param amount Amount of yUSDe to burn
     */
    function burnFrom(address from, uint256 amount) external onlyRole(MINTER_ROLE) nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (balanceOf(from) < amount) revert InsufficientBalance();

        uint256 sUSDeAmount = (amount * RATIO_DENOMINATOR) / MINT_RATIO;

        if (sUSDeBackingAmount[from] < sUSDeAmount) revert InsufficientBacking();

        // Update tracking
        sUSDeBackingAmount[from] -= sUSDeAmount;
        totalSUSDeHeld -= sUSDeAmount;

        // Burn yUSDe
        _burn(from, amount);

        // Transfer sUSDe to caller (typically PerpDEX for liquidations)
        sUSDe.safeTransfer(msg.sender, sUSDeAmount);

        emit Burned(from, amount, sUSDeAmount);
    }

    /**
     * @notice Get the sUSDe backing ratio for a user
     * @param user Address of the user
     * @return backing Amount of sUSDe backing the user's yUSDe
     * @return yUSDeBalance User's yUSDe balance
     */
    function getUserBacking(address user) external view returns (uint256 backing, uint256 yUSDeBalance) {
        backing = sUSDeBackingAmount[user];
        yUSDeBalance = balanceOf(user);
    }

    /**
     * @notice Calculate accrued yield for a user
     * @param user Address of the user
     * @return yieldAmount Estimated yield in sUSDe
     */
    function calculateAccruedYield(address user) external view returns (uint256 yieldAmount) {
        uint256 timeElapsed = block.timestamp - lastYieldSyncTimestamp[user];
        uint256 backing = sUSDeBackingAmount[user];
        yieldAmount = (backing * 500 * timeElapsed) / (10000 * 365 days);
    }

    /**
     * @notice Override decimals to match sUSDe (18 decimals)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
