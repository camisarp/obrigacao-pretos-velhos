import { Trash2 } from 'lucide-react';

type ResourceFormProps = {
  itemName: string;
  onConfirm: (itemName: string) => void;
  onCancel: () => void;
  onDelete: (editingId: string, newItemResp: string, itemName: string) => void;
  isSaving: boolean;
  newItemResp: string;
  setNewItemResp: (value: string) => void;
  newItemQty: string;
  setNewItemQty: (value: string) => void;
  isEditing: boolean;
  editingId: string;
  sectionLabel: string;
  hideQty?: boolean;
};

const ResourceForm = ({
  itemName,
  onConfirm,
  onCancel,
  onDelete,
  isSaving,
  newItemResp,
  setNewItemResp,
  newItemQty,
  setNewItemQty,
  isEditing,
  editingId,
  sectionLabel,
  hideQty,
}: ResourceFormProps) => (
  <div className="mt-4 p-4 bg-amber-50/90 backdrop-blur-sm rounded-2xl border-2 border-amber-200 animate-in fade-in slide-in-from-top-2 shadow-inner">
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-black uppercase text-amber-900 tracking-widest">
        {isEditing ? `EDITAR EM ${sectionLabel}` : `ACRESCENTAR EM ${sectionLabel}`}
      </p>

      <div className={hideQty ? 'flex flex-col' : 'grid grid-cols-3 gap-2'}>
        <input
          type="text"
          placeholder="QUEM TRAZ?"
          className={`${hideQty ? 'w-full' : 'col-span-2'} bg-white border border-amber-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-amber-600 text-stone-900 shadow-sm uppercase`}
          value={newItemResp}
          onChange={(e) => setNewItemResp(e.target.value)}
          disabled={isEditing}
        />

        {!hideQty && (
          <input
            type="number"
            placeholder="QTD"
            className="col-span-1 bg-white border border-amber-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-amber-600 text-stone-900 text-center shadow-sm"
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(itemName)}
            disabled={isSaving || !newItemResp.trim()}
            className="flex-1 bg-[#3e2723] text-white rounded-xl py-3 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 disabled:opacity-50 border-b-4 border-black"
          >
            {isSaving ? 'A GUARDAR...' : isEditing ? 'ATUALIZAR' : 'CONFIRMAR'}
          </button>

          <button
            onClick={onCancel}
            className="px-4 py-3 text-[10px] font-black text-stone-400 uppercase tracking-widest"
          >
            VOLTAR
          </button>
        </div>

        {isEditing && (
          <button
            onClick={() => onDelete(editingId, newItemResp, itemName)}
            className="w-full bg-red-50 text-red-600 rounded-xl py-2 font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-red-100 active:bg-red-100 transition-colors"
          >
            <Trash2 size={12} /> ELIMINAR ESTE REGISTRO
          </button>
        )}
      </div>
    </div>
  </div>
);

export default ResourceForm;