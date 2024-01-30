// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

interface IMintRewardV3 {

    function claimRewards() external;

    function lastClaim(address) external view returns (uint256);

    function receiveReward(uint256 _amount) external;

    function rewardCount() external view returns (uint256);

    function rewards(uint256)
    external
    view
    returns (
        uint256 amount,
        uint256 ts,
        uint256 blk
    );

    function unclaimedRewards(address _addr) external view returns (uint256);

    function setLastClaim(address _addr) external;

    function setLastClaim(address _addr, uint256 lastClaimIndex) external;
}
