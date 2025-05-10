// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

error NotOwner();
error InvalidInput();
error TotalPercentageMustBe100();
error MaxStakeholdersReached();

contract RoyaltyDistribution {
    address public owner;
    bool public paused = false;

    uint256 public constant MAX_STAKEHOLDERS = 50;

    struct Stakeholder {
        address wallet;
        uint256 percentage; // Out of 100
    }

    Stakeholder[] public stakeholders;
    mapping(address => bool) public isStakeholder;

    // Events
    event PaymentReceived(address indexed from, uint256 amount);
    event RoyaltyDistributed(address indexed to, uint256 amount);
    event StakeholderAdded(address indexed wallet, uint256 percentage);
    event StakeholderUpdated(address indexed wallet, uint256 newPercentage);
    event StakeholderRemoved(address indexed wallet);
    event FundsWithdrawn(address indexed to, uint256 amount);
    event DustSwept(uint256 amount);
    event Paused();
    event Unpaused();
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor(address[] memory _wallets, uint256[] memory _percentages) {
        if (_wallets.length != _percentages.length || _wallets.length == 0) revert InvalidInput();

        uint256 totalPercentage;
        for (uint256 i = 0; i < _wallets.length; i++) {
            if (_wallets[i] == address(0)) revert InvalidInput();
            if (isStakeholder[_wallets[i]]) revert InvalidInput();
            stakeholders.push(Stakeholder(_wallets[i], _percentages[i]));
            isStakeholder[_wallets[i]] = true;
            totalPercentage += _percentages[i];
        }

        if (totalPercentage != 100) revert TotalPercentageMustBe100();

        owner = msg.sender;
        emit OwnershipTransferred(address(0), owner);
    }

    // ETH distribution
    receive() external payable whenNotPaused {
        emit PaymentReceived(msg.sender, msg.value);
        _distributeETH(msg.value);
    }

    fallback() external payable whenNotPaused {
        if (msg.value > 0) {
            emit PaymentReceived(msg.sender, msg.value);
            _distributeETH(msg.value);
        }
    }

    function _distributeETH(uint256 amount) internal {
        for (uint256 i = 0; i < stakeholders.length; i++) {
            uint256 share = (amount * stakeholders[i].percentage) / 100;
            (bool sent, ) = stakeholders[i].wallet.call{value: share}("");
            require(sent, "Payment failed");
            emit RoyaltyDistributed(stakeholders[i].wallet, share);
        }
    }

    // View royalty preview
    function previewDistribution(uint256 amount) external view returns (address[] memory wallets, uint256[] memory shares) {
        uint256 len = stakeholders.length;
        wallets = new address[](len);
        shares = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            wallets[i] = stakeholders[i].wallet;
            shares[i] = (amount * stakeholders[i].percentage) / 100;
        }
    }

    // Stakeholder view
    function getStakeholderShare(address wallet) external view returns (uint256 percentage) {
        for (uint256 i = 0; i < stakeholders.length; i++) {
            if (stakeholders[i].wallet == wallet) {
                return stakeholders[i].percentage;
            }
        }
        return 0;
    }

    function getStakeholders() external view returns (Stakeholder[] memory) {
        return stakeholders;
    }

    // Management
    function addStakeholder(address wallet, uint256[] calldata newPercentages) external onlyOwner {
        if (wallet == address(0) || isStakeholder[wallet]) revert InvalidInput();
        if (stakeholders.length >= MAX_STAKEHOLDERS) revert MaxStakeholdersReached();
        if (newPercentages.length != stakeholders.length + 1) revert InvalidInput();

        uint256 total;
        for (uint256 i = 0; i < newPercentages.length; i++) {
            total += newPercentages[i];
        }
        if (total != 100) revert TotalPercentageMustBe100();

        for (uint256 i = 0; i < stakeholders.length; i++) {
            stakeholders[i].percentage = newPercentages[i];
        }

        stakeholders.push(Stakeholder(wallet, newPercentages[newPercentages.length - 1]));
        isStakeholder[wallet] = true;

        emit StakeholderAdded(wallet, newPercentages[newPercentages.length - 1]);
    }

    function _rebalanceOthers(address exclude, int256 diff) private {
        uint256 len = stakeholders.length;
        for (uint256 i = 0; i < len; i++) {
            if (stakeholders[i].wallet != exclude) {
                uint256 adjustment = uint256((int256(stakeholders[i].percentage) * diff) / int256(100 - stakeholders[i].percentage));
                stakeholders[i].percentage = uint256(int256(stakeholders[i].percentage) - int256(adjustment));
            }
        }
        _normalizePercentages();
    }

    function updateStakeholder(address wallet, uint256 newPercentage, bool autoAdjust) external onlyOwner {
        if (!isStakeholder[wallet] || newPercentage == 0) revert InvalidInput();

        uint256 oldPercentage;
        for (uint256 i = 0; i < stakeholders.length; i++) {
            if (stakeholders[i].wallet == wallet) {
                oldPercentage = stakeholders[i].percentage;
                stakeholders[i].percentage = newPercentage;
                break;
            }
        }

        if (autoAdjust && oldPercentage != newPercentage && stakeholders.length > 1) {
            int256 diff = int256(newPercentage) - int256(oldPercentage);
            _rebalanceOthers(wallet, diff);
        }

        _validateTotalPercentage();
        emit StakeholderUpdated(wallet, newPercentage);
    }

    function _normalizePercentages() private {
        uint256 total;
        for (uint256 i = 0; i < stakeholders.length; i++) {
            total += stakeholders[i].percentage;
        }

        if (total != 100) {
            int256 diff = int256(100) - int256(total);
            stakeholders[stakeholders.length - 1].percentage = uint256(int256(stakeholders[stakeholders.length - 1].percentage) + diff);
        }
    }

    function _redistributeShares(uint256 extraShare) private {
        uint256 len = stakeholders.length;
        for (uint256 i = 0; i < len; i++) {
            stakeholders[i].percentage += (stakeholders[i].percentage * extraShare) / (100 - extraShare);
        }

        _normalizePercentages();
    }

    function removeStakeholder(address wallet, bool autoAdjust) external onlyOwner {
        if (!isStakeholder[wallet]) revert InvalidInput();

        uint256 len = stakeholders.length;
        uint256 removedPercentage;
        for (uint256 i = 0; i < len; i++) {
            if (stakeholders[i].wallet == wallet) {
                removedPercentage = stakeholders[i].percentage;
                stakeholders[i] = stakeholders[len - 1];
                stakeholders.pop();
                break;
            }
        }

        isStakeholder[wallet] = false;

        if (autoAdjust && stakeholders.length > 0) {
            _redistributeShares(removedPercentage);
        } else if (stakeholders.length > 0) {
            _validateTotalPercentage();
        }

        emit StakeholderRemoved(wallet);
    }

    function _validateTotalPercentage() internal view {
        uint256 total;
        for (uint256 i = 0; i < stakeholders.length; i++) {
            total += stakeholders[i].percentage;
        }

        if (stakeholders.length > 0 && total != 100) {
            revert TotalPercentageMustBe100();
        }
    }

    // Admin
    function withdraw(uint256 amount, address payable to) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        to.transfer(amount);
        emit FundsWithdrawn(to, amount);
    }

    function sweepDust() external onlyOwner {
        uint256 dust = address(this).balance;
        if (dust > 0) {
            payable(owner).transfer(dust);
            emit DustSwept(dust);
        }
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused();
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused();
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}