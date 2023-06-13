import React from "react";
import "./body.css";
import { useDispatch, useSelector } from "react-redux";
import config from "../../config.json";
import {
  getTokenBalance,
  loadAccount,
  tradeToken,
} from "../../Store/Interactions";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
const Body = () => {
  const provider = useSelector((state) => state.Provider.connection);
  const chainId = useSelector((state) => state.Provider.chainId);
  const account = useSelector((state) => state.Provider.account);
  const balance = useSelector((state) => state.Provider.balance);
  const token = useSelector((state) => state.token.contract);
  const tokenbalance = useSelector((state) => state.token.tokenBalance);
  const symbol = useSelector((state) => state.token.symbol);
  const exchange = useSelector((state) => state.exchange.contract);
  const transferInProgress = useSelector(
    (state) => state.token.transferInProgress
  );
  const buyRef = useRef(null);
  const sellRef = useRef(null);
  const [isBuy, setIsBuy] = useState(true);
  const [amount, setAmount] = useState(0);
  const dispatch = useDispatch();
  const connectHandler = async () => {
    await loadAccount(provider, dispatch);
  };
  const networkHandler = async (e) => {
    await window.ethereum.requrest({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: e.target.value,
        },
      ],
    });
  };
  const tabHandler = (e) => {
    if (e.target.className !== buyRef.current.className) {
      e.target.className = "tab tab--active";
      buyRef.current.className = "tab";
      setIsBuy(false);
    } else {
      e.target.className = "tab tab--active";
      sellRef.current.className = "tab";
      setIsBuy(true);
    }
  };
  const submitHandler = (e) => {
    e.preventDefault();
    if (isBuy) {
      tradeToken(provider, exchange, "Buy", token, amount, account, dispatch);
    } else {
      tradeToken(provider, exchange, "Sell", token, amount, account, dispatch);
    }
    setAmount(0);
  };
  useEffect(() => {
    if (token && account && dispatch) {
      getTokenBalance(token, account, dispatch);
      loadAccount(provider, dispatch);
    }
  }, [account, token, transferInProgress]);
  return (
    <div className="form-container">
      <div className="navbar">
        {account ? (
          <div className="details">
            <label className="balance-label">
              Balance : {Number(balance).toFixed(4)}
            </label>
            <label className="account-address">
              Account : {account.slice(0, 5) + "...." + account.slice(38, 42)}
            </label>
            <label className="account-address">Token Symvol : {symbol}</label>
            <label className="account-address">
              Token Amount : {tokenbalance}
            </label>
          </div>
        ) : (
          <div className="details">
            <button className="account-address" onClick={connectHandler}>
              Connect
            </button>
          </div>
        )}
        <select
          name="networks"
          id="networks"
          onChange={networkHandler}
          value={config[chainId] ? `0x${chainId.toString(16)}` : `0`}
          className="network-select"
        >
          <option value="0" disabled>
            Select Network
          </option>
          <option value="0x7A69">Localhost</option>
          <option value="0xaa36a7">Seplia</option>
        </select>
      </div>
      <div className="">
        {account ? (
          <div>
            <h2>Trade form</h2>
            <div className="tabs">
              <button
                ref={buyRef}
                onClick={tabHandler}
                className="tab tab--active"
              >
                Buy
              </button>
              <button ref={sellRef} onClick={tabHandler} className="tab">
                Sell
              </button>
            </div>
            {isBuy ? (
              <form className="buyForm">
                <label htmlFor="buy-amount">Amount of token (BUY) : </label>
                <input
                  type="number"
                  id="buy-amount"
                  name="buy-amount"
                  placeholder="1 ETH"
                  onChange={(e) => setAmount(e.target.value)}
                  value={amount === 0 ? "" : amount}
                />
                <button type="submit" onClick={submitHandler}>
                  BUY
                </button>
              </form>
            ) : (
              <form className="sellForm">
                <label htmlFor="sell-amount">Amount of token (SELL) : </label>
                <input
                  type="number"
                  id="sell-amount"
                  name="sell-amount"
                  placeholder="1 ETH"
                  onChange={(e) => setAmount(e.target.value)}
                  value={amount === 0 ? "" : amount}
                />
                <button type="submit" onClick={submitHandler}>
                  SELL
                </button>
              </form>
            )}
          </div>
        ) : (
          <h2>Connect to metamask</h2>
        )}
      </div>
    </div>
  );
};

export default Body;
