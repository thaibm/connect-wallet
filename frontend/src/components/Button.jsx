import React from 'react';

const Button = ({ loading, onClick, title }) => {
  return (
    <div className='button-wrapper'>
      <button
        onClick={onClick}
        disabled={loading}
      >
        {loading ? (
          <div className='title-button'>
            <div className='loader' />
            {title}
          </div>
        ) : (
         title 
        )}
      </button>
    </div>
  );
};

export default Button;
