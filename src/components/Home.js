import { create } from "ipfs-http-client";
import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";
import {
  buyNFT,
  connectWallet,
  getAllNFTs,
  isAccountWallectConnected,
  mintNFT,
  updateNFT,
} from "../utils/BlockchainService";

const Home = () => {
  const auth =
    "Basic " +
    Buffer.from(
      "2Gg95YqQ672apEtGQbewfwGQANc" + ":" + "b2c85789868e83772bfbc59ddd6d09bb"
    ).toString("base64");

  const client = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  const [showNftForm, setShowNftForm] = useState(false);
  const [changePrice, setChangePrice] = useState(false);
  const [updatePriceId, setUpdatePriceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [nftData, setNftData] = useState([]);
  const walletOwner = JSON.parse(localStorage.getItem("createNftAccount"));
  const [ownerAccAddress, setOwnerAccAddress] = useState(walletOwner || "");

  useEffect(() => {
    async function fetchData() {
      const resp=await isAccountWallectConnected(setOwnerAccAddress);
    }
    fetchData();
  }, []);
    
  const truncatedString = `${ownerAccAddress?.slice(
    0,
    4
  )}...${ownerAccAddress?.slice(-4)}`;

  const createNft = () => {
    setPrice("");
    setTitle("");
    setDescription("");
    setChangePrice(false);
    setShowNftForm((state) => !state);
  };

  const handleConectWallet = () => {
    connectWallet(setOwnerAccAddress);
  };
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    const created = await client.add(image);
    const metadataURI = `https://ipfs.io/ipfs/${created.path}`;
    const nft = { title, price, description, metadataURI };
    const resp = await mintNFT(nft);
    setLoading(false);
    if (resp) {
      getAllData();
      setShowNftForm(false);
    }
  };

  const getAllData = async () => {
    const resp = await getAllNFTs();
    setNftData(resp);
  };
  useEffect(() => {
    getAllData();
  }, []);

  const handleChangePrice = async (item) => {
    setUpdatePriceId(item.id);
    setChangePrice(true);
    setPrice(item.cost);
    setTitle(item.title);
    setShowNftForm(false);
  };

  const handleUpdatePrice = async () => {
    setLoading(true);
    const resp = await updateNFT({ id: updatePriceId, cost: price });
    if (resp?.status) {
      setLoading(false);
      setChangePrice(false);
      getAllData();
    }
  };

  const handlePurchaseNft = async (item) => {
    const resp=await buyNFT({ id: item.id, cost: item.cost });
    if(resp?.status){
      getAllData();
    }
  };
  return (
    <div>
      {ownerAccAddress ? (
        <div>
          <p>{truncatedString}</p>
        </div>
      ) : (
        <button onClick={handleConectWallet}>Connect Wallet</button>
      )}
      <button onClick={createNft}>Create NFT</button>
      {showNftForm && (
        <div
          style={{
            display: "flex",
            marginTop: "20px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <form onSubmit={handleSubmitForm}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
              />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <input
                type="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button disabled={loading ? true : false} type="submit">
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {changePrice && (
        <div
          style={{
            display: "flex",
            marginTop: "20px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              margin: "20px 0",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <label>{title}</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <button
              disabled={loading ? true : false}
              onClick={handleUpdatePrice}
            >
              {loading ? "Updating..." : "Update Price"}
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        {nftData?.length === 0 ? (
          <h2>Loading...</h2>
        ) : (
          nftData?.map((item) => {
            return (
              <div
                style={{
                  border: "1px solid black",
                }}
                key={item.id}
              >
                <img
                  height="230px"
                  width="230px"
                  src={item.metadataURI}
                  alt="images"
                />
                <p>
                  Owner :{`${item.owner.slice(0, 4)}...${item.owner.slice(-4)}`}
                </p>
                <p>Cost : {item.cost} ETH</p>
                <p>Title : {item.title}</p>
                <p>Description : {item.description}</p>
                {ownerAccAddress && (
                  <>
                    {" "}
                    <button
                      disabled={
                        ownerAccAddress !== item.owner.toLowerCase()
                          ? true
                          : false
                      }
                      onClick={() => handleChangePrice(item)}
                    >
                      Change Price
                    </button>
                    <button
                      onClick={() => handlePurchaseNft(item)}
                      disabled={item.owner.toLowerCase() === ownerAccAddress}
                    >
                      Purchase NFT
                    </button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;
