import { useEffect, useState } from 'react';
import { PlusCircle, X } from 'lucide-react';

type AddResourceItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { item: string; section: string; emoji: string }) => void;
  isSaving: boolean;
  defaultSection: string;
};

const sectionOptions = [
  'MESA DE COMIDAS',
  'CAFÉ E BEBIDAS',
  'VELAS DE SÉTIMO DIA',
  'FUNDAMENTOS DE EXU ONAN E CATIÇO',
];

const AddResourceItemModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  defaultSection,
}: AddResourceItemModalProps) => {
  const [item, setItem] = useState('');
  const [section, setSection] = useState(defaultSection || sectionOptions[0]);
  const [emoji, setEmoji] = useState('📦');

  useEffect(() => {
    if (isOpen) {
      setItem('');
      setEmoji('📦');
      setSection(defaultSection || sectionOptions[0]);
    }
  }, [isOpen, defaultSection]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!item.trim()) return;

    onSave({
      item,
      section,
      emoji: emoji.trim() || '📦',
    });
  };

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border-t-[10px] border-amber-600 animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter">
              Novo card
            </h3>

            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mt-1">
              Cadastrar item
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-2">
              Nome do item
            </label>

            <input
              type="text"
              placeholder="Ex: ÁGUA MINERAL"
              className="w-full mt-1 bg-stone-50 border-2 border-stone-100 rounded-2xl p-4 text-xs font-black uppercase outline-none focus:border-amber-600"
              value={item}
              onChange={(e) => setItem(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-2">
              Categoria
            </label>

            <select
              className="w-full mt-1 bg-stone-50 border-2 border-stone-100 rounded-2xl p-4 text-xs font-black uppercase outline-none focus:border-amber-600"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              {sectionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-2">
              Emoji do card
            </label>

            <input
              type="text"
              placeholder="📦"
              maxLength={4}
              className="w-full mt-1 bg-stone-50 border-2 border-stone-100 rounded-2xl p-4 text-xl font-black text-center outline-none focus:border-amber-600"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!item.trim() || isSaving}
            className="w-full flex items-center justify-center gap-3 bg-[#3e2723] text-white rounded-2xl py-5 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl border-b-4 border-black disabled:opacity-50 active:scale-95 transition-all"
          >
            <PlusCircle size={16} />
            {isSaving ? 'Salvando...' : 'Salvar card'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddResourceItemModal;