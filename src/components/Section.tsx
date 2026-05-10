import { Lock, Pencil, Plus, PlusCircle, Trash2 } from 'lucide-react';
import ResourceForm from './ResourceForm';

type SectionProps = {
  title: string;
  items: any[];
  icon: any;
  color: string;
  bgColor: string;
  isResource?: boolean;
  onEdit: (person: any, item: string) => void;
  onAddItem?: () => void;
  onDeleteSection?: () => void;
  onDeleteItem?: (item: any) => void;
  canDeleteSection?: boolean;
  activeItemTarget: string | null;
  setActiveItemTarget: (value: string | null) => void;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  newItemResp: string;
  setNewItemResp: (value: string) => void;
  newItemQty: string;
  setNewItemQty: (value: string) => void;
  handleSave: (itemName: string, section: string) => void;
  handleDelete: (editingId: string, newItemResp: string, itemName: string) => void;
  isSaving: boolean;
  isAdmin: boolean;
  hideQty?: boolean;
};

const ItemIcon = ({ emoji, color = 'bg-stone-100' }: { emoji: string; color?: string }) => (
  <div
    className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shadow-sm text-xl shrink-0 border border-stone-200/50`}
  >
    {emoji}
  </div>
);

const Section = ({
  title,
  items,
  icon: Icon,
  color,
  bgColor,
  isResource,
  onEdit,
  onAddItem,
  onDeleteSection,
  onDeleteItem,
  canDeleteSection,
  activeItemTarget,
  setActiveItemTarget,
  editingId,
  setEditingId,
  newItemResp,
  setNewItemResp,
  newItemQty,
  setNewItemQty,
  handleSave,
  handleDelete,
  isSaving,
  isAdmin,
  hideQty,
}: SectionProps) => (
  <div className="mb-8 w-full">
    <div className="flex items-center justify-between gap-3 mb-6">
      <div
        className={`flex items-center gap-3 p-3 rounded-2xl ${color} ${bgColor} w-fit pr-6 shadow-md border border-white opacity-90 text-left`}
      >
        <Icon size={18} className="shrink-0" />

        <p className="text-[10px] font-black uppercase tracking-widest leading-none text-current">
          {title}
        </p>
      </div>

      {isResource && isAdmin && (
        <div className="flex items-center gap-2">
          {onAddItem && (
            <button
              type="button"
              onClick={onAddItem}
              className="flex items-center gap-2 bg-white text-[#3e2723] border border-stone-200 rounded-2xl px-4 py-3 font-black text-[8px] uppercase tracking-widest shadow-md active:scale-95 transition-all"
            >
              <Plus size={14} />
              Novo item
            </button>
          )}

          {canDeleteSection && onDeleteSection && (
            <button
              type="button"
              onClick={onDeleteSection}
              className="flex items-center justify-center bg-red-50 text-red-600 border border-red-100 rounded-2xl px-3 py-3 font-black text-[8px] uppercase tracking-widest shadow-md active:scale-95 hover:bg-red-100 transition-all"
              title="Remover tópico"
              aria-label="Remover tópico"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>

    {items.length === 0 ? (
      <div className="bg-white/70 border-2 border-dashed border-stone-200 rounded-[2rem] p-8 text-center shadow-sm">
        <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">
          Nenhum item cadastrado neste tópico ainda.
        </p>

        {isResource && isAdmin && onAddItem && (
          <button
            type="button"
            onClick={onAddItem}
            className="mt-4 inline-flex items-center gap-2 bg-[#3e2723] text-white rounded-2xl px-5 py-3 font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            <Plus size={14} />
            Adicionar primeiro item
          </button>
        )}
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {items.map((i, idx) => (
          <div
            key={idx}
            className="p-4 rounded-[2rem] bg-white border border-stone-200 shadow-xl hover:shadow-2xl group hover:border-amber-200 transition-all flex flex-col justify-between text-left"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <ItemIcon emoji={i.emoji} />

                  <div>
                    <p className="font-black text-stone-900 text-sm leading-tight uppercase tracking-tighter">
                      {String(i.item)}
                    </p>

                    {isResource && !hideQty && (
                      <p className="text-[8px] font-black text-amber-600 leading-none mt-1 uppercase tracking-widest">
                        TOTAL: {i.total}
                      </p>
                    )}
                  </div>
                </div>

                {isResource && (
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() =>
                        isAdmin &&
                        (setActiveItemTarget(activeItemTarget === i.item ? null : i.item),
                        setEditingId(null),
                        setNewItemResp(''),
                        setNewItemQty(''))
                      }
                      className={`p-2 rounded-xl transition-all shadow-md border-b-2 ${
                        isAdmin
                          ? 'bg-[#3e2723] text-white active:scale-90 border-black shadow-amber-900/20'
                          : 'bg-stone-50 text-stone-300 cursor-not-allowed'
                      }`}
                    >
                      {isAdmin ? <PlusCircle size={18} /> : <Lock size={18} />}
                    </button>

                    {isAdmin && i.canDeleteItem && onDeleteItem && (
                      <button
                        type="button"
                        onClick={() => onDeleteItem(i)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100 shadow-md border-b-2 active:scale-90 hover:bg-red-100 transition-all"
                        title="Remover card"
                        aria-label="Remover card"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-stone-50/80">
                <p className="text-[7px] font-black uppercase text-stone-300 tracking-widest mb-2 leading-none text-left w-full">
                  RESPONSÁVEL(S)
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {i.people.length === 0 && (
                    <p className="text-[9px] font-bold text-stone-300 uppercase italic">
                      Nenhum responsável ainda
                    </p>
                  )}

                  {i.people.map((p: any, pIdx: number) => (
                    <div
                      key={pIdx}
                      className="bg-stone-50 border border-stone-100 px-2.5 py-1.5 rounded-xl flex items-center gap-2 shadow-sm border-b-2"
                    >
                      <p className="text-[9px] font-bold text-[#3e2723] uppercase">
                        {String(p.name)}
                        {!hideQty && (
                          <span className="text-amber-600 font-black ml-0.5">
                            ({p.qty})
                          </span>
                        )}
                      </p>

                      {isAdmin && (
                        <button
                          onClick={() => onEdit(p, i.item)}
                          className="p-0.5 text-stone-300 hover:text-amber-700 transition-colors"
                        >
                          <Pencil size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isResource && isAdmin && activeItemTarget === i.item && (
              <div className="border-t border-stone-100/80 mt-2">
                <ResourceForm
                  itemName={i.item}
                  newItemResp={newItemResp}
                  setNewItemResp={setNewItemResp}
                  newItemQty={newItemQty}
                  setNewItemQty={setNewItemQty}
                  onConfirm={(name) => handleSave(name, title)}
                  onCancel={() => {
                    setActiveItemTarget(null);
                    setEditingId(null);
                  }}
                  onDelete={handleDelete}
                  isSaving={isSaving}
                  isEditing={!!editingId}
                  editingId={editingId || ''}
                  sectionLabel={title}
                  hideQty={hideQty}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Section;