type AttendanceControlProps = {
    status: string;
    onChange: (status: string) => void;
  };
  
  const AttendanceControl = ({ status, onChange }: AttendanceControlProps) => {
    const optionClass = (option: string) => {
      const isActive = status === option;
  
      if (option === 'attended') {
        return isActive
          ? 'bg-green-600 text-white border-green-700 shadow-md'
          : 'bg-white text-green-700 border-green-100 hover:bg-green-50';
      }
  
      if (option === 'missed') {
        return isActive
          ? 'bg-red-600 text-white border-red-700 shadow-md'
          : 'bg-white text-red-700 border-red-100 hover:bg-red-50';
      }
  
      return isActive
        ? 'bg-stone-700 text-white border-stone-800 shadow-md'
        : 'bg-white text-stone-500 border-stone-100 hover:bg-stone-50';
    };
  
    return (
      <div className="pt-3 border-t border-stone-100 space-y-2">
        <p className="text-[7px] font-black text-stone-400 uppercase tracking-widest ml-1">
          Comparecimento
        </p>
  
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onChange('attended')}
            className={`py-2 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${optionClass('attended')}`}
          >
            Foi
          </button>
  
          <button
            type="button"
            onClick={() => onChange('missed')}
            className={`py-2 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${optionClass('missed')}`}
          >
            Não foi
          </button>
  
          <button
            type="button"
            onClick={() => onChange('pending')}
            className={`py-2 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${optionClass('pending')}`}
          >
            Limpar
          </button>
        </div>
      </div>
    );
  };
  
  export default AttendanceControl;