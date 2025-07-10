import React from 'react';

const SaveButton = () => {
  const handleSave = () => {
    alert('Rezultati su sačuvani!');
    // Ovde bi trebalo da implementiramo funkcionalnost za izvoz u Excel kasnije.
  };

  return (
    <button onClick={handleSave} className="save-button">Sačuvaj Rezultate</button>
  );
};

export default SaveButton;
