// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title yUSDe - Yield USDe (Margin Tokens)
 * @dev Margin tokens for perpetual trading at 0.8:1 ratio
 * Users can convert sUSDe to yUSDe for trading with leverage
 */
contract yUSDe is ERC20, Ownable {
    uint256 public constant MARGIN_RATIO = 8000; // 0.8:1 ratio (8000 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    
    // Total sUSDe backing this yUSDe
    uint256 public totalBacking;
    
    event MarginTokenMinted(address indexed to, uint256 yUSDeAmount, uint256 sUSDeAmount);
    event MarginTokenBurned(address indexed from, uint256 yUSDeAmount, uint256 sUSDeAmount);

    constructor() ERC20("Yield USDe", "yUSDe") Ownable(msg.sender) {}

    /**
     * @dev Mint yUSDe tokens from sUSDe (only owner - MarginToken contract)
     * @param to Address to mint tokens to
     * @param sUSDeAmount Amount of sUSDe to convert
     * @return yUSDeAmount Amount of yUSDe minted
     */
    function mintFromStaked(address to, uint256 sUSDeAmount) external onlyOwner returns (uint256 yUSDeAmount) {
        yUSDeAmount = (sUSDeAmount * MARGIN_RATIO) / BASIS_POINTS;
        _mint(to, yUSDeAmount);
        totalBacking += sUSDeAmount;
        
        emit MarginTokenMinted(to, yUSDeAmount, sUSDeAmount);
        return yUSDeAmount;
    }

    /**
     * @dev Burn yUSDe tokens back to sUSDe (only owner - MarginToken contract)
     * @param from Address to burn tokens from
     * @param yUSDeAmount Amount of yUSDe to burn
     * @return sUSDeAmount Amount of sUSDe to return
     */
    function burnToStaked(address from, uint256 yUSDeAmount) external onlyOwner returns (uint256 sUSDeAmount) {
        sUSDeAmount = (yUSDeAmount * BASIS_POINTS) / MARGIN_RATIO;
        _burn(from, yUSDeAmount);
        totalBacking -= sUSDeAmount;
        
        emit MarginTokenBurned(from, yUSDeAmount, sUSDeAmount);
        return sUSDeAmount;
    }

    /**
     * @dev Get the amount of sUSDe needed to mint a specific amount of yUSDe
     * @param yUSDeAmount Amount of yUSDe desired
     * @return sUSDeAmount Amount of sUSDe required
     */
    function getRequiredStakedAmount(uint256 yUSDeAmount) external pure returns (uint256 sUSDeAmount) {
        return (yUSDeAmount * BASIS_POINTS) / MARGIN_RATIO;
    }

    /**
     * @dev Get the amount of yUSDe that can be minted from a specific amount of sUSDe
     * @param sUSDeAmount Amount of sUSDe available
     * @return yUSDeAmount Amount of yUSDe that can be minted
     */
    function getMintableAmount(uint256 sUSDeAmount) external pure returns (uint256 yUSDeAmount) {
        return (sUSDeAmount * MARGIN_RATIO) / BASIS_POINTS;
    }

    /**
     * @dev Get current backing ratio (sUSDe backing per yUSDe token)
     * @return backingRatio Backing ratio scaled by 1e18
     */
    function getBackingRatio() external view returns (uint256 backingRatio) {
        if (totalSupply() == 0) return 0;
        return (totalBacking * 1e18) / totalSupply();
    }
}
