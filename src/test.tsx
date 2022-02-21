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
    Link
  } from '@chakra-ui/react'
  import { ChakraProvider, useDisclosure } from "@chakra-ui/react";
  import theme from "./theme";
  import Layout from "./components/Layout";
  import ConnectButton from "./components/ConnectButton";
  import AccountModal from "./components/AccountModal";
  import { Box, Center } from '@chakra-ui/react';
  import React, { Component, useEffect, useState } from 'react';
  import "@fontsource/inter";
  import { ethers, BigNumber } from 'ethers';
  import { formatEther, formatUnits, parseUnits, parseEther } from "@ethersproject/units";
  import { preProcessFile } from 'typescript';
  import { contractCallOutOfGasMock } from '@usedapp/testing';
  
  //contracts and ABI's
  const Offer_Factory_ABI = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"offerAddress","type":"address"},{"indexed":false,"internalType":"address","name":"tokenWanted","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountWanted","type":"uint256"}],"name":"OfferCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"address","name":"_tokenWanted","type":"address"},{"internalType":"uint256","name":"_amountWanted","type":"uint256"}],"name":"createOffer","outputs":[{"internalType":"contract LockedWETHOffer","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"fee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getActiveOffers","outputs":[{"internalType":"contract LockedWETHOffer[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getActiveOffersByOwner","outputs":[{"internalType":"contract LockedWETHOffer[]","name":"","type":"address[]"},{"internalType":"contract LockedWETHOffer[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"start","type":"uint256"},{"internalType":"uint256","name":"end","type":"uint256"}],"name":"getActiveOffersByRange","outputs":[{"internalType":"contract LockedWETHOffer[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"offers","outputs":[{"internalType":"contract LockedWETHOffer","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fee","type":"uint256"}],"name":"setFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];
  const Offer_Factory_ADD = '0x45e9668Ad6a5fC79b860e82AfAE1F3BBcf5B0fC6';
  const Lens_ABI = [{"inputs":[],"name":"DAI","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FEI","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDC","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDT","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IOfferFactory","name":"factory","type":"address"}],"name":"getActiveOffersPruned","outputs":[{"internalType":"contract ILockedWETHOffer[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IOfferFactory","name":"factory","type":"address"}],"name":"getAllActiveOfferInfo","outputs":[{"internalType":"address[]","name":"offerAddresses","type":"address[]"},{"internalType":"uint256[]","name":"WETHBalances","type":"uint256[]"},{"internalType":"address[]","name":"tokenWanted","type":"address[]"},{"internalType":"uint256[]","name":"amountWanted","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ILockedWETHOffer","name":"offer","type":"address"}],"name":"getOfferInfo","outputs":[{"internalType":"uint256","name":"WETHBalance","type":"uint256"},{"internalType":"address","name":"tokenWanted","type":"address"},{"internalType":"uint256","name":"amountWanted","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IOfferFactory","name":"factory","type":"address"}],"name":"getVolume","outputs":[{"internalType":"uint256","name":"sum","type":"uint256"}],"stateMutability":"view","type":"function"}];
  const Lens_ADD = '0xbb6692D85fF5E4269E78B7E64919e2c994dc9104';
  let provider = new ethers.providers.Web3Provider(window.ethereum)
  let signer = provider.getSigner();
  let Lens_READ = new ethers.Contract(Lens_ADD, Lens_ABI, provider); 
  
  function App() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [ActiveOfferInfo, setActiveOfferInfo] = useState<any[]>([])
    const [AddressList, setAddressList] = useState<any[]>([])
    const [WETHBalances, setWETHBalances] = useState<any[]>([])
    const [TokenWanted, setTokenWanted] = useState<any[]>([])
    const [amountWanted, setamountWanted] = useState<any[]>([])
    const [order_array, setorder_array] = useState<any[]>([])
    const [sorted_array, setsorted_array] = useState<any[]>([])
    const [PPW, setPPW] = useState<any[]>([])
    let ActiveOffers = ActiveOfferInfo.length;
    let Token_Ticker = [];

    useEffect(() => {
      const init = async () => {
        const ActiveOfferInfo = await Lens_READ.getAllActiveOfferInfo(Offer_Factory_ADD);
        const AddressList = ActiveOfferInfo[0];
        const WETHBalances = ActiveOfferInfo[1];
        const TokenWanted =  ActiveOfferInfo[2];
        const amountWanted = ActiveOfferInfo[3];
        const PPW = [];
        for (let j=0;j<=ActiveOffers;j++) {
            let ppwValue = amountWanted[j]/WETHBalances[j];
            PPW.push(ppwValue);
        }

        const order_array = [];
        for (let k=0;k<=ActiveOffers;k++) {
          if (Token_Ticker[k] == 'ERROR') {
            continue
          } else {
          order_array.push([PPW[k], AddressList[k], WETHBalances[k], amountWanted[k], Token_Ticker[k]]);
        }}

        const sorted_array = order_array.sort((a, b) => a[0] - b[0])
        console.log(sorted_array)

        setActiveOfferInfo(ActiveOfferInfo);
        setAddressList(AddressList);
        setWETHBalances(WETHBalances);
        setTokenWanted(TokenWanted);
        setamountWanted(amountWanted);
        setorder_array(order_array);
        setPPW(PPW);
        setsorted_array(sorted_array)
      }
      init();
    }, []);
  
    function updateTableHTML(sorted_array) {
        var tableBody = document.getElementById("your-table-body-id"),
            newRow, newCell;
    
        // Reset the table
        tableBody.innerHTML = "";
    
        // Build the new table
        for (var i=0; i < sorted_array.length; i++) {
            newRow = document.createElement("tr");
            tableBody.appendChild(newRow);
    
            if (sorted_array[i] instanceof Array) {
                for (var j=0; j < sorted_array[i].length; j++) {
                    newCell = document.createElement("td");
                    newCell.textContent = sorted_array[i][j];
                    newRow.appendChild(newCell);
                }
            } else {
                newCell = document.createElement("td");
                newCell.textContent = sorted_array[i];
                newRow.appendChild(newCell);
            }
        }
    }
    
  

    const USDC = '0xA3F8E2FeE6E754617e0f0917A1BA4f77De2D9423';
    const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
    const FEI = '0x224e64ec1BDce3870a6a6c777eDd450454068FEC'; 
  
    //Convert Token Addresses to Symbols
     for (let i=0; i<=ActiveOffers;i++) {
      if (sorted_array[i][4] == USDC) {
        Token_Ticker.push('USDC')
      } else if (sorted_array[i][4] == USDT) {
        Token_Ticker.push('USDT')
      } else if (sorted_array[i][4] == DAI) {
        Token_Ticker.push('DAI')
      } else if (sorted_array[i][4] == FEI) {
        Token_Ticker.push('FEI')
      } else {
        Token_Ticker.push('ERROR')
      }
  }

    async function approval(_TokenWanted, _amountWanted) {
      let abi = ["function approve(address _spender, uint256 _value) public returns (bool success)"]
      let contract = new ethers.Contract(_TokenWanted, abi, provider)
      await contract.approve(Offer_Factory_ADD, amountWanted)
    }
  
    return (
      <ChakraProvider theme={theme}>
        <Layout>
          <ConnectButton handleOpenModal={onOpen} />
            <AccountModal isOpen={isOpen} onClose={onClose} />
              <Center height='10px'></Center>
              <Button color='green.200' fontSize='3xl' bg='gray.800' _hover={{borderColor: "green.700",color: "green.400",
                }}>dOTC</Button>
            <Center height='10px'></Center>
              <Button bg='green.200'>Create Offer</Button>
              <Center height='10px'></Center>
            <Table 
              variant='simple' 
              colorScheme='' 
              color="green.200" 
              size='md' 
              border='1.5px' 
              borderColor='green.600'>
                <Thead borderColor='green.200'
                      border="2px"
                      height="40px"
                      color="white.800"
                      bg="gray.700"
                      >
                  <Tr>
                    <Th fontSize='md' fontWeight='normal' color="white.800" whiteSpace='nowrap'>Offer Contract</Th>
                    <Th fontSize='md' fontWeight='normal' color="white.800" whiteSpace='nowrap'>Price Per WETH</Th>
                    <Th fontSize='md' fontWeight='normal' color="white.800" whiteSpace='nowrap'>Token Wanted</Th>
                    <Th fontSize='md' fontWeight='normal' color="white.800" whiteSpace='nowrap'>WETH Amount</Th>
                    <Th fontSize='md' fontWeight='normal' color="white.800" whiteSpace='nowrap'></Th>
                  </Tr>
                </Thead >
                <Tbody borderColor='green.200' border='2px'>
                  <Td>
                    {sorted_array?.map((item,index) => 
                        <Tr key={index}>
                        <Link color='green.200' href={`https://ropsten.etherscan.io/address/${item}`}>
                          <Td height='75px'>
                            <Button 
                                key={index}
                                bg="gray.600"
                                color='green.200'
                                fontSize="lg"
                                fontWeight="medium"
                                borderRadius="md"
                                border="1px solid transparent"
                                _hover={{
                                  borderColor: "green.700",
                                  color: "green.400",
                                }}>
                                {item[index][1]} 
                            </Button>
                          </Td>
                          </Link>
                          <Td height='75px'>
                            <Button 
                                bg="gray.600"
                                color='green.200'
                                fontSize="lg"
                                fontWeight="medium"
                                borderRadius="md"
                                border="1px solid transparent"
                                _hover={{
                                  borderColor: "green.700",
                                  color: "green.400",
                                }}>
                                ${(Number(item[index][0]*1e18).toFixed(2))}
                            </Button>
                          </Td>
                          <Td height='75px'>
                            <Button 
                                bg="gray.600"
                                color='green.200'
                                fontSize="lg"
                                fontWeight="medium"
                                borderRadius="md"
                                border="1px solid transparent"
                                _hover={{
                                  borderColor: "green.700",
                                  color: "green.400",
                                }}>
                                {Token_Ticker[index]} 
                            </Button>
                          </Td>
                          <Td height='75px'>
                            <Button 
                                
                                bg="gray.600"
                                color='green.200'
                                fontSize="lg"
                                fontWeight="medium"
                                borderRadius="md"
                                border="1px solid transparent"
                                _hover={{
                                  borderColor: "green.700",
                                  color: "green.400",
                                }}>
                                {Number((item[index][4])/1e18).toFixed(3)}
                            </Button>
                          </Td>
                      </Tr>
                    )}
                  </Td>
              </Tbody>
            </Table>
        </Layout>
      </ChakraProvider>
    );
  }
  
  export default App;
  