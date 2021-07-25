const stakeTokens = artifacts.require("./stakeTokens.sol");

const chai = require("./setupchai.js");
let catchRevert = require("./exceptions.js").catchRevert;
const truffleAssert = require('truffle-assertions');

const expect = chai.expect;

const exp = require("constants");
const { assert } = require("./setupchai.js");

contract("stakeTokens", accounts => {
    const [deployerAccount, staker, userThird] = accounts;

    beforeEach(async () => {
        instance = await stakeTokens.new(web3.utils.toWei("1000", "ether"));
        instance.transfer(instance.address, web3.utils.toWei("100", "ether"), { from: deployerAccount });//transferring to stakeTokens contract
    });


    it("contract holds atleast some amount tokens.", async () => {
        return expect(instance.balanceOf(instance.address)).to.not.equal(0);
    });
    it("User can stake tokens.", async () => {
        let stakeAmount = web3.utils.toWei("10", "ether");
        await instance.transfer(staker, web3.utils.toWei("100", "ether"), { from: deployerAccount });
        await instance.stakeToken(stakeAmount, { from: staker });
        let holdsStake = await instance.stakeOf(staker);
        return expect(holdsStake.toString()).to.equal(stakeAmount.toString());
    });
    it("Deployer/ owner can send tokens to other addresses.", async () => {
        let stakerBalanceBefore = instance.balanceOf(staker);
        await instance.transfer(staker, web3.utils.toWei("10", "ether"), { from: deployerAccount });
        let stakerBalanceAfter = instance.balanceOf(staker);
        return expect(stakerBalanceBefore).to.not.equal(stakerBalanceAfter);
    });
    it("User can withdraw reward.", async () => {
        let stakeAmount = web3.utils.toWei("10", "ether");
        await instance.transfer(staker, web3.utils.toWei("100", "ether"), { from: deployerAccount });
        let stakerBalanceBefore = await instance.balanceOf(staker);
        await instance.stakeToken(stakeAmount, { from: staker });

        await instance.withdraw({ from: staker });
        let stakerBalanceAfter = await instance.balanceOf(staker);

        return expect(stakerBalanceBefore.toString()).to.equal(stakerBalanceAfter.toString());//assuming that staker is withdrawing before 5 minutes in this case.
    });
    it("After withdrawing reward interest gets added to accounts.", async () => {
        let stakeAmount = web3.utils.toWei("10","ether");
        await instance.transfer(staker, web3.utils.toWei("100","ether"), { from: deployerAccount });
        let stakerBalanceBefore = await instance.balanceOf(staker);
        await instance.stakeToken(stakeAmount, { from: staker });
        //console.log( +stakerBalanceBefore + 200000000000000000);
        console.log('wait for 5 minutes for earning reward');
        await sleep(400000);//5 minutes
        

        instance.withdraw({ from: staker });
        let stakerBalanceAfter = await instance.balanceOf(staker);
        let interest=200000000000000000;
        return expect(stakerBalanceAfter.toString()).to.equal(( +stakerBalanceBefore + +interest).toString());//assuming that staker is withdrawing after 5 minutes in this case.
    }).timeout(500000); 
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    it("User can withdraw reward and after withdrawing reward staker's reward becomes 0", async () => {
        let stakeAmount = web3.utils.toWei("10", "ether");
        await instance.transfer(staker, web3.utils.toWei("100", "ether"), { from: deployerAccount });
        await instance.stakeToken(stakeAmount, { from: staker });
        await instance.withdraw({ from: staker });
        let stakeOfstaker = await instance.stakeOf(staker);
        return expect(stakeOfstaker.toString()).to.equal("0");
    });

    it("User can check time after token staked.", async () => {
        let stakeAmount = web3.utils.toWei("10", "ether");
        await instance.transfer(staker, web3.utils.toWei("100", "ether"), { from: deployerAccount });
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
