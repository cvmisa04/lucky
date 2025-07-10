import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { motion } from 'framer-motion';

const prizeNames = [
  'Frižider', 'Pegla', 'TV', 'Laptop', 'Telefon', 'Putovanje',
  'Bicikl', 'Konzola', 'Tablet', 'Zlatna narukvica', 'Poklon bon',
  'Brendiran sat', 'Smartwatch', 'Knjiga', 'Televizor', 'Računar',
  'Audio sistem', 'Vaučer za restoran',
];

const numberPool = [3, 7, 15, 20, 8, 1, 9, 14, 18, 12, 6, 5, 13, 4, 11, 19, 10, 17, 16];

const App = () => {
  const [availableNumbers, setAvailableNumbers] = useState([...numberPool]);
  const [assignedNumbers, setAssignedNumbers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDrawn, setLastDrawn] = useState({ number: null, prize: null });
  const [isPulling, setIsPulling] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isGiftOpened, setIsGiftOpened] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const listRefs = useRef([]);

  const drawNumber = () => {
    if (availableNumbers.length === 0 || currentIndex >= prizeNames.length) return;

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const selectedNumber = availableNumbers[randomIndex];
    const prize = prizeNames[currentIndex];

    const updatedAvailable = availableNumbers.filter((num) => num !== selectedNumber);
    const updatedAssigned = [...assignedNumbers];
    updatedAssigned[currentIndex] = selectedNumber;

    setAvailableNumbers(updatedAvailable);
    setAssignedNumbers(updatedAssigned);
    setLastDrawn({ number: selectedNumber, prize });
    setCurrentIndex((prev) => prev + 1);

    setIsPulling(true);
    setTimeout(() => setIsPulling(false), 3200);
  };

  useEffect(() => {
    const el = listRefs.current[currentIndex - 1];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentIndex]);

  const openGiftModal = () => {
    setShowModal(true);
    setIsJumping(true);
    setIsGiftOpened(true);

    setTimeout(() => {
      setIsJumping(false);
      setIsGiftOpened(false);
    }, 3000);

    setTimeout(() => {
      setShowModal(false);
    }, 6000);
  };

  return (
    <div className="app">
      <motion.div
        className={`jackpot-pull ${isPulling ? 'pulling' : ''}`}
        onClick={() => {
          drawNumber();
          openGiftModal();
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <motion.div
          animate={{ y: isJumping ? -20 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          <motion.div
            className={`gift-box ${isGiftOpened ? 'opened' : ''}`}
            initial={{ scale: 1 }}
            animate={{ scale: isGiftOpened ? 1.2 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            🎁
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Modal sa rotacijom i nagradom */}
      {showModal && (
        <motion.div
          className="modal"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: [1, 1.05, 1],
            rotate: [0, 10, -10, 10, 0],
          }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div className="shine-box">
              <motion.div
                className="shine-number"
                animate={{
                  scale: [1, 1.5, 1],
                  textShadow: ['0 0 30px #ffcc00', '0 0 40px #ffcc00', '0 0 50px #ffcc00'],
                }}
                transition={{
                  repeat: 3,
                  duration: 1.5,
                  ease: 'easeOut',
                }}
              >
                {lastDrawn.number}
              </motion.div>
              <motion.div
                className="shine-prize"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                🎁 Nagrada: {lastDrawn.prize}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Horizontalna istorija svih izvučenih brojeva */}
      {assignedNumbers.length > 0 && (
        <motion.div
          className="history-strip"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {assignedNumbers.slice().reverse().map((num, idx) => {
            const originalIndex = assignedNumbers.length - 1 - idx;
            return num ? (
              <motion.div
                key={originalIndex}
                className={`history-box ${originalIndex === currentIndex - 1 ? 'latest' : ''}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <div className="history-number">{num}</div>
                <div className="history-prize">{prizeNames[originalIndex]}</div>
              </motion.div>
            ) : null;
          })}
        </motion.div>
      )}

      <div className="prize-list">
        <ul>
          {prizeNames.map((prize, index) => {
            const assigned = assignedNumbers[index];
            return (
              <motion.li
                key={index}
                ref={(el) => (listRefs.current[index] = el)}
                className={`prize-item ${assigned ? 'drawn' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 1.6 }}
              >
                <span className="prize-name">{index + 1}. {prize}</span>
                {assigned && <span className="assigned-number"> — Izvučeni broj: {assigned}</span>}
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default App;
