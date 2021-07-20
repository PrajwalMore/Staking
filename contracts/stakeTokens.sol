//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract stakeTokens is ERC20{
    using SafeMath for uint256;
    //address[] internal stakeHolders;
    mapping(address=>uint256) internal stake;
    mapping(address=>address) internal stakeHolders;
    mapping(address=>uint256) public timestampMap;
    uint256 cntr=0;
    constructor(uint256 _totalSupply) ERC20("stake","STKN")
   {
       _mint(msg.sender, _totalSupply);
   }
  
        
         //For staking tokens.
        function stakeToken(uint256 _stakeAmt) public{
            transfer(address(this),_stakeAmt);
            if(stake[msg.sender]==0){ addStakeHolder(msg.sender);}
            stake[msg.sender]=stake[msg.sender].add(_stakeAmt);
            //Adding timestamp.
            timestampMap[msg.sender]=block.timestamp;
        }
   
        
        function isStakeHolder(address _stakeHolderAddr) public view returns(bool){
            
                if(stakeHolders[_stakeHolderAddr]==_stakeHolderAddr){
                     return (true);
                }
            
            return (false);
        }
       
       function addStakeHolder(address _stakeHolderAddr) public{
           (bool holdsStackHolder)=isStakeHolder(_stakeHolderAddr);
           if( !holdsStackHolder){
               stakeHolders[_stakeHolderAddr]=_stakeHolderAddr;
           }
        }
        
        function removeStakeHolder(address _stakeHolderAddr) internal{ 
            (bool holdsStackHolder)=isStakeHolder(_stakeHolderAddr);// Need to implement
            if(holdsStackHolder){
                delete stakeHolders[_stakeHolderAddr];
            }
        }
        
        
       //Function to get stake of an addrss.
       function stakeOf(address _stakeHolderAddr) external view returns(uint256){
           return stake[_stakeHolderAddr];
       }
   
        
        function removeStake(uint256 _stakeAmt) internal{
            stake[msg.sender]=stake[msg.sender].sub(_stakeAmt);//subtract amount of stake.
            if(stake[msg.sender]==0) removeStakeHolder(msg.sender);//if stake amount dont exists then remove from mapping.
        }
        
        event evt(uint256 reward);
        
        //Withdraw adds reward only if time after amount staked is greater than 5 minutes.
        function withdraw() external{
        require(stake[msg.sender]!=0,"You haven't staked anything.");
        uint256 userStake=stake[msg.sender];
        uint256 reward;
        uint tt=block.timestamp-timestampMap[msg.sender];
        if ( tt > 5 minutes){
            uint256 interest=(tt/5 minutes)*2;
             reward = (userStake.mul(interest)).div(100);
        }else{
            reward=0;
        }
        
        removeStake(userStake);
        _transfer(address(this),msg.sender,reward+userStake);
        emit evt(reward);
        }
        
        function timeAfterStaked() external view returns(uint timeInMinutes){
            require(timestampMap[msg.sender]!=0,"You have to stake first!!!");
            uint inSeconds=block.timestamp-timestampMap[msg.sender];
            uint diff = inSeconds/60 ;
            return diff;
        }
        
         
}
