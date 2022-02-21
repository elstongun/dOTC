// App.tsx
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  OrderedList,
  ListItem,
  UnorderedList,
  Button,
  Divider,
  Link,
} from "@chakra-ui/react";
import { ChakraProvider, useDisclosure } from "@chakra-ui/react";
import theme from "./theme";
import Layout from "./components/Layout";
import ConnectButton from "./components/ConnectButton";
import AccountModal from "./components/AccountModal";
import { Box, Center } from "@chakra-ui/react";
import React, { Component, useEffect, useState } from "react";
import "@fontsource/inter";
import { ethers, BigNumber } from "ethers";
import { utils } from "ethers";
import WETH_LENS_ABI from './abi/WETHLens.json';
import { Contract } from "@ethersproject/contracts";
import { useContractCall, useContractFunction, useEthers } from "@usedapp/core";
import {
  formatEther,
  formatUnits,
  parseUnits,
  parseEther,
} from "@ethersproject/units";
import { preProcessFile } from "typescript";
import { contractCallOutOfGasMock } from "@usedapp/testing";
import { Interface } from "@ethersproject/abi";
import "./App.css";
import "@usedapp/core";
import Web3 from "web3/dist/web3.min";
import { AbiItem } from 'web3-utils'
import Locked_WETH_ABI from './abi/LockedWETHOffer.json'
import erc20_abi from './abi/ERC20.json';
window.ethereum.enable();
declare let window: any;
const web3 = new Web3(window.web3.currentProvider);



//contracts and ABI's

const Offer_Factory_ADD = "0xB4e5b355811D197D155EAcEeE8AAce6e364dE850";

const Lens_ADD = "0xbb6692D85fF5E4269E78B7E64919e2c994dc9104";

let provider = new ethers.providers.Web3Provider(window.ethereum)

const signer = provider.getSigner()

let Lens_READ = new ethers.Contract(Lens_ADD, WETH_LENS_ABI, provider);

