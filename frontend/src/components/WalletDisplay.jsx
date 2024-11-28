import React from 'react';

const WalletDisplay = ({ title, address, balance }) => {
  return (
    <div className='wallet-display'>
      <h2>{title}</h2>
      <p>
        Address:{' '}
        <a
          target='_blank'
          href={`https://sepolia.etherscan.io/address/${address}`}
          rel='noreferrer'
        >
          {address}
        </a>
      </p>
      <p>
        Balance: <span>{balance ?? ''} USDC</span>
      </p>
    </div>
  );
};

export default WalletDisplay;
