import {
  mainnet,
  arbitrum,
  optimism,
  bsc,
  base,
  sepolia,
  hardhat,
  anvil,
  AppKitNetwork,
} from "@reown/appkit/networks";

export const WALLET_CONNECT_APP_ID = "9ffbfff45304d9a03613d3938cab9585";

export const APPKIT_METADATA = {
  name: "eth_sign_diary",
  description: "Secure your content with ethereum key",
  url: "http://localhost:5173",
  icons: [],
};

export const AVAILABLE_CHAINS: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  arbitrum,
  optimism,
  bsc,
  base,
  sepolia,
  hardhat,
  anvil,
];
