// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Ownable.sol";
import "./ICompliantERC20.sol";
import "./KYCRegistry.sol";

abstract contract CompliantERC20 is ICompliantERC20, Ownable {
    string  public override name;
    string  public override symbol;
    uint8   public constant override decimals = 18;

    KYCRegistry public registry;
    uint8 public requiredKycLevel = 1; // 默认门槛（收/发双方）

    bool public paused; // 紧急暂停

    uint256 public override totalSupply;
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    event RequiredKycLevel(uint8 oldLevel, uint8 newLevel);
    event Paused(bool status);

    constructor(string memory _name, string memory _symbol, address _registry) {
        name = _name;
        symbol = _symbol;
        registry = KYCRegistry(_registry);
    }

    // —— 管理员开关 ——
    function setRequiredKycLevel(uint8 level) external onlyOwner {
        emit RequiredKycLevel(requiredKycLevel, level);
        requiredKycLevel = level;
    }
    function setPaused(bool p) external onlyOwner {
        paused = p;
        emit Paused(p);
    }

    // —— 内部合规模块 ——
    modifier notPaused() { require(!paused, "PAUSED"); _; }

    function _checkKYC(address from, address to) internal view {
        require(!registry.blocked(from) && !registry.blocked(to), "BLOCKED");
        require(registry.kycLevel(from) >= requiredKycLevel, "KYC_LOW_FROM");
        require(registry.kycLevel(to)   >= requiredKycLevel, "KYC_LOW_TO");
    }

    // —— 标准 ERC20 ——（带 KYC 检查）
    function transfer(address to, uint256 amount) external override notPaused returns (bool) {
        _checkKYC(msg.sender, to);
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external override notPaused returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override notPaused returns (bool) {
        _checkKYC(from, to);
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "ALLOW");
        if (allowed != type(uint256).max) {
            unchecked { allowance[from][msg.sender] = allowed - amount; }
            emit Approval(from, msg.sender, allowance[from][msg.sender]);
        }
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "TO_ZERO");
        uint256 fromBal = balanceOf[from];
        require(fromBal >= amount, "BAL");
        unchecked {
            balanceOf[from] = fromBal - amount;
            balanceOf[to]   += amount;
        }
        emit Transfer(from, to, amount);
    }

    // —— 受控增减供给（子合约使用） ——
    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "TO_ZERO");
        // 对铸受者做 KYC 检查（仅 to）
        require(!registry.blocked(to), "BLOCKED");
        require(registry.kycLevel(to) >= requiredKycLevel, "KYC_LOW_TO");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal {
        uint256 bal = balanceOf[from];
        require(bal >= amount, "BAL");
        unchecked { balanceOf[from] = bal - amount; }
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }
}
