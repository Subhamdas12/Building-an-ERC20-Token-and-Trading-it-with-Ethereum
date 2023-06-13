import { ethers } from "ethers";
import TOKEN_ABI from "../Abis/Token.json";
import EXCHANGE_ABI from "../Abis/Exchange.json";
export const loadProvider = (dispatch) => {
  const connection = new ethers.providers.Web3Provider(window.ethereum);
  dispatch({ type: "PROVIDER_LOADED", connection });
  return connection;
};

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork();
  dispatch({ type: "NETWORK_LOADED", chainId });
  return chainId;
};

export const loadAccount = async (provider, dispatch) => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = ethers.utils.getAddress(accounts[0]);
  dispatch({ type: "ACCOUNT_LOADED", account });
  let balance = await provider.getBalance(account);
  balance = ethers.utils.formatEther(balance);
  dispatch({ type: "ETHER_BALANCE_LOADED", balance });
  return account;
};
export const loadToken = async (provider, address, dispatch) => {
  let token, symbol;
  token = new ethers.Contract(address, TOKEN_ABI, provider);
  symbol = await token.getSymbol();
  dispatch({ type: "TOKEN_LOADED", token, symbol });
  return token;
};
export const loadExchange = async (provider, address, dispatch) => {
  let exchange;
  exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
  dispatch({ type: "EXCHANGE_LOADED", exchange });
};
export const getTokenBalance = async (token, account, dispatch) => {
  let balance = await token.balanceOf(account);
  balance = await ethers.utils.formatEther(balance);
  dispatch({ type: "TOKEN_BALANCE_LOADED", tokenBalance: balance });
};

export const tradeToken = async (
  provider,
  exchange,
  transferType,
  token,
  amount,
  account,
  dispatch
) => {
  let transaction;
  dispatch({ type: "TRANSFER_REQUEST" });
  try {
    amount = Number(amount);
    let signer = await provider.getSigner();
    let amountOfToken = ethers.utils.parseEther(amount.toString());
    let eachValue = await exchange.value();
    let totalValue = amount * eachValue;
    totalValue = await ethers.BigNumber.from(totalValue.toString());
    if (transferType === "Buy") {
      transaction = await exchange
        .connect(signer)
        .buyToken(amountOfToken, { from: account, value: totalValue });
      await transaction.wait();
    } else {
      transaction = await token
        .connect(signer)
        .approve(exchange.address, totalValue);
      await transaction.wait();
      transaction = await exchange.connect(signer).sellToken(amountOfToken);
      await transaction.wait();
    }
  } catch (error) {
    dispatch({ type: "TRANSFER_FAILURE" });
  }
};
export const subscribeToEvent = (token, dispatch) => {
  token.on("Token__Transfer", (from, to, value, event) => {
    dispatch({ type: "TRANSFER_SUCCESS", event });
  });
};
