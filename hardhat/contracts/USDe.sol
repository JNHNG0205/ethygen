// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title USDe
 * @dev USDe token implementation
 */
contract USDe is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) ERC20(name, symbol) Ownable(msg.sender) {
        // Mint initial supply for testing
        _mint(msg.sender, 1000000 * 10**decimals);
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
