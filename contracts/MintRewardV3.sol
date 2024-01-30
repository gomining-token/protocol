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

contract MintRewardV3 is IMintReward, PausableUpgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    using SafeERC20Upgradeable for IGoMiningToken;

    struct Reward {
        uint256 amount;
        uint256 ts; // totalSupply at this block
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
        uint256 rc = rewardCount;
        IVEGoMiningToken _veToken = veToken;

        require(Token.transferFrom(_msgSender(), address(this), _amount), "MintReward: token transfer failed");
        require(_veToken.totalSupplyAt(block.number) != 0, "MintReward: ve total supply equals zero");

        rewards[rc] = Reward(_amount, _veToken.totalSupply(), block.number);

        emit ReceivedReward(_msgSender(), _amount, rc, block.timestamp, block.number);

        rewardCount++;
        totalRewards += _amount;

    }

    // @notice Returns amount of unclaimed rewards for `msg.sender`
    function unclaimedRewards(address _addr) public view returns (uint256) {
        uint256 rc = rewardCount;

        uint256 lastRewardIndex = lastClaim[_addr];

        // I believe that lastRewardIndex should be less than rewardCount
        if (lastRewardIndex >= rc - 1) {
            return 0;
        }

        IVEGoMiningToken _veToken = veToken;

        uint256 amount;
        for (uint256 i = lastRewardIndex + 1; i < rc; i++) {
            Reward memory reward = rewards[i];
            uint256 balance = _veToken.balanceOfAt(_addr, reward.blk);

            if (balance != 0) {
                amount += balance * reward.amount / reward.ts;
            } else {
                // TODO check if it works
                break;
            }
        }


        return amount;
    }

    // @notice Transfers all unclaimed rewards to `msg.sender`
    function claimRewards() external nonReentrant whenNotPaused {
        uint256 rc = rewardCount;

        require(rc > 0, "MintReward: no rewards");

        uint256 amount = unclaimedRewards(_msgSender());

        require(amount > 0, "MintReward: no rewards to claim");

        lastClaim[_msgSender()] = rc - 1;

        require(Token.transfer(msg.sender, amount), "MintReward: token transfer failed");

        emit ClaimedReward(_msgSender(), amount, block.timestamp);
//        totalClaimedRewards += amount; // TODO check useless

    }

    function updateForV3() external onlyRole(UPGRADER_ROLE) {
        uint256 rc = rewardCount;
        IVEGoMiningToken _veToken = veToken;

        for (uint256 i = 0; i < rc; i++) {
            rewards[i].ts = _veToken.totalSupplyAt(rewards[i].blk);
        }
        totalClaimedRewards = 0;
    }

    function setLastClaim(address _addr) external onlyRole(CONFIGURATOR_ROLE) whenNotPaused {
        lastClaim[_addr] = rewardCount - 1;
    }


    function setLastClaim(address _addr, uint256 lastClaimIndex) external onlyRole(UPGRADER_ROLE) whenNotPaused {
        require(lastClaimIndex > 0 && lastClaimIndex < rewardCount, "MintReward: index is out of range");

        lastClaim[_addr] = lastClaimIndex;
    }

    function _authorizeUpgrade(address newImplementation) internal onlyRole(UPGRADER_ROLE) override {}

}
