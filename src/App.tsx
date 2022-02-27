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
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
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
import OfferFactory_ABI from './abi/OfferFactory.json'
import { Input } from '@chakra-ui/react'


declare let window: any;
const web3 = new Web3(window.ethereum);


//Important Token Addresses

const Offer_Factory_ADD = "0xB4e5b355811D197D155EAcEeE8AAce6e364dE850";
const Lens_ADD = "0xbb6692D85fF5E4269E78B7E64919e2c994dc9104";
const USDC = 0xa3f8e2fee6e754617e0f0917a1ba4f77de2d9423;
const USDC_ADD = '0xa3f8e2fee6e754617e0f0917a1ba4f77de2d9423';
const WETH_ADD = '0xf3aC2d4e676Ed31F21Ab5C31D6478FfCdF0E0086';


//Important Contract Instances

let provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()
let Lens_READ = new ethers.Contract(Lens_ADD, WETH_LENS_ABI, provider);

let OfferFactory_Contract = new ethers.Contract(Offer_Factory_ADD, OfferFactory_ABI, provider);
const USDC_Contract = new ethers.Contract(USDC_ADD, erc20_abi, provider);
const WETH_Contract = new ethers.Contract(WETH_ADD, erc20_abi, provider);
const WETHInst = new web3.eth.Contract(erc20_abi, WETH_ADD);


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
  const [userActiveOffers, setuserActiveOffers] = useState<any[]>([]);
  const [user_created_add, setuser_created_add] = useState('');
  const [User_WETH_Bal, setUser_WETH_Bal] = useState('');
  const [User_USDC_Bal, setUser_USDC_Bal] = useState('');
  const [ETH_Live_Price, setETH_Live_Price] = useState('');
  
  let ActiveOffers = ActiveOfferInfo.length;

  // molly code ------------------------------------------------
  // -----------------------------------------------------------
  // -----------------------------------------------------------
  const [mollyInput, setMollyInput] = useState('');
  // when input is changed, handleChange assigns the new input value to the input variable.
  // event target = input field
  const handleChange = (e) => setMollyInput(e.target.value);

  // passes user input to the CreateOfferMechanism function, no error handling yet
  function handleSubmit(e){
    e.preventDefault();
    CreateOfferMechanism(mollyInput);
    console.log("submit button clicked");
  }

  // for testing; logs user input to ensure the correct value is passed to the function
  function logMollyInputValue(){
    console.log(mollyInput);
  }

  // molly code end --------------------------------------------
  // molly code end --------------------------------------------
  // molly code end --------------------------------------------
