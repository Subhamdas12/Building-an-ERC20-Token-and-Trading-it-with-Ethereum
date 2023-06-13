export const Provider = (state = {}, action) => {
  switch (action.type) {
    case "PROVIDER_LOADED":
      return {
        ...state,
        connection: action.connection,
      };
    case "NETWORK_LOADED":
      return {
        ...state,
        chainId: action.chainId,
      };
    case "ACCOUNT_LOADED":
      return {
        ...state,
        account: action.account,
      };
    case "ETHER_BALANCE_LOADED":
      return {
        ...state,
        balance: action.balance,
      };
    default:
      return state;
  }
};
export const token = (
  state = {
    loaded: false,
    contract: {},
    symbol: {},
    transaction: { isSuccessful: false },
    events: [],
  },
  action
) => {
  switch (action.type) {
    case "TOKEN_LOADED":
      return {
        ...state,
        loaded: true,
        contract: action.token,
        symbol: action.symbol,
      };
    case "TOKEN_BALANCE_LOADED":
      return {
        ...state,
        tokenBalance: action.tokenBalance,
      };

    case "TRANSFER_REQUEST":
      return {
        ...state,
        transaction: {
          isSuccessful: false,
          isPending: true,
        },
        transferInProgress: true,
      };
    case "TRANSFER_SUCCESS":
      return {
        ...state,
        transaction: {
          isSuccessful: true,
          isPending: false,
        },
        transferInProgress: false,
        events: [action.event, ...state.events],
      };
    case "TRANSFER_FAILURE":
      return {
        ...state,
        transaction: {
          isSuccessful: false,
          isPending: false,
          isError: true,
        },
        transferInProgress: false,
      };
    default:
      return state;
  }
};

export const exchange = (state = { loaded: false, contract: {} }, action) => {
  switch (action.type) {
    case "EXCHANGE_LOADED":
      return {
        ...state,
        loaded: true,
        contract: action.exchange,
      };
    default:
      return state;
  }
};
