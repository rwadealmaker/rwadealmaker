// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Ownable.sol";

contract KYCRegistry is Ownable {
    // 0=NONE, 1=BASIC, 2=FULL, 255=BLOCKED（示例）
    mapping(address => uint8) public kycLevel;
    mapping(address => bool)  public blocked;

    // EIP-712
    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public constant TYPEHASH =
        keccak256("SetKycLevel(address user,uint8 level,uint256 deadline,bytes32 nonce)");
    address public kycSigner;
    mapping(bytes32 => bool) public usedNonce;

    event SetSigner(address indexed signer);
    event SetLevel(address indexed user, uint8 level, address indexed setter);
    event Block(address indexed user, bool blocked, address indexed setter);

    constructor(string memory name_) {
        uint256 chainId; assembly { chainId := chainid() }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name_)),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );
    }

    function setSigner(address signer) external onlyOwner {
        kycSigner = signer;
        emit SetSigner(signer);
    }

    // —— 手动白名单/KYC 等级 ——
    function setKycLevel(address user, uint8 level) external onlyOwner {
        require(!blocked[user], "BLOCKED");
        kycLevel[user] = level;
        emit SetLevel(user, level, msg.sender);
    }

    function setBlocked(address user, bool isBlocked) external onlyOwner {
        blocked[user] = isBlocked;
        emit Block(user, isBlocked, msg.sender);
    }

    // —— 后端签名写入（可选） ——
    function setKycLevelBySig(
        address user,
        uint8 level,
        uint256 deadline,
        bytes32 nonce,
        bytes calldata signature
    ) external {
        require(!blocked[user], "BLOCKED");
        require(kycSigner != address(0), "NO_SIGNER");
        require(block.timestamp <= deadline, "EXPIRED");
        require(!usedNonce[nonce], "NONCE_USED");

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(TYPEHASH, user, level, deadline, nonce))
            )
        );
        address recovered = _recover(digest, signature);
        require(recovered == kycSigner, "BAD_SIG");

        usedNonce[nonce] = true;
        kycLevel[user] = level;
        emit SetLevel(user, level, recovered);
    }

    function _recover(bytes32 digest, bytes memory sig) internal pure returns (address) {
        require(sig.length == 65, "SIG_LEN");
        bytes32 r; bytes32 s; uint8 v;
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        if (v < 27) v += 27;
        require(v == 27 || v == 28, "SIG_V");
        return ecrecover(digest, v, r, s);
    }
}
