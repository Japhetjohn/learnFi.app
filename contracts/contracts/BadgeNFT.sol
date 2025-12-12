// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BadgeNFT
 * @dev ERC721 NFT for course completion certificates and achievement badges
 *
 * Features:
 * - Mintable by authorized minters (backend service)
 * - Burnable by token owners
 * - Optional soulbound (non-transferable) badges
 * - Metadata stored on IPFS
 * - Role-based access control
 *
 * Each NFT represents:
 * - Course completion certificate
 * - Achievement milestone badge
 * - Special event participation
 *
 * Metadata includes:
 * - Course name / badge name
 * - Completion date / earned date
 * - XP earned
 * - Tier (bronze, silver, gold, legendary)
 * - Learner address
 */
contract BadgeNFT is ERC721, ERC721URIStorage, ERC721Burnable, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    Counters.Counter private _tokenIdCounter;

    // Mapping to track soulbound (non-transferable) tokens
    mapping(uint256 => bool) public isSoulbound;

    /**
     * @dev Emitted when a badge is minted
     */
    event BadgeMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        string metadataURI,
        bool soulbound
    );

    /**
     * @dev Constructor
     * @param defaultAdmin Address to grant admin role
     * @param minter Address to grant minter role (backend service)
     */
    constructor(
        address defaultAdmin,
        address minter
    ) ERC721("LearnFi Certificate", "LEARNBADGE") {
        require(defaultAdmin != address(0), "Invalid admin address");
        require(minter != address(0), "Invalid minter address");

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);

        // Start token IDs at 1
        _tokenIdCounter.increment();
    }

    /**
     * @dev Mint a badge NFT
     * @param to Recipient address
     * @param metadataURI IPFS URI with badge metadata
     * @param soulbound Whether this badge is non-transferable
     * @return tokenId The minted token ID
     */
    function mintBadge(
        address to,
        string memory metadataURI,
        bool soulbound
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(metadataURI).length > 0, "Metadata URI required");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        if (soulbound) {
            isSoulbound[tokenId] = true;
        }

        emit BadgeMinted(to, tokenId, metadataURI, soulbound);

        return tokenId;
    }

    /**
     * @dev Batch mint badges for multiple recipients
     * @param recipients Array of recipient addresses
     * @param metadataURIs Array of IPFS metadata URIs
     * @param soulboundFlags Array of soulbound flags
     */
    function batchMintBadges(
        address[] calldata recipients,
        string[] calldata metadataURIs,
        bool[] calldata soulboundFlags
    ) external onlyRole(MINTER_ROLE) {
        require(recipients.length == metadataURIs.length, "Arrays length mismatch");
        require(recipients.length == soulboundFlags.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");

        for (uint256 i = 0; i < recipients.length; i++) {
            mintBadge(recipients[i], metadataURIs[i], soulboundFlags[i]);
        }
    }

    /**
     * @dev Get total number of badges minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }

    /**
     * @dev Get all token IDs owned by an address
     * @param owner Address to query
     * @return Array of token IDs
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        if (tokenCount == 0) {
            return new uint256[](0);
        }

        uint256[] memory tokens = new uint256[](tokenCount);
        uint256 index = 0;

        for (uint256 tokenId = 1; tokenId < _tokenIdCounter.current(); tokenId++) {
            if (_ownerOf(tokenId) == owner) {
                tokens[index] = tokenId;
                index++;
                if (index == tokenCount) break;
            }
        }

        return tokens;
    }

    /**
     * @dev Override transfer functions to prevent soulbound token transfers
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting and burning, but not transfers of soulbound tokens
        if (from != address(0) && to != address(0) && isSoulbound[tokenId]) {
            revert("Soulbound: transfer not allowed");
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Required overrides
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
