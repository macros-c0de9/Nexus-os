import React, { useState, useEffect } from 'react';
import {
  Delete,
  RotateCcw,
  History,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check
} from 'lucide-react';

type AngleMode = 'DEG' | 'RAD';
type CalcMode = 'standard' | 'scientific';

export const Calculator: React.FC = () => {
  const [calcMode, setCalcMode] = useState<CalcMode>('standard');
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [isSecond, setIsSecond] = useState(false);
  const [memory, setMemory] = useState<number>(0);
  const [hasMemory, setHasMemory] = useState(false);
  const [historyList, setHistoryList] = useState<Array<{ expr: string; res: string }>>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleDigit = (digit: string) => {
    if (display === '0' || resetNext) {
      setDisplay(digit);
      setResetNext(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleDecimal = () => {
    if (resetNext) {
      setDisplay('0.');
      setResetNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOp = (operator: string) => {
    const current = parseFloat(display);
    if (prevVal !== null && op && !resetNext) {
      const result = executeOperation(prevVal, current, op);
      setPrevVal(result);
      setDisplay(String(result));
      setExpression(`${prevVal} ${op} ${current} =`);
    } else {
      setPrevVal(current);
      setExpression(`${current} ${operator}`);
    }
    setOp(operator);
    setResetNext(true);
  };

  const executeOperation = (a: number, b: number, operation: string): number => {
    switch (operation) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
      case '*':
        return a * b;
      case '÷':
      case '/':
        return b !== 0 ? a / b : 0;
      case '^':
      case 'xʸ':
        return Math.pow(a, b);
      case 'ʸ√x':
        return Math.pow(a, 1 / b);
      case 'mod':
        return a % b;
      default:
        return b;
    }
  };

  const handleEquals = () => {
    if (prevVal !== null && op) {
      const current = parseFloat(display);
      const result = executeOperation(prevVal, current, op);
      const fullExpr = `${prevVal} ${op} ${current}`;
      const resStr = String(result);

      setDisplay(resStr);
      setExpression(`${fullExpr} =`);
      setHistoryList((prev) => [{ expr: fullExpr, res: resStr }, ...prev.slice(0, 19)]);
      setPrevVal(null);
      setOp(null);
      setResetNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevVal(null);
    setOp(null);
    setExpression('');
    setResetNext(false);
  };

  const handleBackspace = () => {
    if (resetNext) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  // Scientific Special Function Handlers
  const handleScientificUnary = (func: string) => {
    const val = parseFloat(display);
    let result = 0;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    switch (func) {
      // Trigonometry
      case 'sin':
        result = Math.sin(angleMode === 'DEG' ? toRad(val) : val);
        break;
      case 'cos':
        result = Math.cos(angleMode === 'DEG' ? toRad(val) : val);
        break;
      case 'tan':
        result = Math.tan(angleMode === 'DEG' ? toRad(val) : val);
        break;
      case 'asin':
        result = angleMode === 'DEG' ? toDeg(Math.asin(val)) : Math.asin(val);
        break;
      case 'acos':
        result = angleMode === 'DEG' ? toDeg(Math.acos(val)) : Math.acos(val);
        break;
      case 'atan':
        result = angleMode === 'DEG' ? toDeg(Math.atan(val)) : Math.atan(val);
        break;
      case 'sinh':
        result = Math.sinh(val);
        break;
      case 'cosh':
        result = Math.cosh(val);
        break;
      case 'tanh':
        result = Math.tanh(val);
        break;

      // Powers & Logarithms
      case 'x²':
        result = Math.pow(val, 2);
        break;
      case 'x³':
        result = Math.pow(val, 3);
        break;
      case '√':
      case 'sqrt':
        result = val >= 0 ? Math.sqrt(val) : NaN;
        break;
      case '∛':
        result = Math.cbrt(val);
        break;
      case '1/x':
        result = val !== 0 ? 1 / val : NaN;
        break;
      case 'ln':
        result = val > 0 ? Math.log(val) : NaN;
        break;
      case 'log10':
        result = val > 0 ? Math.log10(val) : NaN;
        break;
      case 'log2':
        result = val > 0 ? Math.log2(val) : NaN;
        break;
      case 'eˣ':
        result = Math.exp(val);
        break;
      case '10ˣ':
        result = Math.pow(10, val);
        break;
      case '2ˣ':
        result = Math.pow(2, val);
        break;

      // Special & Math
      case 'abs':
      case '|x|':
        result = Math.abs(val);
        break;
      case 'fact':
      case 'n!':
        if (val < 0 || !Number.isInteger(val)) {
          result = NaN;
        } else if (val === 0 || val === 1) {
          result = 1;
        } else {
          let f = 1;
          for (let i = 2; i <= Math.min(val, 170); i++) f *= i;
          result = f;
        }
        break;
      case '±':
        result = val * -1;
        break;
      case '%':
        result = val / 100;
        break;
      default:
        result = val;
    }

    const rounded = Number.isFinite(result) ? Math.round(result * 1e12) / 1e12 : result;
    const resStr = String(rounded);
    setDisplay(resStr);
    setExpression(`${func}(${val}) =`);
    setHistoryList((prev) => [{ expr: `${func}(${val})`, res: resStr }, ...prev.slice(0, 19)]);
    setResetNext(true);
  };

  const handleConstant = (constant: 'pi' | 'e' | 'rand') => {
    let val = 0;
    if (constant === 'pi') val = Math.PI;
    if (constant === 'e') val = Math.E;
    if (constant === 'rand') val = Math.random();
    setDisplay(String(val));
    setResetNext(true);
  };

  // Memory Handlers
  const handleMemory = (type: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    const val = parseFloat(display);
    switch (type) {
      case 'MC':
        setMemory(0);
        setHasMemory(false);
        break;
      case 'MR':
        setDisplay(String(memory));
        setResetNext(true);
        break;
      case 'M+':
        setMemory((prev) => prev + val);
        setHasMemory(true);
        setResetNext(true);
        break;
      case 'M-':
        setMemory((prev) => prev - val);
        setHasMemory(true);
        setResetNext(true);
        break;
      case 'MS':
        setMemory(val);
        setHasMemory(true);
        setResetNext(true);
        break;
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+' || e.key === '-') {
        handleOp(e.key);
      } else if (e.key === '*') {
        handleOp('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOp('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, prevVal, op, resetNext]);

  return (
    <div
      id="calculator-container"
      className="h-full flex flex-col bg-slate-950 text-slate-100 p-3 sm:p-4 select-none overflow-y-auto"
    >
      {/* Top Header Bar with Slide Button Toggle */}
      <div className="flex items-center justify-between mb-3 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-1.5 shadow-sm">
        {/* Sliding Pill Switcher */}
        <div className="relative flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-800/80">
          {/* Animated Slide Thumb */}
          <div
            className={`absolute top-0.5 bottom-0.5 rounded-lg bg-blue-600 shadow-md transition-all duration-300 ease-out ${
              calcMode === 'standard' ? 'left-0.5 w-[85px]' : 'left-[88px] w-[95px]'
            }`}
          />
          <button
            id="calc-mode-standard"
            onClick={() => setCalcMode('standard')}
            className={`relative z-10 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              calcMode === 'standard' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Standard
          </button>
          <button
            id="calc-mode-scientific"
            onClick={() => setCalcMode('scientific')}
            className={`relative z-10 px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors ${
              calcMode === 'scientific' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Scientific</span>
          </button>
        </div>

        {/* History Toggle Button */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`p-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors ${
            showHistory ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Calculation History"
        >
          <History className="w-4 h-4" />
          <span className="text-[11px] hidden sm:inline">History</span>
        </button>
      </div>

      {/* History Slide Panel */}
      {showHistory && (
        <div className="mb-3 p-3 bg-slate-900/95 border border-slate-800 rounded-2xl max-h-36 overflow-y-auto space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1 font-semibold">
            <span>Calculation Log</span>
            <button
              onClick={() => setHistoryList([])}
              className="text-rose-400 hover:text-rose-300 text-[10px]"
            >
              Clear Log
            </button>
          </div>
          {historyList.length === 0 ? (
            <p className="text-[11px] text-slate-500 text-center py-2">No past calculations</p>
          ) : (
            historyList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setDisplay(item.res);
                  setResetNext(true);
                }}
                className="flex items-center justify-between p-1 rounded-lg hover:bg-slate-800 cursor-pointer text-xs font-mono"
              >
                <span className="text-slate-400 truncate max-w-[140px]">{item.expr} =</span>
                <span className="text-white font-bold">{item.res}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Main Digital Display Screen */}
      <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 text-right mb-3 flex flex-col justify-end min-h-[88px] shadow-inner">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 min-h-[18px]">
          <div className="flex items-center gap-2">
            {calcMode === 'scientific' && (
              <span className="px-1.5 py-0.2 bg-slate-800 rounded text-[9px] font-bold text-blue-400">
                {angleMode}
              </span>
            )}
            {hasMemory && (
              <span className="px-1.5 py-0.2 bg-slate-800 rounded text-[9px] font-bold text-emerald-400">
                M
              </span>
            )}
          </div>
          <span className="truncate max-w-[200px]">{expression || (prevVal !== null ? `${prevVal} ${op}` : '')}</span>
        </div>
        <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight truncate select-text">
          {display}
        </div>
      </div>

      {/* Scientific Function Memory & Angle Toolbar (Active when Scientific mode is selected) */}
      {calcMode === 'scientific' && (
        <div className="mb-2 flex items-center justify-between gap-1 text-[11px] font-medium text-slate-400">
          {/* DEG / RAD Button */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 transition-colors"
            >
              {angleMode}
            </button>
            <button
              onClick={() => setIsSecond(!isSecond)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                isSecond ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              2nd
            </button>
          </div>

          {/* Memory Bar */}
          <div className="flex items-center gap-1">
            {['MC', 'MR', 'M+', 'M-', 'MS'].map((m) => (
              <button
                key={m}
                onClick={() => handleMemory(m as any)}
                className="px-1.5 py-0.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded text-[10px] font-mono"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Button Grid Matrix */}
      <div className="flex-1 flex flex-col justify-between gap-1.5">
        {/* Scientific Expanded Keypad Row 1-3 */}
        {calcMode === 'scientific' && (
          <div className="grid grid-cols-5 gap-1.5 mb-1 animate-in fade-in duration-200">
            <button
              onClick={() => handleScientificUnary(isSecond ? 'asin' : 'sin')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-400 rounded-xl text-xs font-semibold"
            >
              {isSecond ? 'sin⁻¹' : 'sin'}
            </button>
            <button
              onClick={() => handleScientificUnary(isSecond ? 'acos' : 'cos')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-400 rounded-xl text-xs font-semibold"
            >
              {isSecond ? 'cos⁻¹' : 'cos'}
            </button>
            <button
              onClick={() => handleScientificUnary(isSecond ? 'atan' : 'tan')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-400 rounded-xl text-xs font-semibold"
            >
              {isSecond ? 'tan⁻¹' : 'tan'}
            </button>
            <button
              onClick={() => handleConstant('pi')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 rounded-xl text-xs font-semibold font-serif"
            >
              π
            </button>
            <button
              onClick={() => handleConstant('e')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 rounded-xl text-xs font-semibold font-serif"
            >
              e
            </button>

            {/* Row 2 Scientific */}
            <button
              onClick={() => handleScientificUnary(isSecond ? 'eˣ' : 'ln')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 rounded-xl text-xs font-semibold"
            >
              {isSecond ? 'eˣ' : 'ln'}
            </button>
            <button
              onClick={() => handleScientificUnary(isSecond ? '10ˣ' : 'log10')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 rounded-xl text-xs font-semibold"
            >
              {isSecond ? '10ˣ' : 'log'}
            </button>
            <button
              onClick={() => handleScientificUnary('x²')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              x²
            </button>
            <button
              onClick={() => handleOp('^')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              xʸ
            </button>
            <button
              onClick={() => handleScientificUnary('√')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              √x
            </button>

            {/* Row 3 Scientific */}
            <button
              onClick={() => handleScientificUnary('n!')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              x!
            </button>
            <button
              onClick={() => handleScientificUnary('1/x')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              1/x
            </button>
            <button
              onClick={() => handleScientificUnary('|x|')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              |x|
            </button>
            <button
              onClick={() => handleOp('mod')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              mod
            </button>
            <button
              onClick={() => handleConstant('rand')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 rounded-xl text-xs font-semibold"
            >
              Rand
            </button>
          </div>
        )}

        {/* Standard Numeric + Operator Pad (4 Columns) */}
        <div className="grid grid-cols-4 gap-1.5 flex-1">
          <button
            onClick={handleClear}
            className="p-3 bg-slate-900 hover:bg-rose-900/40 border border-slate-800 hover:border-rose-700/60 text-rose-400 rounded-2xl font-bold text-xs transition-colors"
          >
            AC
          </button>
          <button
            onClick={() => handleScientificUnary('±')}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-2xl font-bold text-xs transition-colors"
          >
            ±
          </button>
          <button
            onClick={() => handleScientificUnary('%')}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-2xl font-bold text-xs transition-colors"
          >
            %
          </button>
          <button
            onClick={() => handleOp('÷')}
            className={`p-3 rounded-2xl font-bold text-base transition-colors ${
              op === '÷' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            ÷
          </button>

          {/* Digits 7, 8, 9 */}
          {['7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="p-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-white rounded-2xl font-bold text-base transition-colors active:scale-95"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOp('×')}
            className={`p-3 rounded-2xl font-bold text-base transition-colors ${
              op === '×' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            ×
          </button>

          {/* Digits 4, 5, 6 */}
          {['4', '5', '6'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="p-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-white rounded-2xl font-bold text-base transition-colors active:scale-95"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOp('-')}
            className={`p-3 rounded-2xl font-bold text-base transition-colors ${
              op === '-' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            -
          </button>

          {/* Digits 1, 2, 3 */}
          {['1', '2', '3'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="p-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-white rounded-2xl font-bold text-base transition-colors active:scale-95"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOp('+')}
            className={`p-3 rounded-2xl font-bold text-base transition-colors ${
              op === '+' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            +
          </button>

          {/* Digit 0, Decimal, Backspace / Delete, Equals */}
          <button
            onClick={() => handleDigit('0')}
            className="p-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-white rounded-2xl font-bold text-base transition-colors active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="p-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-white rounded-2xl font-bold text-base transition-colors"
          >
            .
          </button>
          <button
            onClick={handleBackspace}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-2xl font-bold flex items-center justify-center transition-colors"
            title="Delete character"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button
            onClick={handleEquals}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
