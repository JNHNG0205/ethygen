// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title YUSDe
 * @dev Margin token backed by sUSDe at 0.8:1 ratio
 * This token represents margin collateral for perpetual trading
 */
contract YUSDe is ERC20, Ownable {
    IERC20 public immutable susde;
    address public vault;
    
    // Collateral ratio: 0.8 yUSDe per 1 sUSDe
    uint256 public constant COLLATERAL_RATIO = 8000; // 80% in basis points
    uint256 public constant FULL_RATIO = 10000; // 100% in basis points
    
    // Events
    event Minted(address indexed user, uint256 susdeAmount, uint256 yusdeAmount);
    event Burned(address indexed user, uint256 yusdeAmount, uint256 susdeAmount);
    
    constructor(address _susde) ERC20("Yield USDe", "yUSDe") Ownable(msg.sender) {
        susde = IERC20(_susde);
    }
    
    /**
     * @dev Set the vault address (only owner)
     * @param _vault Vault contract address
     */
    function setVault(address _vault) external onlyOwner {
        vault = _vault;
    }
    
    /**
     * @dev Mint yUSDe tokens backed by sUSDe
     * @param susdeAmount Amount of sUSDe to use as collateral
     * @return yusdeAmount Amount of yUSDe minted
     */
    function mint(uint256 susdeAmount) external returns (uint256) {
        require(vault != address(0), "Vault not set");
        require(susdeAmount > 0, "Amount must be greater than 0");
        require(susde.balanceOf(msg.sender) >= susdeAmount, "Insufficient sUSDe balance");
        
        // Calculate yUSDe amount (0.8:1 ratio)
        uint256 yusdeAmount = (susdeAmount * COLLATERAL_RATIO) / FULL_RATIO;
        
        // Transfer sUSDe from user to this contract
        susde.transferFrom(msg.sender, address(this), susdeAmount);
        
        // Mint yUSDe tokens
        _mint(msg.sender, yusdeAmount);
        
        emit Minted(msg.sender, susdeAmount, yusdeAmount);
        return yusdeAmount;
    }
    
    /**
     * @dev Burn yUSDe tokens to receive sUSDe
     * @param yusdeAmount Amount of yUSDe to burn
     * @return susdeAmount Amount of sUSDe returned
     */
    function burn(uint256 yusdeAmount) external returns (uint256) {
        require(yusdeAmount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= yusdeAmount, "Insufficient yUSDe balance");
        
        // Calculate sUSDe amount (1:0.8 ratio)
        uint256 susdeAmount = (yusdeAmount * FULL_RATIO) / COLLATERAL_RATIO;
        require(susde.balanceOf(address(this)) >= susdeAmount, "Insufficient sUSDe in contract");
        
        // Burn yUSDe tokens
        _burn(msg.sender, yusdeAmount);
        
        // Transfer sUSDe back to user
        susde.transfer(msg.sender, susdeAmount);
        
        emit Burned(msg.sender, yusdeAmount, susdeAmount);
        return susdeAmount;
    }
    
    /**
     * @dev Get the collateral ratio for a given amount
     * @param susdeAmount Amount of sUSDe
     * @return yusdeAmount Equivalent yUSDe amount
     */
    function getCollateralAmount(uint256 susdeAmount) external pure returns (uint256) {
        return (susdeAmount * COLLATERAL_RATIO) / FULL_RATIO;
    }
    
    /**
     * @dev Get the backing amount for yUSDe
     * @param yusdeAmount Amount of yUSDe
     * @return susdeAmount Equivalent sUSDe amount
     */
    function getBackingAmount(uint256 yusdeAmount) external pure returns (uint256) {
        return (yusdeAmount * FULL_RATIO) / COLLATERAL_RATIO;
    }
    
    /**
     * @dev Get total sUSDe backing
     * @return totalBacking Total sUSDe held as collateral
     */
    function getTotalBacking() external view returns (uint256) {
        return susde.balanceOf(address(this));
    }
    
    /**
     * @dev Emergency function to withdraw sUSDe (only owner)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(susde.balanceOf(address(this)) >= amount, "Insufficient balance");
        susde.transfer(owner(), amount);
    }
}
