//SPDX-License-Identifier:UNLICENSED
import "./Token.sol";

contract Exchange {
    uint256 public value;
    address public owner;
    Token public token;
    uint256 public constant DECIMAL = 18;
    mapping(address => uint256) public purchase;

    constructor(uint256 _value, address _token) {
        owner = msg.sender;
        token = Token(_token);
        value = _value * 10 ** DECIMAL;
    }

    function buyToken(uint256 _amount) public payable returns (bool) {
        require(
            (_amount * value) / 10 ** DECIMAL == msg.value,
            "Invalid amount"
        );
        require(
            token.balanceOf(address(this)) >= _amount,
            "We dont have that much amount"
        );
        require(
            token.transfer(address(this), msg.sender, _amount),
            "Transfer failed"
        );
        purchase[msg.sender] += msg.value;
        return true;
    }

    function sellToken(uint256 _amount) public returns (bool) {
        require(token.balanceOf(msg.sender) >= _amount, "Insufficient balance");
        require(
            purchase[msg.sender] >= (_amount * value) / 10 ** DECIMAL,
            "Insufficient purcahse"
        );
        token.transferFrom(msg.sender, address(this), _amount);
        payable(msg.sender).transfer((_amount * value) / 10 ** DECIMAL);
        purchase[msg.sender] -= (_amount * value) / 10 ** DECIMAL;
        return true;
    }
}
