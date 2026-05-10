import { useEffect, useState } from 'react';
import { FolderPlus, X } from 'lucide-react';

type AddResourceSectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; emoji: string }) => void;
  isSaving: boolean;
};

const AddResourceSectionModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: AddResourceSectionModalProps) => {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('📦');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setEmoji('📦');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title,
      emoji: emoji.trim() || '📦',
    });
  };

  return (
    <div className="fixed inset-0 z-[850] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border-t-[10px] border-amber-600 animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter">
              Novo tópico
            </h3>

            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mt-1">
              Criar nova categoria
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-2">
              Nome do tópico
            </label>

            <input
              type="text"
              placeholder="Ex: DESCARTÁVEIS"
              className="w-full mt-1 bg-stone-50 border-2 border-stone-100 rounded-2xl p-4 text-xs font-black uppercase outline-none focus:border-amber-600"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-2">
              Emoji do tópico
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
            type="button"
            onClick={handleSave}
            disabled={!title.trim() || isSaving}
            className="w-full flex items-center justify-center gap-3 bg-[#3e2723] text-white rounded-2xl py-5 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl border-b-4 border-black disabled:opacity-50 active:scale-95 transition-all"
          >
            <FolderPlus size={16} />
            {isSaving ? 'Salvando...' : 'Salvar tópico'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddResourceSectionModal;