import { useDispatch } from "react-redux";
import "./App.css";
import { useEffect } from "react";
import {
  loadAccount,
  loadExchange,
  loadNetwork,
  loadProvider,
  loadToken,
  subscribeToEvent,
} from "./Store/Interactions";
import Body from "./Components/Body/Body";
import config from "./config.json";
import Alert from "./Components/Alert/Alert";
function App() {
  const dispatch = useDispatch();
  const loadBlockchainData = async () => {
    const provider = loadProvider(dispatch);
    const chainId = await loadNetwork(provider, dispatch);
    window.ethereum.on("accountsChanged", () => {
      loadAccount(provider, dispatch);
    });
    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
    const token_config = config[chainId].Token;
    const token = await loadToken(provider, token_config.address, dispatch);
    const exchange_config = config[chainId].Exchange;
    const exchange = await loadExchange(
      provider,
      exchange_config.address,
      dispatch
    );
    subscribeToEvent(token, dispatch);
  };
  useEffect(() => {
    loadBlockchainData();
  });
  return (
    <div className="App">
      <Body />
      <Alert />
    </div>
  );
}

export default App;
