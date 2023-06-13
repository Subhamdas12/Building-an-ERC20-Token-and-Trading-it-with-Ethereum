//SDPX-License-Identifier:UNLICENSED
pragma solidity ^0.8.0;

contract Token {
    string public name;
    string public symbol;
    uint256 public constant DECIMAL = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * 10 ** DECIMAL;
        balanceOf[msg.sender] = totalSupply;
    }

    event Token__Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );

    event Token__Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    function transfer(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool) {
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(_to != address(0), "Invalid address");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Token__Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        require(_spender != address(0), "Invalid address");
        require(_value <= balanceOf[msg.sender], "Insufficient balance");
        allowance[msg.sender][_spender] += _value;
        emit Token__Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool) {
        require(_from != address(0), "Invalid address");
        require(_to != address(0), "Invalid address");
        require(_value <= balanceOf[_from], "Insufficient balance");
        require(
            allowance[_from][msg.sender] >= _value,
            "Insufficient allowance"
        );
        transfer(_from, _to, _value);
        allowance[_from][msg.sender] -= _value;
        return true;
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function getSymbol() public view returns (string memory) {
        return symbol;
    }

    function getTotalSupply() public view returns (uint256) {
        return totalSupply;
    }
}
