const stakeTokens = artifacts.require("./stakeTokens.sol");
//const getWeb3= artifacts.require("./D:/My-Projects/token_staking/client/src/getWeb3");
//const BN = web3.utils.BN;
const chai = require("./setupchai.js");
let catchRevert = require("./exceptions.js").catchRevert;
const truffleAssert = require('truffle-assertions');

const expect = chai.expect;
const {
    balance,
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const exp = require("constants");
const { assert } = require("./setupchai.js");

contract("stakeTokens", accounts => {
    const [deployerAccount, staker, userThird] = accounts;

    beforeEach(async () => {
        instance = await stakeTokens.new("1000000000000000000000");
        instance.transfer(instance.address, "100000000000000000000", { from: deployerAccount });//transferring to stakeTokens contract
    });


    it("contract holds atleast some amount tokens.", async () => {
        return expect(instance.balanceOf(instance.address)).to.not.equal(0);
    });
    it("User can stake tokens.", async () => {
        //this.web3=await getWeb3();
        //let stakeAmount = this.web3.toWei("10","ether");
        let stakeAmount = "10000000000000000000";
        await instance.transfer(staker, "100000000000000000000", { from: deployerAccount });
        await instance.stakeToken(stakeAmount, { from: staker });
        let holdsStake = await instance.stakeOf(staker);
        return expect(holdsStake.toString()).to.equal(stakeAmount.toString());
    });
    it("Deployer/ owner can send tokens to other addresses.", async () => {
        let stakerBalanceBefore = instance.balanceOf(staker);
        await instance.transfer(staker, 10, { from: deployerAccount });
        let stakerBalanceAfter = instance.balanceOf(staker);
        return expect(stakerBalanceBefore).to.not.equal(stakerBalanceAfter);
    });
    it("User can withdraw reward.", async () => {
        let stakeAmount = "10000000000000000000";
        await instance.transfer(staker, "100000000000000000000", { from: deployerAccount });
        let stakerBalanceBefore = await instance.balanceOf(staker);
        await instance.stakeToken(stakeAmount, { from: staker });

        await instance.withdraw({ from: staker });
        let stakerBalanceAfter = await instance.balanceOf(staker);

        return expect(stakerBalanceBefore.toString()).to.equal(stakerBalanceAfter.toString());//assuming that staker is withdrawing before 5 minutes in this case.
    });
    // it("After withdrawing reward interest gets added to accounts.", async () => {
    //     let stakeAmount = "10000000000000000000";
    //     await instance.transfer(staker, "100000000000000000000", { from: deployerAccount });
    //     let stakerBalanceBefore = await instance.balanceOf(staker);
    //     await instance.stakeToken(stakeAmount, { from: staker });
    //     //console.log( +stakerBalanceBefore + 200000000000000000);
    //     console.log('wait for 5 minutes for earning reward');
    //     await sleep(400000);//5 minutes
    //     //await sleep(30000); //30 seconds

    //     instance.withdraw({ from: staker });
    //     let stakerBalanceAfter = await instance.balanceOf(staker);
    //     //console.log("stake balance:",stakerBalanceAfter);
    //     let interest=200000000000000000;
    //     return expect(stakerBalanceAfter.toString()).to.equal(( +stakerBalanceBefore + +interest).toString());//assuming that staker is withdrawing after 5 minutes in this case.
    // }).timeout(500000); // uncomment while testing...
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    it("User can withdraw reward and after withdrawing reward staker's reward becomes 0", async () => {
        let stakeAmount = "10000000000000000000";
        await instance.transfer(staker, "100000000000000000000", { from: deployerAccount });
        await instance.stakeToken(stakeAmount, { from: staker });
        await instance.withdraw({ from: staker });
        let stakeOfstaker = await instance.stakeOf(staker);
        return expect(stakeOfstaker.toString()).to.equal("0");
    });

    it("User can check time after token staked.", async () => {
        let stakeAmount = "10000000000000000000";
        await instance.transfer(staker, "100000000000000000000", { from: deployerAccount });
        await instance.stakeToken(stakeAmount, { from: staker });
        return expect(await instance.timeAfterStaked({ from: staker })).to.not.equal(0);
        
    });

    it("should revert if user tries to call timeAfterStaked() without staking", async () => {
           await truffleAssert.reverts(instance.timeAfterStaked({ from: userThird }));
        
    });

    it("It's not possible withdraw if caller haven't staked.", async () => {
      
            await truffleAssert.reverts(instance.withdraw({ from: userThird }));
        
    });

});
