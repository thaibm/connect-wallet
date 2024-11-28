import React from 'react';

const Transaction = ({ transactionHash }) => {
  return (
    <>
      {transactionHash && (
        <div className='transaction-hash'>
          <span>Transaction Hash</span>

          <div className='link-transaction'>
            <a
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target='_blank'
              rel='noreferrer'
            >
              {transactionHash?.slice(0, 6)}...
              {transactionHash?.slice(-10)}
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default Transaction;
