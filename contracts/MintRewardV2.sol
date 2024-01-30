// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./IMintReward.sol";
import "./IGoMiningToken.sol";
import "./IVEGoMiningToken.sol";

contract MintRewardV2 is IMintReward, PausableUpgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    using SafeERC20Upgradeable for IGoMiningToken;

    struct Reward {
        uint256 amount;
        uint256 ts;
        uint256 blk;
    }
    IGoMiningToken public Token;
    IVEGoMiningToken public veToken;
    uint256 public totalRewards;
    uint256 public totalClaimedRewards;


    uint256 public rewardCount; // nextRewardId
    mapping(uint256 => Reward) public rewards; // reward history
    mapping(address => uint256) public lastClaim; // address => rewardId

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant CONFIGURATOR_ROLE = keccak256("CONFIGURATOR_ROLE");

    event ReceivedReward(
        address indexed from,
        uint256 amount,
        uint256 indexed index,
        uint256 ts, // timestamp of this point
        uint256 blk // block number of this point
    );
    event ClaimedReward(address indexed account, uint256 amount, uint256 ts);



    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }


    // @notice Called by minter to save reward to history
    // @param _amount Amount of tokens to save
    function receiveReward(uint256 _amount) external onlyRole(MINTER_ROLE) nonReentrant whenNotPaused {

        require(Token.transferFrom(_msgSender(), address(this), _amount), "MintReward: token transfer failed");
        require(veToken.totalSupplyAt(block.number) != 0, "MintReward: ve total supply equals zero");

        rewards[rewardCount] = Reward(_amount, block.timestamp, block.number);

        emit ReceivedReward(_msgSender(), _amount, rewardCount, block.timestamp, block.number);

        rewardCount++;
        totalRewards += _amount;

    }

    // @notice Returns amount of unclaimed rewards for `msg.sender`
    function unclaimedRewards(address _addr) public view returns (uint256) {

        uint256 lastRewardIndex = lastClaim[_addr];

        // I believe that lastRewardIndex should be less than rewardCount
        if (lastRewardIndex >= rewardCount - 1) {
            return 0;
        }

        IVEGoMiningToken _veToken = veToken;

        uint256 amount;
        for (uint256 i = lastRewardIndex + 1; i < rewardCount; i++) {
            Reward memory reward = rewards[i];

            if (_veToken.totalSupplyAt(reward.blk) != 0) {
                amount += _veToken.balanceOfAt(_addr, reward.blk) * reward.amount / _veToken.totalSupplyAt(reward.blk);
            }
        }


        return amount;
    }

    // @notice Transfers all unclaimed rewards to `msg.sender`
    function claimRewards() external nonReentrant whenNotPaused {
        require(rewardCount > 0, "MintReward: no rewards");

        uint256 amount = unclaimedRewards(_msgSender());

        require(amount > 0, "MintReward: no rewards to claim");

        lastClaim[_msgSender()] = rewardCount - 1;

        require(Token.transfer(msg.sender, amount), "MintReward: token transfer failed");

        emit ClaimedReward(_msgSender(), amount, block.timestamp);
        totalClaimedRewards += amount;

    }


    function updateVeToken(address _veToken) external onlyRole(CONFIGURATOR_ROLE) whenPaused {
        require(_veToken != address(0), "MintReward: veToken is zero address");
        veToken = IVEGoMiningToken(_veToken);
    }

    function _authorizeUpgrade(address newImplementation) internal onlyRole(UPGRADER_ROLE) override {}

}
