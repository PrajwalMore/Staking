var stakeTokens = artifacts.require("./stakeTokens.sol");

module.exports = function(deployer) {
  deployer.deploy(stakeTokens,"1000000000000000000000");
};
