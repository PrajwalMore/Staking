//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
import "./NFTContractImplementation.sol";
contract AirDrop is ERC20{
    uint256 noOfTokens=2 ether;// 2 ERC20 tokens for 1 NFT
    NFTContract nc;
    constructor(address _nftAddress) ERC20("Name change tokens","NCT"){
        nc=NFTContract(_nftAddress);
        _mint(address(this),20*(10**18));
    }
    //user will claim airdrop tokens.
    event evt(uint256 amt);
    function claim() public{
        //transfer specific amount to msg.sender if msg.sender have bought NFT.
        uint256 senderOwns= nc.balanceOf(msg.sender);
        require(senderOwns>0,"You have to buy NFT before claiming your tokens");
        uint256 amtToSend=senderOwns*noOfTokens;
        emit evt(amtToSend);
        _transfer(address(this),msg.sender,amtToSend);
    }
}
