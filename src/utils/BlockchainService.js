import Web3 from "web3";
import abi from "../abis/TimelessNFTs.json";

const { ethereum } = window;
window.web3 = new Web3(ethereum);
window.web3 = new Web3(window.web3.currentProvider);

const accAddress = JSON.parse(localStorage.getItem("createNftAccount"));
const getEtheriumContract = async () => {
  const web3 = window.web3;
  const networkId = await web3.eth.net.getId();
  const networkData = abi.networks[networkId];

  if (networkData) {
    const contract = new web3.eth.Contract(abi.abi, networkData.address);
    return contract;
  } else {
    return null;
  }
};

export const connectWallet = async (setOwnerAccAddress) => {
  try {
    if (!ethereum) return alert("Please install Metamask");
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    setOwnerAccAddress(accounts[0]);
    localStorage.setItem("createNftAccount", JSON.stringify(accounts[0]));
  } catch (error) {
    reportError(error);
  }
};

export const isAccountWallectConnected = async (setOwnerAccAddress) => {
  try {
    if (!ethereum) return reportError("Please install Metamask");
    const accounts = await ethereum.request({ method: "eth_accounts" });
    window.ethereum.on("chainChanged", (chainId) => {
      window.location.reload();
    });

    window.ethereum.on("accountsChanged", async () => {
      await isAccountWallectConnected(setOwnerAccAddress);
    });

    if (accounts.length) {
      setOwnerAccAddress(accounts[0])
      localStorage.setItem("createNftAccount", JSON.stringify(accounts[0]));
      return accounts[0]
    } else {
      console.log("Please connect wallet.");
    }
  } catch (error) {
    reportError(error);
  }
};

export const mintNFT = async ({ title, description, metadataURI, price }) => {
  try {
    price = window.web3.utils.toWei(price.toString(), "ether");
    const contract = await getEtheriumContract();
    const mintPrice = window.web3.utils.toWei("0.01", "ether");

    await contract?.methods
      .payToMint(title, description, metadataURI, price)
      .send({
        from: accAddress,
        value: mintPrice,
      });
    return true;
  } catch (error) {
    reportError(error);
  }
};

const structuredNfts = (nfts) => {
  return nfts
    .map((nft) => ({
      id: Number(nft.id),
      owner: nft.owner,
      cost: window.web3.utils.fromWei(nft.cost),
      title: nft.title,
      description: nft.description,
      metadataURI: nft.metadataURI,
      timestamp: nft.timestamp,
    }))
    .reverse();
};

export const getAllNFTs = async () => {
  try {
    if (!ethereum) return reportError("Please install Metamask");

    const contract = await getEtheriumContract();
    const nfts = await contract.methods.getAllNFTs().call();
    const transactions = await contract.methods.getAllTransactions().call();
    return structuredNfts(nfts);
  } catch (error) {
    reportError(error);
  }
};

export const updateNFT = async ({ id, cost }) => {
  try {
    cost = window.web3.utils.toWei(cost?.toString(), "ether");
    const contract = await getEtheriumContract();
    const resp=await contract.methods
      .changePrice(Number(id), cost)
      .send({ from: accAddress });
      return resp
  } catch (error) {
    reportError(error);
  }
};

export const buyNFT = async ({ id, cost }) => {
  try {
    cost = window.web3.utils.toWei(cost.toString(), "ether");
    const contract = await getEtheriumContract();
    const resp=await contract.methods
      .payToBuy(Number(id))
      .send({ from: accAddress, value: cost });
    return resp;
  } catch (error) {
    reportError(error);
  }
};
