import React, { useState, useEffect } from 'react';
import WalletDisplay from './components/WalletDisplay';
import AmountInput from './components/AmountInput';
import { ethers, formatUnits } from 'ethers';
import { USDC_ABI } from './abi';
import apiInstance from './apiInstance';
import './App.css';
import { toast } from 'react-toastify';
import Button from './components/Button';
import Transaction from './components/Transaction';

const App = () => {
  const [createdWallet, setCreatedWallet] = useState(null);
  const [treasury, setTreasury] = useState(null);
  const [transactionHash, setTransactionHash] = useState({
    mint: '',
    collect: '',
    burn: '',
  });
  const [loading, setLoading] = useState({
    mint: false,
    burn: false,
    collect: false,
    createWallet: false
  });

  const getUSDCContract = async () => {
    const provider = new ethers.JsonRpcProvider(
      process.env.REACT_APP_RPC_PROVIDER
    );
    const contract = new ethers.Contract(
      process.env.REACT_APP_USDC_CONTRACT_ADDRESS,
      USDC_ABI,
      provider
    );
    return { provider, contract };
  };

  const fetchBalance = async (address) => {
    const { contract } = await getUSDCContract();
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    return formatUnits(balance, decimals);
  };

  const updateBalance = async (wallet, setWalletState) => {
    const balance = await fetchBalance(wallet.address);
    setWalletState((prev) => ({ ...prev, balance }));
  };

  const handleTransaction = async (url, data, updateWallets, toastValue) => {
    try {
      const response = await apiInstance.post(url, data);
      setTransactionHash((prev) => ({
        ...prev,
        ...updateWallets(response.transactionHash),
      }));
      toast.success(toastValue);
      return response;
    } catch (error) {
      console.error(`Error with transaction:`, error);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const balance = await fetchBalance(
          process.env.REACT_APP_TREASURE_WALLET_ADDRESS
        );
        setTreasury({
          address: process.env.REACT_APP_TREASURE_WALLET_ADDRESS,
          balance,
        });
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      console.error('MetaMask not installed.');
    }
  };

  useEffect(() => {
    connectWallet();
  }, [transactionHash.burn]);

  const handleWalletCreated = async () => {
    setLoading((prev) => ({ ...prev, createWallet: true }));
    try {
      const response = await apiInstance.post(`create-wallet`);
      setCreatedWallet({ address: response.address });
      updateBalance(response, setCreatedWallet);
      toast.success('Wallet created!');
    } catch (error) {
      console.error('Error creating wallet:', error);
    } finally {
      setLoading((prev) => ({ ...prev, createWallet: false }));
    }
  };

  const handleMint = async (amount) => {
    setLoading((prev) => ({ ...prev, mint: true }));
    await handleTransaction(
      `/mint`,
      { walletAddress: createdWallet.address, amount },
      (txHash) => ({ mint: txHash }),
      'Mint successfully!'
    );
    updateBalance(createdWallet, setCreatedWallet);
    setLoading((prev) => ({ ...prev, mint: false }));
  };

  const handleCollect = async () => {
    setLoading((prev) => ({ ...prev, collect: true }));
    await handleTransaction(
      `/collect-usdc`,
      { from: createdWallet.address, to: treasury.address },
      (txHash) => ({ collect: txHash }),
      'Collect successfully!'
    );
    updateBalance(treasury, setTreasury);
    updateBalance(createdWallet, setCreatedWallet);
    setLoading((prev) => ({ ...prev, collect: false }));
  };

  const handleBurn = async (amount) => {
    setLoading((prev) => ({ ...prev, burn: true }));
    await handleTransaction(
      `/burn-usdc`,
      { amount, walletAddress: process.env.REACT_APP_TREASURE_WALLET_ADDRESS },
      (txHash) => ({ burn: txHash }),
      'Burn successfully!'
    );

    setLoading((prev) => ({ ...prev, burn: false }));
  };

  return (
    <div className='container'>
      <h1>USDC Wallet Manager</h1>
      <div className='container-wrapper'>
        <div className='container-wallet'>
          <WalletDisplay
            title='Treasury Wallet'
            address={treasury?.address}
            balance={treasury?.balance}
          />
          <AmountInput
            loading={loading.burn}
            onAction={handleBurn}
            transactionHashBurn={transactionHash.burn}
            placeholder='Amount to burn'
            text='Burn USDC'
          />
        </div>
        {createdWallet && (
          <div className='container-wallet'>
            <WalletDisplay
              title='Created Wallet'
              address={createdWallet?.address}
              balance={createdWallet?.balance}
            />
            <AmountInput
              loading={loading.mint}
              onAction={handleMint}
              transactionHashMint={transactionHash?.mint}
              placeholder='Amount to mint'
              text='Mint USDC'
            />
            <Button
              title={'Collect USDC'}
              loading={loading.collect}
              onClick={handleCollect}
            />
            <Transaction transactionHash={transactionHash?.collect} />
          </div>
        )}
        {!createdWallet && (
          <Button
            title={'Create New Wallet'}
            loading={loading.createWallet}
            onClick={handleWalletCreated}
          />
        )}
      </div>
    </div>
  );
};

export default App;
