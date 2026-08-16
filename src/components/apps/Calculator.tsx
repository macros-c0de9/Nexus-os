import React, { useState } from 'react';
import { Delete, Divide, Equal, Minus, Plus, X } from 'lucide-react';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  const handleDigit = (digit: string) => {
    if (display === '0' || resetNext) {
      setDisplay(digit);
      setResetNext(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOp = (operator: string) => {
    const current = parseFloat(display);
    if (prevVal !== null && op) {
      const result = calculate(prevVal, current, op);
      setPrevVal(result);
      setDisplay(String(result));
    } else {
      setPrevVal(current);
    }
    setOp(operator);
    setResetNext(true);
  };

  const calculate = (a: number, b: number, operation: string) => {
    switch (operation) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleEquals = () => {
    if (prevVal !== null && op) {
      const current = parseFloat(display);
      const result = calculate(prevVal, current, op);
      setDisplay(String(result));
      setPrevVal(null);
      setOp(null);
      setResetNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevVal(null);
    setOp(null);
    setResetNext(false);
  };

  return (
    <div id="calculator-container" className="h-full flex flex-col bg-slate-950 text-slate-100 p-4 select-none">
      {/* Display Screen */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-right mb-4 flex flex-col justify-end min-h-[80px]">
        <span className="text-[11px] font-mono text-slate-500 min-h-[16px]">
          {prevVal !== null ? `${prevVal} ${op}` : ''}
        </span>
        <span className="text-2xl font-bold font-mono text-white tracking-tight truncate">
          {display}
        </span>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        <button onClick={handleClear} className="p-3 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl font-bold text-xs">
          AC
        </button>
        <button onClick={() => setDisplay(String(parseFloat(display) * -1))} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs">
          ±
        </button>
        <button onClick={() => setDisplay(String(parseFloat(display) / 100))} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs">
          %
        </button>
        <button onClick={() => handleOp('÷')} className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm">
          ÷
        </button>

        {['7', '8', '9'].map((d) => (
          <button key={d} onClick={() => handleDigit(d)} className="p-3 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl font-bold text-sm">
            {d}
          </button>
        ))}
        <button onClick={() => handleOp('×')} className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm">
          ×
        </button>

        {['4', '5', '6'].map((d) => (
          <button key={d} onClick={() => handleDigit(d)} className="p-3 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl font-bold text-sm">
            {d}
          </button>
        ))}
        <button onClick={() => handleOp('-')} className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm">
          -
        </button>

        {['1', '2', '3'].map((d) => (
          <button key={d} onClick={() => handleDigit(d)} className="p-3 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl font-bold text-sm">
            {d}
          </button>
        ))}
        <button onClick={() => handleOp('+')} className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm">
          +
        </button>

        <button onClick={() => handleDigit('0')} className="col-span-2 p-3 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl font-bold text-sm text-left pl-6">
          0
        </button>
        <button onClick={() => handleDigit('.')} className="p-3 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl font-bold text-sm">
          .
        </button>
        <button onClick={handleEquals} className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm">
          =
        </button>
      </div>
    </div>
  );
};
