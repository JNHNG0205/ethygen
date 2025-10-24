// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ITokenController {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

contract USDCVault is ERC20, Ownable(msg.sender) {
    // testnet
    IERC20 public immutable usdc;

    // mock
    IERC20 public immutable usde;
    IERC20 public immutable susde;
    // is there a better way of doing this? ITokenController cant inherit IERC20
    ITokenController public immutable usdeController;
    ITokenController public immutable susdeController;

    // constants
    uint256 public constant YIELD_RATE = 500; // 5%
    uint256 public constant FULL_RATE = 10000; // 100%
    uint256 public constant SECONDS_PER_YEAR = 365 days; // apparently this is a feature

    // data
    uint256 public totalStakedUSDe;
    mapping(address => uint256) public userStakedTime;
    mapping(address => uint256) public userStakedAmount;

    // eth to usdc conversion rate
    uint256 public ethToUsdcRate = 2500 * 10 ** 6; // 1 eth = 2500 usdc (6 decimals)

    event Deposited(
        address indexed user,
        uint256 usdcAmount,
        uint256 susdeAmount
    );
    event Withdrawn(
        address indexed user,
        uint256 susdeAmount,
        uint256 usdcAmount
    );
    event DepositedETH(
        address indexed user,
        uint256 ethAmount,
        uint256 usdcAmount,
        uint256 susdeAmount
    );
    event WithdrawnETH(
        address indexed user,
        uint256 susdeAmount,
        uint256 usdcAmount,
        uint256 ethAmount
    );

    constructor(
        address _usdc,
        address _usde,
        address _susde
    ) ERC20("USDC Vault Token", "vUSDC") {
        usdc = IERC20(_usdc);

        usde = IERC20(_usde);
        susde = IERC20(_susde);
        usdeController = ITokenController(_usde);
        susdeController = ITokenController(_susde);
    }

    function calculateWithdrawAmount(
        address user,
        uint256 susdeAmount
    ) public view returns (uint256) {
        uint256 stakedTime = userStakedTime[user];
        if (stakedTime == 0) return susdeAmount;

        uint256 timeElapsed = block.timestamp - stakedTime;
        // double check math pls
        uint256 yieldAmount = (susdeAmount * YIELD_RATE * timeElapsed) /
            (FULL_RATE * SECONDS_PER_YEAR);

        return susdeAmount + yieldAmount;
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    // deposit
    function depositETH() public payable {
        require(msg.value > 0, "ETH amount must be greater than 0");

        // eth to usdc
        uint256 usdcAmount = (msg.value * ethToUsdcRate) / 10 ** 18;

        _processDeposit(msg.sender, usdcAmount);

        emit DepositedETH(msg.sender, msg.value, usdcAmount, usdcAmount);
    }

    // withdraw
    function withdraw(uint256 susdeAmount) external {
        uint256 usdcAmount = _processWithdraw(msg.sender, susdeAmount);

        emit Deposited(msg.sender, susdeAmount, usdcAmount);

        // take eth from vault, return to user
        // need to convert from usdc to eth
        uint256 ethAmount = (usdcAmount * 10 ** 18) / ethToUsdcRate;

        require(address(this).balance >= ethAmount, "Insufficient ETH balance"); // what to do here
        (bool success, ) = payable(msg.sender).call{value: ethAmount}("");
        require(success, "ETH transfer failed");

        emit Withdrawn(msg.sender, susdeAmount, usdcAmount);
    }

    function _processDeposit(address user, uint256 usdcAmount) internal {
        // mint usde from usdc
        uint256 usdeAmount = usdcAmount;
        usdeController.mint(address(this), usdeAmount);

        // mint susde from usde
        susdeController.mint(user, usdeAmount);

        // tracking
        userStakedTime[user] = block.timestamp;
        userStakedAmount[user] += usdeAmount;
        totalStakedUSDe += usdeAmount;
    }

    function _processWithdraw(
        address user,
        uint256 susdeAmount
    ) internal returns (uint256) {
        require(susdeAmount > 0, "Amount must be greater than 0");
        require(
            susde.balanceOf(user) >= susdeAmount,
            "Insufficient sUSDe balance"
        );

        // calculate usde + yield
        uint256 usdeAmount = calculateWithdrawAmount(user, susdeAmount);

        // burn susde from user
        susdeController.burn(user, susdeAmount);

        // mint extra usde (yield)
        if (usdeAmount > userStakedAmount[user]) {
            uint256 yield = usdeAmount - userStakedAmount[user];
            usdeController.mint(address(this), yield);
        }

        // usde back into usdc
        uint256 usdcAmount = usdeAmount;
        usdeController.burn(address(this), usdeAmount);

        // tracking
        userStakedAmount[user] = userStakedAmount[user] > usdeAmount
            ? userStakedAmount[user] - usdeAmount
            : 0;
        totalStakedUSDe = totalStakedUSDe > usdeAmount
            ? totalStakedUSDe - usdeAmount
            : 0;

        return usdcAmount;
    }

    function setEthToUsdcRate(uint256 _rate) external onlyOwner {
        ethToUsdcRate = _rate;
    }

    receive() external payable {
        depositETH();
    }
}