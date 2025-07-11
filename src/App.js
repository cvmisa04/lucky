import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const App = () => {
  const [prizeNames, setPrizeNames] = useState([]);
  const [numberRange, setNumberRange] = useState({ start: 1, end: 20 });
  const [numberPool, setNumberPool] = useState([]);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [assignedNumbers, setAssignedNumbers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDrawn, setLastDrawn] = useState({ number: null, prize: null });
  const [isPulling, setIsPulling] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isGiftOpened, setIsGiftOpened] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [excelError, setExcelError] = useState('');
  const listRefs = useRef([]);

  // --- Učitavanje nagrada iz Excel ili CSV fajla (UTF-8, BOM safe)
  const handleExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const text = evt.target.result;
          const prizesArr = text
            .replace(/^\uFEFF/, '')
            .split(/\r?\n/)
            .map(line => line.replace(/(^"|"$)/g, '').trim())
            .filter(Boolean);
          setPrizeNames(prizesArr);
          setExcelError('');
        } catch (err) {
          setExcelError('Neuspešno učitavanje CSV fajla. Proveri da li je CSV sačuvan kao UTF-8.');
        }
      };
      reader.readAsText(file, 'utf-8');
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const prizesArr = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
          const flat = prizesArr.flat().filter(v => !!v && typeof v === 'string' && v.trim() !== "");
          setPrizeNames(flat);
          setExcelError('');
        } catch (err) {
          setExcelError('Neuspešno učitavanje. Proveri format Excel fajla.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    setNumberRange((prev) => ({
      ...prev,
      [name]: value.replace(/\D/, '')
    }));
  };

  const startGame = () => {
    if (prizeNames.length === 0) {
      setExcelError('Prvo učitaj nagrade iz Excel ili CSV fajla!');
      return;
    }
    const start = parseInt(numberRange.start, 10);
    const end = parseInt(numberRange.end, 10);
    if (isNaN(start) || isNaN(end) || start > end) {
      setExcelError('Pogrešan raspon brojeva.');
      return;
    }
    const nums = [];
    for (let i = start; i <= end; i++) nums.push(i);
    setNumberPool(nums);
    setAvailableNumbers([...nums]);
    setAssignedNumbers([]);
    setCurrentIndex(0);
    setLastDrawn({ number: null, prize: null });
    setGameStarted(true);
  };

  const resetGame = () => {
    setAvailableNumbers([...numberPool]);
    setAssignedNumbers([]);
    setCurrentIndex(0);
    setLastDrawn({ number: null, prize: null });
    setIsPulling(false);
    setIsJumping(false);
    setIsGiftOpened(false);
    setShowModal(false);
    setGameStarted(false);
    setExcelError('');
    setPrizeNames([]);
  };

  const saveToExcel = () => {
    if (currentIndex < prizeNames.length) return;
    const data = assignedNumbers.map((num, idx) => ({
      'Nagrada': prizeNames[idx],
      'Broj': num
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Izvlačenja');
    XLSX.writeFile(wb, 'izvlacenje.xlsx');
  };




  const saveToPDF = ({ prizeNames, assignedNumbers, numberRange, currentIndex }) => {
    if (!prizeNames || !assignedNumbers || !numberRange || currentIndex === undefined) {
      alert("Greška: Nisu prosleđeni svi potrebni podaci za PDF.");
      return;
    }
    if (currentIndex < prizeNames.length) return;
  
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    doc.setFont("NotoSans", "normal");
  
    const startX = 20;
    const startY = 30;
    const colWidths = [25, 110, 35];
    const rowHeight = 10;
  
    // HEADER
    doc.setFontSize(18);
    doc.setTextColor(38, 102, 170);
    doc.text("-NAGRADNA IGRA-", 105, 18, { align: "center" });
  
    doc.setFontSize(12);
    doc.text(`Ukupno nagrada: ${prizeNames.length}`, startX, 24);
    doc.text(`Raspon brojeva: ${numberRange.start} - ${numberRange.end}`, startX + 130, 24);
  
    // Table header - background
    doc.setFillColor(38, 102, 170); // plava
    doc.rect(startX, startY, colWidths[0]+colWidths[1]+colWidths[2], rowHeight, "F");
  
    // Table header - text
    doc.setFontSize(13);
    doc.setTextColor(255,255,255);
    doc.text("R.BROJ", startX + 3, startY + 7);
    doc.text("NAGRADA", startX + colWidths[0] + 3, startY + 7);
    doc.text("BROJ", startX + colWidths[0] + colWidths[1] + 3, startY + 7);
  
    // Table rows
    let y = startY + rowHeight;
    doc.setFontSize(12);
  
    for (let i = 0; i < prizeNames.length; i++) {
      // Alternating row color
      if (i % 2 === 0) {
        doc.setFillColor(235, 243, 255); // svetloplava
        doc.rect(startX, y, colWidths[0]+colWidths[1]+colWidths[2], rowHeight, "F");
      }
  
      doc.setTextColor(38, 102, 170);
      doc.text(String(i + 1), startX + 3, y + 7);
      doc.setTextColor(35, 35, 35);
      doc.text(prizeNames[i], startX + colWidths[0] + 3, y + 7);
      doc.setTextColor(38, 102, 170);
      doc.text(String(assignedNumbers[i] ?? ""), startX + colWidths[0] + colWidths[1] + 3, y + 7);
  
      y += rowHeight;
      if (y > 280) {
        doc.addPage();
        y = startY + rowHeight;
      }
    }
  
    // Draw vertical lines (grid)
    let x = startX;
    for (let j = 0; j <= 3; j++) {
      doc.setDrawColor(180);
      doc.line(x, startY, x, y);
      x += colWidths[j] || 0;
    }
    // Draw horizontal lines
    for (let k = 0; k <= prizeNames.length + 1; k++) {
      let yy = startY + k * rowHeight;
      if (yy > y) break;
      doc.setDrawColor(180);
      doc.line(startX, yy, startX + colWidths[0]+colWidths[1]+colWidths[2], yy);
    }
  
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Generisano aplikacijom za izvlacenje nagrada", startX, 292);
  
    doc.save("izvlacenje.pdf");
  };
  
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

  const BgWaves = () => (
    <div className="bg-waves">
      <svg viewBox="0 0 1440 320">
        <path
          fill="#6ea8fe"
          fillOpacity="1"
          d="M0,224L60,229.3C120,235,240,245,360,229.3C480,213,600,171,720,138.7C840,107,960,85,1080,85.3C1200,85,1320,107,1380,117.3L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        ></path>
      </svg>
    </div>
  );

  if (!gameStarted) {
    return (
      <>
        <BgWaves />
        <div className="init-panel">
          <div className="init-panel-inner">
            <h2>1. Učitaj Excel ili CSV fajl sa nagradama</h2>
            <div className="input-file-wrapper">
              <label htmlFor="inputFile" className="input-file-label">
                <span className="input-file-btn">Izaberi Excel/CSV fajl</span>
                <input
                  id="inputFile"
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="input-file"
                  onChange={handleExcel}
                />
              </label>
            </div>
            {excelError && <div className="error">{excelError}</div>}
            {prizeNames.length > 0 && (
              <div>
                <p>Učitane nagrade: ({prizeNames.length})</p>
                <ul>{prizeNames.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
            )}

            <h2>2. Unesi raspon brojeva</h2>
            <div className="range-fields">
              <input
                type="text"
                name="start"
                value={numberRange.start}
                onChange={handleRangeChange}
                placeholder="Od"
              />
              <input
                type="text"
                name="end"
                value={numberRange.end}
                onChange={handleRangeChange}
                placeholder="Do"
              />
            </div>

            <button onClick={startGame} disabled={prizeNames.length === 0}>
              Startuj igru
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="app">
      <BgWaves />
      <div className="left-buttons">
        <button onClick={resetGame}>Resetuj igru</button>
      </div>
      {currentIndex >= prizeNames.length && (
        <div className="right-buttons">
          <button onClick={saveToExcel}>Sačuvaj u Excel</button>
          <button onClick={() => saveToPDF({
  prizeNames,
  assignedNumbers,
  numberRange,
  currentIndex
})}>
  Sačuvaj u PDF
</button>
        </div>
      )}
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

      {assignedNumbers.length > 0 && (
        <motion.div
          className="history-strip"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {assignedNumbers.map((num, idx) => {
            return num ? (
              <motion.div
                key={idx}
                className={`history-box ${idx === currentIndex - 1 ? 'latest' : ''}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <div className="history-number">{num}</div>
                <div className="history-prize">{prizeNames[idx]}</div>
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