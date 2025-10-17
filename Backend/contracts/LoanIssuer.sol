// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Ownable.sol";
import "./KYCRegistry.sol";
import "./CertificateToken.sol";

/// @title LoanIssuer
/// @notice 贷款生命周期业务控制器：创建→计息→赎回→结清
contract LoanIssuer is Ownable {
    struct Loan {
        uint256 principal;
        uint256 annualRateBps;
        uint64  startDate;
        uint64  dueDate;
        string  borrower;
        string  lender;
        string  collateral;
        string  note;
        bool    closed;
    }

    /// @dev 为避免“Stack too deep”，把 createLoan 的输入合并为结构体
    struct LoanInput {
        address holder;
        uint256 principalAmount;
        uint256 annualRateBps;
        uint64  startDate;
        uint64  dueDate;
        string  borrower;
        string  lender;
        string  collateral;
        string  note;
    }

    KYCRegistry      public registry;
    CertificateToken public principalToken; // LPRI
    CertificateToken public interestToken;  // LINT

    uint256 public nextLoanId;
    mapping(uint256 => Loan)    public loans;
    mapping(uint256 => address) public loanHolder;

    event CreateLoan(uint256 indexed loanId, address indexed holder, uint256 principal, uint256 rateBps);
    event MintInterest(uint256 indexed loanId, address indexed to, uint256 amount);
    event Redeem(uint256 indexed loanId, address indexed from, uint256 principalBurn, uint256 interestBurn);
    event CloseLoan(uint256 indexed loanId);

    constructor(address _registry, address _principalToken, address _interestToken) {
        registry = KYCRegistry(_registry);
        principalToken = CertificateToken(_principalToken);
        interestToken  = CertificateToken(_interestToken);
    }

    /// @notice 绑定控制器到两枚 Token（部署后必须执行一次）
    function wireControllers() external onlyOwner {
        principalToken.setController(address(this));
        interestToken.setController(address(this));
    }

    /// @notice 创建贷款并向持有人铸造本金币（LPRI）
    function createLoan(LoanInput calldata p) external onlyOwner returns (uint256 loanId) {
        require(!registry.blocked(p.holder), "BLOCKED");
        require(registry.kycLevel(p.holder) >= principalToken.requiredKycLevel(), "KYC_LOW");

        loanId = ++nextLoanId;

        // 分步写入 storage，避免 Stack too deep
        Loan storage L = loans[loanId];
        L.principal      = p.principalAmount;
        L.annualRateBps  = p.annualRateBps;
        L.startDate      = p.startDate;
        L.dueDate        = p.dueDate;
        L.borrower       = p.borrower;
        L.lender         = p.lender;
        L.collateral     = p.collateral;
        L.note           = p.note;
        L.closed         = false;

        loanHolder[loanId] = p.holder;

        principalToken.mint(p.holder, p.principalAmount);
        emit CreateLoan(loanId, p.holder, p.principalAmount, p.annualRateBps);
    }

    /// @notice 按期铸造利息币（LINT），利息额链下计算
    function mintInterest(uint256 loanId, address to, uint256 amount) external onlyOwner {
        require(!loans[loanId].closed, "CLOSED");
        require(!registry.blocked(to), "BLOCKED");
        require(registry.kycLevel(to) >= interestToken.requiredKycLevel(), "KYC_LOW");
        interestToken.mint(to, amount);
        emit MintInterest(loanId, to, amount);
    }

    /// @notice 赎回：燃烧持有人的 LPRI/LINT；现金/USDT 结算在链下或其他模块
    function redeem(uint256 loanId, uint256 principalAmt, uint256 interestAmt) external {
        require(!loans[loanId].closed, "CLOSED");

        if (principalAmt > 0) {
            require(principalToken.balanceOf(msg.sender) >= principalAmt, "LPRI_BAL");
            principalToken.burn(msg.sender, principalAmt);
        }
        if (interestAmt > 0) {
            require(interestToken.balanceOf(msg.sender) >= interestAmt, "LINT_BAL");
            interestToken.burn(msg.sender, interestAmt);
        }
        emit Redeem(loanId, msg.sender, principalAmt, interestAmt);
    }

    /// @notice 结清贷款（后续禁止计息与赎回）
    function closeLoan(uint256 loanId) external onlyOwner {
        loans[loanId].closed = true;
        emit CloseLoan(loanId);
    }
}