//
function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [ActiveOfferInfo, setActiveOfferInfo] = useState<any[]>([]);
  const [AddressList, setAddressList] = useState<any[]>([]);
  const [WETHBalances, setWETHBalances] = useState<any[]>([]);
  const [TokenWanted, setTokenWanted] = useState<any[]>([]);
  const [amountWanted, setamountWanted] = useState<any[]>([]);
  const [order_array, setorder_array] = useState<any[]>([]);
  const [sorted_array, setsorted_array] = useState<any[]>([]);
  const [Interface_Array, setInterface_Array] = useState<any[]>([]);
  const [Token_Ticker, setToken_Ticker] = useState<any[]>([]);
  const [PPW, setPPW] = useState<any[]>([]);
  const [ContractObjects, setContractObject] = useState<any[]>([]);
  let ActiveOffers = ActiveOfferInfo.length;

  const USDC = 0xa3f8e2fee6e754617e0f0917a1ba4f77de2d9423;
  const USDC_ADD = '0xa3f8e2fee6e754617e0f0917a1ba4f77de2d9423';
  const USDC_Contract = new ethers.Contract(USDC_ADD, erc20_abi, provider);

  useEffect(() => {
    const init = async () => {
      //CONTRACT READING
      const ActiveOfferInfo = await Lens_READ.getAllActiveOfferInfo(
        Offer_Factory_ADD
      );
      //BREAKING DOWN THE ORDER
      const AddressList = ActiveOfferInfo[0];
      const WETHBalances = ActiveOfferInfo[1];
      const TokenWanted = ActiveOfferInfo[2];
      const amountWanted = ActiveOfferInfo[3];
      const PPW = [];
      const ContractObjects = [];
      //CALCULATING PRICE PER WETH

      for (let j = 0; j <= ActiveOffers; j++) {
        let ppwValue = amountWanted[j] / WETHBalances[j];
        let contractInterface = new ethers.utils.Interface(Locked_WETH_ABI);
        let contract = new Contract(AddressList[j], contractInterface);

        PPW.push(ppwValue);
        ContractObjects.push(contract);
      }

      //CREATING AN ARRAY OF ORDERS

      let order_array = [];
      for (let k = 0; k <= ActiveOffers; k++) {
        if (TokenWanted[k] == USDC) {
          order_array.push([
            PPW[k],
            AddressList[k],
            WETHBalances[k],
            amountWanted[k],
            TokenWanted[k],
            ContractObjects[k]
          ]);
        } else {
          continue;
        }
      }
      //SORTING THE ARRAY BY PRICE PER WETH

      const sorted_array = order_array.sort((a, b) => b[0] - a[0]);
      console.log(sorted_array);



      setActiveOfferInfo(ActiveOfferInfo);
      setAddressList(AddressList);
      setWETHBalances(WETHBalances);
      setTokenWanted(TokenWanted);
      setamountWanted(amountWanted);
      setorder_array(order_array);
      setPPW(PPW);
      setsorted_array(sorted_array);
      setToken_Ticker(Token_Ticker);
      setInterface_Array(Interface_Array);
      setContractObject(ContractObjects);
    };
    init();
  }, []);
  
  const approval = async () => {
    const accounts = await web3.eth.getAccounts();
    const contractWithSigner = USDC_Contract.connect(signer);
    await contractWithSigner.approve(sorted_array[0][1], sorted_array[0][3]);
} 
  const check_allowance_then_fill = async () => {
    const accounts = await web3.eth.getAccounts();
    let contract = new ethers.Contract(USDC_ADD, erc20_abi, provider);
    const contractWithSigner = contract.connect(signer);
    let allowed = await USDC_Contract.allowance(accounts[0], sorted_array[0][1])
    .then(console.log);
    let offer_instance = new web3.eth.Contract(Locked_WETH_ABI as AbiItem[], sorted_array[0][1]);
    await offer_instance.methods.fill().send({
      from: accounts[0],
    })
  };
  


  return (
    <Layout>
      <main>
        <div className="main-header">
          <h1 className="header-text">dOTC prototype site</h1>
          <ConnectButton handleOpenModal={onOpen} />
          <AccountModal isOpen={isOpen} onClose={onClose} />
        </div>
 
        <div className="main-content">
          <button type="button" className="view-market-btn">
            Create Offer
          </button>
          <div className="market-view">
            <div className="market-table">
              <Table>
                <Thead>
                  {/* table header row */}
                  <Tr className="header-row">
                    <Th>Offer Contract</Th>
                    <Th>Price Per WETH</Th>
                    <Th>WETH Deposited</Th>
                    <Th>Approve</Th>
                    <Th>Fill</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sorted_array?.map((item, index) => (
                    <Tr className="reg-row" key={index}>
                      {/* first cell for each reg table row */}
                      <Td>
                        <Link
                          className="link"
                          href={`https://ropsten.etherscan.io/address/${item[1]}`}
                        >
                          {/* <Button type="button"> */}
                          {/* if you need these to be buttons you can uncomment, don't need to be buttons unless they redirect somewhere or do something tho */}
                          {item[1] &&
                            `${item[1].slice(0, 6)}...${item[1].slice(
                              item[1].length - 4,
                              item[1].length
                            )}`}
                          {/* </Button> */}
                        </Link>
                      </Td>
                      {/* second cell for each reg table row */}
                      <Td height="25px">
                        {/* <Button type="button"> */}$
                        {Number(item[0]).toFixed(2)}
                        {/* </Button> */}
                      </Td>
                      {/* third cell for each reg table row */}
                      <Td height="25px">
                        {/* <Button type="button"> */}
                        {formatEther(item[2])}
                        {/* </Button> */}
                      </Td>
                      {/* fourth cell for each reg table row */}
                      < Td height='25px'>
                         <button
                         onClick={approval}
                         > 
                          Approve
                          </button>
                        </Td>
                        < Td height='25px'>
                         <button
                         onClick={check_allowance_then_fill}
                         > 
                          Fill
                          </button>
                        </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default App;
