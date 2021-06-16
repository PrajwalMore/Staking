//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
contract stakingContract is ERC20{
    using SafeMath for uint256;
    address[] internal stakeHolders;
    mapping(address=>uint256) internal stake;
    
    constructor(uint256 _totalSupply) ERC20("stake","STKN")
   {
       _mint(msg.sender, _totalSupply);
   }
  //function transfer()
        
         //For staking tokens.
        function stakeToken(uint256 _stakeAmt) public{
            _burn(msg.sender,_stakeAmt);
            if(stake[msg.sender]==0){ addStakeHolder(msg.sender);}
            stake[msg.sender]=stake[msg.sender].add(_stakeAmt);
        }
   
        function isStakeHolder(address _stakeHolderAddr) public view returns(bool,uint256){
            for(uint256 i=0;i<stakeHolders.length;i+=1){
                if( _stakeHolderAddr==stakeHolders[i]){
                    return (true,i); // this means _stakeHolderAddr is stored at ith index.
                }
            }
            return (false,0);
        }
       
       function addStakeHolder(address _stakeHolderAddr) public{
           (bool holdsStackHolder,)=isStakeHolder(_stakeHolderAddr);
           if( !holdsStackHolder){
               stakeHolders.push(_stakeHolderAddr);
           }
        }
        
        function removeStackeHolder(address _stakeHolderAddr) public{ 
            (bool holdsStackHolder,uint256 idx)=isStakeHolder(_stakeHolderAddr);
            if(holdsStackHolder){
                stakeHolders[idx] = stakeHolders[stakeHolders.length - 1];
                stakeHolders.pop();
            }
        }
        
        
       //Function to get stake of an addrss.
       function stakeOf(address _stakeHolderAddr) public view returns(uint256){
           return stake[_stakeHolderAddr];
       }
   
        
        function removeStake(uint256 _stakeAmt) public{
            stake[msg.sender]=stake[msg.sender].sub(_stakeAmt);//subtract amount of stake.
            if(stake[msg.sender]==0) removeStackeHolder(msg.sender);//if stake amount dont exists then remove from mapping.
            _mint(msg.sender,_stakeAmt);
        }
        
        
        function withdraw() public{
        require(stake[msg.sender]!=0,"You haven't staked anything.");
        uint256 reward = (stake[msg.sender].mul(2)).div(100);// 2%
        _mint(msg.sender, reward+stake[msg.sender]);
        }
}