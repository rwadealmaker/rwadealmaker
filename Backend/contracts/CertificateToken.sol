// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CompliantERC20.sol";

/// @title CertificateToken (transferable, KYC-gated)
/// @notice 部署两次=本金币(LPRI)/利息币(LINT)。通过 setController 绑定发行控制器，仅控制器可铸/销。
contract CertificateToken is CompliantERC20 {
    address public controller;  // 发行/赎回控制器（如 LoanIssuer）

    modifier onlyController() {
        require(msg.sender == controller, "CTRL");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _registry
    ) CompliantERC20(_name, _symbol, _registry) {}

    /// @notice 仅 token owner 可更换控制器
    function setController(address c) external onlyOwner { controller = c; }

    /// @notice 仅控制器可铸/销
    function mint(address to, uint256 amount) external onlyController { _mint(to, amount); }
    function burn(address from, uint256 amount) external onlyController { _burn(from, amount); }
}
