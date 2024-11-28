import React, { useState, useCallback } from 'react';
import Transaction from './Transaction';
import Button from './Button';

const AmountInput = React.memo(
  ({
    loading,
    transactionHashMint,
    transactionHashBurn,
    onAction,
    placeholder,
    text,
  }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const handleAction = useCallback(async () => {
      if (amount > 0) {
        await onAction(Number(amount));
        setAmount('');
      }
    }, [amount, onAction]);

    const handleChange = (e) => {
      const value = e.target.value;

      if (value && !/^(0|[1-9]\d*)$/.test(value)) {
        setError('Invalid format!');
      } else {
        setError('');
        setAmount(value);
      }
    };

    return (
      <div className='wrapper-amount-button'>
        <div className='action-button'>
          <div>
            <input
              type='text'
              value={amount}
              onChange={handleChange}
              placeholder={placeholder}
            />
            {error && (
              <p className='text-error'>
                {error}
              </p>
            )}
          </div>
          <Button
            title={text}
            loading={loading}
            onClick={handleAction}
          />
        </div>
        <Transaction transactionHash={transactionHashBurn} />
        <Transaction transactionHash={transactionHashMint}/>
      </div>
    );
  }
);

const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.transactionHashMint === nextProps.transactionHashMint &&
    prevProps.transactionHashBurn === nextProps.transactionHashBurn &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.text === nextProps.text &&
    prevProps.textLoading === nextProps.textLoading
  );
};

export default React.memo(AmountInput, areEqual);
