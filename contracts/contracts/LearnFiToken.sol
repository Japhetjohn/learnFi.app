// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title LearnFiToken
 * @dev ERC20 token for the LearnFi learning platform
 *
 * Features:
 * - Mintable by authorized minters (for learn-to-earn rewards)
 * - Burnable by token holders
 * - Pausable by admin (emergency situations)
 * - EIP-2612 Permit (gasless approvals)
 * - Role-based access control
 *
 * Token Distribution:
 * - Max Supply: 1,000,000,000 LEARN (1 billion)
 * - Learn-to-Earn: 40% (400M)
 * - Staking Rewards: 20% (200M)
 * - Team: 15% (150M, 4-year vest)
 * - Treasury: 15% (150M)
 * - Liquidity: 5% (50M)
 * - Partners: 5% (50M)
 */
contract LearnFiToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ERC20Permit {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens

    /**
     * @dev Emitted when tokens are minted for learning rewards
     */
    event LearnRewardMinted(address indexed recipient, uint256 amount, string reason);

    /**
     * @dev Constructor - initializes the token with roles
     * @param defaultAdmin Address to grant admin role
     * @param minter Address to grant minter role (backend service)
     * @param pauser Address to grant pauser role
     */
    constructor(
        address defaultAdmin,
        address minter,
        address pauser
    ) ERC20("LearnFi Token", "LEARN") ERC20Permit("LearnFi Token") {
        require(defaultAdmin != address(0), "Invalid admin address");
        require(minter != address(0), "Invalid minter address");
        require(pauser != address(0), "Invalid pauser address");

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
        _grantRole(PAUSER_ROLE, pauser);
    }

    /**
     * @dev Mint tokens for learning rewards
     * @param to Recipient address
     * @param amount Amount to mint
     * @param reason Reason for minting (e.g., "Course completion: Intro to DeFi")
     */
    function mintLearningReward(
        address to,
        uint256 amount,
        string memory reason
    ) public onlyRole(MINTER_ROLE) {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");

        _mint(to, amount);
        emit LearnRewardMinted(to, amount, reason);
    }

    /**
     * @dev Batch mint for multiple recipients (gas optimization)
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to mint
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyRole(MINTER_ROLE) {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(amounts[i] > 0, "Invalid amount");
            require(totalSupply() + amounts[i] <= MAX_SUPPLY, "Exceeds max supply");

            _mint(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Pause token transfers (emergency only)
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Required override for ERC20Pausable
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }

    /**
     * @dev Returns the number of decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
