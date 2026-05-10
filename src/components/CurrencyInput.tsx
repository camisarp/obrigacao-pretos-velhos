import React, { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';

type CurrencyInputProps = {
  initialValue: number;
  onSave: (value: number) => void;
  isAdmin: boolean;
  isCompact?: boolean;
};

const CurrencyInput = ({ initialValue, onSave, isAdmin, isCompact = false }: CurrencyInputProps) => {
  const [localValue, setLocalValue] = useState(initialValue?.toString().replace('.', ',') || '');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const formatted = initialValue?.toString().replace('.', ',') || '';

    if (formatted !== localValue && document.activeElement !== inputRef.current) {
      setLocalValue(formatted);
    }
  }, [initialValue, localValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;

    const val = e.target.value.replace(/[^0-9,]/g, '');
    setLocalValue(val);

    if (val && !val.endsWith(',')) {
      const numericVal = parseFloat(val.replace(',', '.'));

      if (!isNaN(numericVal)) {
        onSave(numericVal);
      }
    } else if (val === '') {
      onSave(0);
    }
  };

  const containerClasses = isCompact
    ? `flex items-center gap-1.5 rounded-xl p-2 px-3 border shadow-inner transition-all ${
        isAdmin ? 'bg-white border-stone-200 focus-within:border-amber-500' : 'bg-stone-100 border-stone-100 opacity-60'
      }`
    : `flex items-center gap-2 rounded-2xl p-2.5 border shadow-inner group transition-all ${
        isAdmin ? 'bg-white border-stone-200 focus-within:ring-2 ring-amber-500/20' : 'bg-stone-100 border-stone-100 opacity-70'
      }`;

  return (
    <div className={containerClasses}>
      <span className="text-[10px] font-black text-amber-600">R$</span>

      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        placeholder="0,00"
        className={`${isCompact ? 'w-20' : 'w-full'} bg-transparent outline-none font-black text-xs text-stone-900 disabled:cursor-not-allowed text-right`}
        value={localValue}
        onChange={handleChange}
        disabled={!isAdmin}
      />

      {!isAdmin && <Lock size={isCompact ? 10 : 12} className="text-stone-300" />}
    </div>
  );
};

export default CurrencyInput;