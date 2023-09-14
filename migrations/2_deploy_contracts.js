/* eslint-disable no-undef */
const TimelessNFTs = artifacts.require('TimelessNFTs')

module.exports = async (deployer) => {
  const accounts = await web3.eth.getAccounts()
console.log("accounts",accounts);
  await deployer.deploy(TimelessNFTs, 'Timeless NFTs', 'TNT', 10, accounts[1])
}
