import React, { useState } from 'react';

const Modal = ({ email, onCodeSubmit, isOpen, onClose }) => {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>We sent a code to {email}. Please input the code to continue.</p>
        <input 
          type="text" 
          value={code} 
          onChange={(e) => setCode(e.target.value)} 
          placeholder="Enter code" 
        />
        <button onClick={() => onCodeSubmit(code)}>Submit</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;