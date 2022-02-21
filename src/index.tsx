// index.tsx
import { Button, Box, Text,  Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App"
import { Ropsten, DAppProvider } from "@usedapp/core";
import { ethers, BigNumber } from 'ethers';


const config = {
  readOnlyChainId: Ropsten.chainId,
  readOnlyUrls: {
    [Ropsten.chainId]: "https://ropsten.infura.io/v3/93c6f5f4400c471da81104e6b61bf9f5",
  },
}
ReactDOM.render(
  <React.StrictMode>
    {/* 
       Wrap our app in the provider, config is required, 
        but can be left as an empty object: 
    */}
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);