//
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

        PPW.push(ppwValue);
      }
      console.log(ActiveOffers)
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
          ]);
        } else {
          continue;
        }
      }
      //SORTING THE ARRAY BY PRICE PER WETH
     // console.log(order_array)
      const sorted_array = order_array.sort((a, b) => b[0] - a[0]);
     // console.log(sorted_array);

      //Set User WETH Balance
      const accounts = await web3.eth.getAccounts();
      let WETHbalance = await WETH_Contract.balanceOf(accounts[0])
      const User_WETH_Bal = ethers.utils.formatUnits(WETHbalance, 18)
     // console.log(User_WETH_Bal);

      //Set User USDC Balance
      let USDCbalance = await USDC_Contract.balanceOf(accounts[0])
      const User_USDC_Bal = ethers.utils.formatUnits(USDCbalance, 18)
   //   console.log(User_USDC_Bal);

      //Show ETH Price
      let ETH_Price_Call = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=WETH&vs_currencies=USD");
      const ETH_Live_Price_json = await ETH_Price_Call.json();
      const ETH_Live_Price = ETH_Live_Price_json.weth.usd;
     // console.log(ETH_Live_Price);

      let userActiveOffers = []

      
       //
      for (let p = 0; p <= ActiveOffers; p++) {
        let order = sorted_array[p]  
        let order_instance = new web3.eth.Contract(Locked_WETH_ABI, order[1]);
        let address = String(order[1]);
        let seller = await order_instance.methods.seller().call();      
        if (String(seller) == accounts[0]) {
          userActiveOffers.push(String(address));
        }
      }

      let user_created_add = [];
      OfferFactory_Contract.on("OfferCreated", (offerAddress, tokenWanted, amountWanted) => {
        console.log(offerAddress);
        setuser_created_add(offerAddress);
      })
    
    


  
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
      setUser_WETH_Bal(User_WETH_Bal);
      setUser_USDC_Bal(User_USDC_Bal);
      setETH_Live_Price(ETH_Live_Price);
      setuserActiveOffers(userActiveOffers);
    };
    init();
  }, []);

  console.log(user_created_add)

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


 
  let orderAdd = [];
  const CreateOfferMechanism = async (USDCWantedPerWETH) => {
    const accounts = await web3.eth.getAccounts();
    const CreateOffer = new ethers.Contract(Offer_Factory_ADD, OfferFactory_ABI, provider)
    const contractWithSigner = CreateOffer.connect(signer);
    let USDCWantedPerWETH2 = Number(USDCWantedPerWETH)
    let User_WETH_Bal2 = Number(User_WETH_Bal);
    let num = web3.utils.toWei(String(USDCWantedPerWETH2 * User_WETH_Bal2), 'ether');

    await contractWithSigner.createOffer(USDC_ADD, num)
    contractWithSigner.on("OfferCreated", (offerAddress, tokenWanted, amountWanted) => {
      console.log(offerAddress);
      orderAdd.push(String(offerAddress));
      WETHapproval(offerAddress)
    })
  }
  const WETHapproval = async (orderAddress) => {
    const accounts = await web3.eth.getAccounts();
    const contractWithSigner = WETH_Contract.connect(signer);
    await contractWithSigner.approve(orderAddress, web3.utils.toWei(User_WETH_Bal, 'ether'))
} 

  const SendWETH = async () => {
    const accounts = await web3.eth.getAccounts();
    let allowed = await WETH_Contract.allowance(accounts[0], user_created_add)
    .then(console.log);
    const WETHcontractWithSigner = WETH_Contract.connect(signer);
    WETHcontractWithSigner.transfer(user_created_add, web3.utils.toWei(User_WETH_Bal, 'ether'))
  }

  return (
    <Layout>
      <main>
        <div className="top-bar">
          <ConnectButton handleOpenModal={onOpen} />
          <AccountModal isOpen={isOpen} onClose={onClose} />
        </div>
        <div className="main-header">
          <h1 className="header-text">dOTC prototype site</h1>
          </div>
        <div className="main-content">
          <div className="market-view">
            <div className="market-table create-offer-container">
              <h1>Create an Offer</h1>
              <Table>
                <Tr>
                  <Td>
                    <Button>WETH Balance</Button>
                  </Td>
                  <Td>
                    <Button>Ξ{Number(User_WETH_Bal).toFixed(2)}</Button>
                  </Td>
                  <Td>
                    <Button>Set WETH Price:</Button>
                  </Td>
                  <Td>
                    {/* molly code --------------------- */}
                    {/* molly code --------------------- */}
                    {/* molly code --------------------- */}
                    <form onSubmit={handleSubmit}>
                      <input
                        type="text"
                        name="mollyInput"
                        id="mollyInput"
                        value={mollyInput}
                        onChange={handleChange}
                        required
                      />
                      {/* <input className="btn" type="submit" value="Submit" /> */}
                    </form>
                    {/* molly code end ----------------- */}
                    {/* molly code end ----------------- */}
                    {/* molly code end ----------------- */}
                    {/* molly code end ----------------- */}
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Button>x</Button>
                  </Td>
                  <Td>
                    <Button>x</Button>
                  </Td>
                  <Td>
                    <Button>x</Button>
                  </Td>
                  <Td>
                    <Button type="submit" onClick={handleSubmit}>Submit</Button>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Button>USDC Balance</Button>
                  </Td>
                  <Td>
                    <Button>${Number(User_USDC_Bal).toFixed(2)}</Button>
                  </Td>
                  <Td>
                    <Button>Total Sale</Button>
                  </Td>
                  <Td>
                    <Button>
                      ${(Number(mollyInput) * Number(User_WETH_Bal)).toFixed(2)}
                    </Button>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Button>Market Price:</Button>
                  </Td>
                  <Td>
                    <Button>${ETH_Live_Price}</Button>
                  </Td>
                  <Td>
                    <Button>{orderAdd}</Button>
                  </Td>
                  <Td>
                    <Button onClick={SendWETH}>transfer</Button>
                  </Td>
                </Tr>
              </Table>
            </div>

            <Center height="25px"> </Center>

            <div className="market-table your-offers-container">
              <h1> Your Active Offers </h1>
              <Table>
                <Tr className="header-row">
                  <Th>Orders</Th>
                  <Th>Your Order Addresses</Th>
                </Tr>
                {userActiveOffers?.map((item, index) => (
                  <Tr className="reg-row" key={index}>
                    {/* first cell for each reg table row */}
                    <Td>{index}:</Td>
                    <Td height="25px">
                      {item &&
                        `${item.slice(0, 6)}...${item.slice(
                          item.length - 4,
                          item.length
                        )}`}
                    </Td>
                  </Tr>
                ))}
              </Table>
            </div>

            <Center height="25px"> </Center>

            <div className="market-table all-offers-container">
              <h1> All Active Offers</h1>
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
                        {/* <Button type="button"> */}Ξ {formatEther(item[2])}
                        {/* </Button> */}
                      </Td>
                      {/* fourth cell for each reg table row */}
                      <Td height="25px">
                        <button onClick={approval}>Approve</button>
                      </Td>
                      <Td height="25px">
                        <button onClick={check_allowance_then_fill}>
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
