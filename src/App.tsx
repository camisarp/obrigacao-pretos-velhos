import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import {
  Clock,
  AlertTriangle,
  Search,
  ChefHat,
  Sparkles,
  PlusCircle,
  XCircle,
  Coffee,
  Heart,
  Users2,
  Calculator,
  DollarSign,
  Crown,
  CheckCircle,
  Loader2,
  Wind,
  Leaf,
  Flame,
  Plus,
  Pencil,
  Trash2,
  ListChecks,
  FileText,
  ExternalLink,
  Lock,
  Unlock,
  X,
  FileDown,
} from 'lucide-react';

// --- CONFIGURAÇÃO FIREBASE DO SEU PROJETO ---
const firebaseConfig = {
  apiKey: 'AIzaSyCMmTsBY9KKa7-VUs7QPo_Q3wMxh_WnLVQ',
  authDomain: 'obrigacao-pretos-velhos.firebaseapp.com',
  projectId: 'obrigacao-pretos-velhos',
  storageBucket: 'obrigacao-pretos-velhos.firebasestorage.app',
  messagingSenderId: '604295724540',
  appId: '1:604295724540:web:ebf88353bf77bf80d98679',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_PIN = '2026';

// Regra da cota: essas pessoas aparecem na presença, mas não entram na divisão financeira.
const NOMES_FORA_DA_COTA = ['CAMILA21', 'CAMILA 21', 'BIA'];

const normalizeName = (value) => {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
};

// --- COMPONENTES AUXILIARES ---

const ItemIcon = ({ emoji, color = 'bg-stone-100' }) => (
  <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shadow-sm text-xl shrink-0 border border-stone-200/50`}>
    {emoji}
  </div>
);

const CurrencyInput = ({ initialValue, onSave, isAdmin, isCompact = false }) => {
  const [localValue, setLocalValue] = useState(initialValue?.toString().replace('.', ',') || '');
  const inputRef = React.useRef(null);

  useEffect(() => {
    const formatted = initialValue?.toString().replace('.', ',') || '';
    if (formatted !== localValue && document.activeElement !== inputRef.current) {
      setLocalValue(formatted);
    }
  }, [initialValue, localValue]);

  const handleChange = (e) => {
    if (!isAdmin) return;
    const val = e.target.value.replace(/[^0-9,]/g, '');
    setLocalValue(val);

    if (val && !val.endsWith(',')) {
      const numericVal = parseFloat(val.replace(',', '.'));
      if (!isNaN(numericVal)) onSave(numericVal);
    } else if (val === '') {
      onSave(0);
    }
  };

  const containerClasses = isCompact
    ? `flex items-center gap-1.5 rounded-xl p-2 px-3 border shadow-inner transition-all ${isAdmin ? 'bg-white border-stone-200 focus-within:border-amber-500' : 'bg-stone-100 border-stone-100 opacity-60'}`
    : `flex items-center gap-2 rounded-2xl p-2.5 border shadow-inner group transition-all ${isAdmin ? 'bg-white border-stone-200 focus-within:ring-2 ring-amber-500/20' : 'bg-stone-100 border-stone-100 opacity-70'}`;

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
}) => (
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
          <button onClick={onCancel} className="px-4 py-3 text-[10px] font-black text-stone-400 uppercase tracking-widest">
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

// --- APP PRINCIPAL ---

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [votes, setVotes] = useState([]);
  const [prices, setPrices] = useState({});
  const [settings, setSettings] = useState({ officialDateId: null });
  const [additionalItems, setAdditionalItems] = useState([]);
  const [payments, setPayments] = useState({});
  const [attendance, setAttendance] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [selectedDateId, setSelectedDateId] = useState(null);
  const [tempName, setTempName] = useState('');
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('obrigacao_admin') === 'true');
  const [isSaving, setIsSaving] = useState(false);
  const [activeItemTarget, setActiveItemTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newItemResp, setNewItemResp] = useState('');
  const [newItemQty, setNewItemQty] = useState('');

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  // Inicialização e Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error('Auth error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    const timer = setTimeout(() => setLoading(false), 3000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Listeners de Dados
  useEffect(() => {
    if (!user || !db) return;

    const unsubVotes = onSnapshot(collection(db, 'votes'), (snap) => {
      setVotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubPrices = onSnapshot(collection(db, 'prices'), (snap) => {
      const p = {};
      snap.docs.forEach((d) => {
        p[d.id] = d.data().value;
      });
      setPrices(p);
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) setSettings(snap.data());
    });

    const unsubAddItems = onSnapshot(collection(db, 'extra_items'), (snap) => {
      setAdditionalItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubPayments = onSnapshot(collection(db, 'payments'), (snap) => {
      const p = {};
      snap.docs.forEach((d) => {
        p[d.id] = d.data();
      });
      setPayments(p);
    });

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snap) => {
      const p = {};
      snap.docs.forEach((d) => {
        p[d.id] = d.data();
      });
      setAttendance(p);
    });

    return () => {
      unsubVotes();
      unsubPrices();
      unsubSettings();
      unsubAddItems();
      unsubPayments();
      unsubAttendance();
    };
  }, [user]);

  const staticData = {
    comidasList: ['FEIJOADA', 'VATAPÁ', 'CANJICA', 'PAMONHA', 'MILHO VERDE', 'BOLO DE TRIGO', 'BOLO DE MACAXEIRA', 'MUNGUZÁ', 'TAPIOCA', 'COCADA'],
    ervas: [
      { id: 'flores', item: 'FLORES BRANCAS', emoji: '💐' },
      { id: 'arruda', item: 'ARRUDA', emoji: '🌿' },
      { id: 'alfazema', item: 'ALFAZEMA', emoji: '💜' },
      { id: 'fumo', item: 'FUMO', emoji: '🌬️' },
    ],
    fundamentoExu: ['LARANJAS', 'PALMA BANANA', 'ABACAXIS', 'FARINHAS', 'AZEITE'],
    drinks: ['CAFÉ', 'VINHO', 'VINAGRE DE ÁLCOOL', 'REFRIGERANTE', 'CERVEJA'],
    velas: ['VELAS DE SÉTIMO DIA'],
  };

  const generateCombinedData = (nameList) => {
    const defaultData = {
      FEIJOADA: [
        { resp: 'KARLA', qty: 1 },
        { resp: 'THIAGO', qty: 1 },
      ],
      VATAPÁ: [
        { resp: 'MARIANA', qty: 1 },
        { resp: 'CAMILA', qty: 1 },
      ],
      CANJICA: { resp: 'CAIO', qty: 1 },
      PAMONHA: { resp: 'POLLY', qty: 1 },
      'MILHO VERDE': { resp: 'FERNANDO', qty: 1 },
      'BOLO DE TRIGO': { resp: 'BRUNA', qty: 1 },
      'BOLO DE MACAXEIRA': { resp: 'BIA', qty: 1 },
      MUNGUZÁ: { resp: 'MAYARA', qty: 1 },
      TAPIOCA: { resp: 'BRUNA', qty: 1 },
      COCADA: { resp: 'ANDRESSA', qty: 1 },
      CAFÉ: { resp: 'BRUNA', qty: 1, emoji: '☕' },
      VINHO: { resp: 'MARIANA', qty: 1, emoji: '🍷' },
      'VINAGRE DE ÁLCOOL': { resp: 'BIA', qty: 1, emoji: '🍶' },
      REFRIGERANTE: [
        { resp: 'BRUNA', qty: 1 },
        { resp: 'SHAYLANE', qty: 1 },
      ],
      CERVEJA: { resp: 'OPCIONAL', qty: 0, emoji: '🍺' },
      'VELAS DE SÉTIMO DIA': ['MARIANA', 'BRUNA', 'FERNANDO', 'CAIO', 'ANDRESSA', 'MAYARA'].map((n) => ({ resp: n, qty: 1 })),
      LARANJAS: { resp: 'RAFAEL', qty: 9, emoji: '🍊' },
      'PALMA BANANA': { resp: 'RAFAEL', qty: 1, emoji: '🍌' },
      ABACAXIS: { resp: 'RAFAEL', qty: 2, emoji: '🍍' },
      FARINHAS: { resp: 'SHAYLANE', qty: 2, emoji: '🌾' },
      AZEITE: { resp: 'SHAYLANE', qty: 1, emoji: '🏺' },
    };

    const emojiMap = {
      FEIJOADA: '🥘',
      VATAPÁ: '🍲',
      CANJICA: '🥣',
      PAMONHA: '🫔',
      'MILHO VERDE': '🌽',
      'BOLO DE TRIGO': '🥮',
      'BOLO DE MACAXEIRA': '🥮',
      MUNGUZÁ: '🥣',
      TAPIOCA: '🥟',
      COCADA: '🥥',
    };

    return nameList.map((name) => {
      const responsiblesMap = {};
      const def = defaultData[name];
      let itemEmoji = emojiMap[name] || '📦';

      if (name === 'REFRIGERANTE') itemEmoji = '🥤';
      if (name === 'VELAS DE SÉTIMO DIA') itemEmoji = '🕯️';
      if (def && !Array.isArray(def) && def.emoji) itemEmoji = def.emoji;

      if (Array.isArray(def)) {
        def.forEach((d) => {
          responsiblesMap[d.resp] = { name: d.resp, qty: d.qty, id: `static-${d.resp}`, item: name };
        });
      } else if (def) {
        responsiblesMap[def.resp] = { name: def.resp, qty: def.qty, id: `static-${def.resp}`, item: name };
      }

      additionalItems
        .filter((e) => e.item === name)
        .forEach((e) => {
          responsiblesMap[e.resp] = { name: e.resp, qty: e.qty, id: e.id, item: name };
        });

      const people = Object.values(responsiblesMap)
        .filter((p) => p.qty > 0 || (p.name === 'OPCIONAL' && p.qty >= 0))
        .sort((a, b) => a.name.localeCompare(b.name));

      return {
        item: name,
        total: people.reduce((a, b) => a + Math.max(0, b.qty), 0),
        emoji: itemEmoji,
        people,
      };
    });
  };

  const allItemsForReport = useMemo(() => {
    return {
      comidas: generateCombinedData(staticData.comidasList),
      bebidas: generateCombinedData(staticData.drinks),
      velas: generateCombinedData(staticData.velas),
      fundamento: generateCombinedData(staticData.fundamentoExu),
    };
  }, [additionalItems]);

  const filteredItems = useMemo(() => {
    const s = searchTerm.toUpperCase();
    const filterDynamic = (list) => list.filter((d) => d.item.includes(s) || d.people.some((p) => p.name.includes(s)));

    return {
      comidas: filterDynamic(allItemsForReport.comidas),
      bebidas: filterDynamic(allItemsForReport.bebidas),
      velas: filterDynamic(allItemsForReport.velas),
      fundamento: filterDynamic(allItemsForReport.fundamento),
    };
  }, [searchTerm, allItemsForReport]);

  // Todo mundo que confirmou presença aparece aqui.
  const participantsList = useMemo(() => {
    return [...new Set(votes.map((v) => normalizeName(v.userName)).filter(Boolean))].sort();
  }, [votes]);

  // Só essas pessoas entram na divisão financeira da cota.
  const quotaParticipantsList = useMemo(() => {
    return participantsList.filter((name) => !NOMES_FORA_DA_COTA.includes(name));
  }, [participantsList]);

  const presenceOnlyList = useMemo(() => {
    return participantsList.filter((name) => NOMES_FORA_DA_COTA.includes(name));
  }, [participantsList]);

  const totalParticipants = participantsList.length;
  const totalQuotaParticipants = quotaParticipantsList.length;

  const totalCost = Object.values(prices).reduce((acc, value) => acc + (Number(value) || 0), 0);

  const costPerPerson = totalQuotaParticipants > 0 ? totalCost / totalQuotaParticipants : 0;

  const totalReceived = quotaParticipantsList.reduce((acc, name) => {
    const pay = payments[name] || { paid: 0 };
    return acc + (Number(pay.paid) || 0);
  }, 0);

  const remainingTarget = Math.max(0, totalCost - totalReceived);
  const percentCollected = totalCost > 0 ? (totalReceived / totalCost) * 100 : 0;

  const dateOptions = [
    { id: 'sabado', label: 'SÁBADO, 16/05', color: 'bg-[#3e2723]' },
    { id: 'domingo', label: 'DOMINGO, 17/05', color: 'bg-[#1a1a1a]' },
  ];

  const officialDate = useMemo(() => {
    return dateOptions.find((d) => d.id === settings.officialDateId)?.label || 'NÃO DEFINIDA';
  }, [settings.officialDateId]);

  const generatedAt = useMemo(() => {
    return new Date().toLocaleString('pt-BR');
  }, [isReportOpen]);

  const reportText = useMemo(() => {
    const getStatus = (name) => attendance[name]?.status || 'pending';
    const statusLabel = (status) => {
      if (status === 'attended') return 'FOI';
      if (status === 'missed') return 'NÃO FOI';
      return 'NÃO MARCADO';
    };

    const attendedNames = participantsList.filter((name) => getStatus(name) === 'attended');
    const missedNames = participantsList.filter((name) => getStatus(name) === 'missed');
    const pendingAttendanceNames = participantsList.filter((name) => getStatus(name) === 'pending');

    const paidNames = [];
    const partialNames = [];
    const pendingPaymentNames = [];

    quotaParticipantsList.forEach((name) => {
      const pay = payments[name] || { paid: 0, proof: '', updatedAt: 0 };
      const paid = Number(pay.paid) || 0;

      if (costPerPerson > 0 && paid >= costPerPerson) {
        paidNames.push(name);
      } else if (paid > 0) {
        partialNames.push(name);
      } else {
        pendingPaymentNames.push(name);
      }
    });

    const writeList = (title, list, emptyMessage = 'Nenhum registro.') => {
      let text = `${title}
`;
      if (list.length === 0) {
        text += `- ${emptyMessage}

`;
        return text;
      }

      list.forEach((name) => {
        text += `- ${name}
`;
      });
      text += `
`;
      return text;
    };

    let report = ``;

    report += `1. RESUMO GERAL

`;
    report += `- Data oficial: ${officialDate}
`;
    report += `- Presença total confirmada: ${totalParticipants} pessoa(s)
`;
    report += `- Pessoas na cota: ${totalQuotaParticipants} pessoa(s)
`;
    report += `- Pessoas sem cota: ${presenceOnlyList.length} pessoa(s)
`;
    report += `- Fora da cota: ${presenceOnlyList.length > 0 ? presenceOnlyList.join(', ') : 'Ninguém'}

`;

    report += `2. RESUMO FINANCEIRO

`;
    report += `- Custo total dos materiais: ${formatCurrency(totalCost)}
`;
    report += `- Valor por pessoa na cota: ${formatCurrency(costPerPerson)}
`;
    report += `- Total arrecadado: ${formatCurrency(totalReceived)}
`;
    report += `- Pendência geral: ${formatCurrency(remainingTarget)}

`;

    report += `3. RESUMO DE COMPARECIMENTO

`;
    report += `- Confirmaram presença: ${totalParticipants} pessoa(s)
`;
    report += `- Foram: ${attendedNames.length} pessoa(s)
`;
    report += `- Não foram: ${missedNames.length} pessoa(s)
`;
    report += `- Não marcados: ${pendingAttendanceNames.length} pessoa(s)

`;
    report += writeList('PESSOAS QUE FORAM:', attendedNames, 'Ninguém marcado como foi.');
    report += writeList('PESSOAS QUE NÃO FORAM:', missedNames, 'Ninguém marcado como não foi.');
    report += writeList('PESSOAS AINDA NÃO MARCADAS:', pendingAttendanceNames, 'Todos foram marcados.');

    report += `4. STATUS DOS PAGAMENTOS

`;
    report += writeList('PESSOAS QUITADAS:', paidNames, 'Ninguém quitado.');

    report += `PAGAMENTOS PARCIAIS:
`;
    if (partialNames.length === 0) {
      report += `- Nenhum pagamento parcial.

`;
    } else {
      partialNames.forEach((name) => {
        const pay = payments[name] || { paid: 0 };
        const balance = Math.max(0, costPerPerson - (Number(pay.paid) || 0));
        report += `- ${name}: pagou ${formatCurrency(pay.paid)} | falta ${formatCurrency(balance)}
`;
      });
      report += `
`;
    }

    report += `PESSOAS PENDENTES:
`;
    if (pendingPaymentNames.length === 0) {
      report += `- Ninguém pendente.

`;
    } else {
      pendingPaymentNames.forEach((name) => {
        report += `- ${name}: falta ${formatCurrency(costPerPerson)}
`;
      });
      report += `
`;
    }

    report += `5. DETALHAMENTO DAS PESSOAS NA COTA

`;

    quotaParticipantsList.forEach((name) => {
      const pay = payments[name] || { paid: 0, proof: '', updatedAt: 0 };
      const paid = Number(pay.paid) || 0;
      const isFullyPaid = costPerPerson > 0 && paid >= costPerPerson;
      const balance = costPerPerson > 0 ? Math.max(0, costPerPerson - paid) : 0;
      const status = isFullyPaid ? 'PAGO (QUITADO)' : paid > 0 ? 'PAGO (PARCIAL)' : 'PENDENTE';

      const userItems = [];
      const allCategories = [...allItemsForReport.comidas, ...allItemsForReport.bebidas, ...allItemsForReport.velas, ...allItemsForReport.fundamento];

      allCategories.forEach((item) => {
        const found = item.people.find((p) => p.name === name);
        if (found) userItems.push(`${item.item} (${found.qty})`);
      });

      report += `👤 NOME: ${name}
`;
      report += `   COMPARECIMENTO: ${statusLabel(getStatus(name))}
`;
      report += `   STATUS FINANCEIRO: ${status}
`;
      report += `   VALOR PAGO: ${formatCurrency(paid)}
`;
      report += `   VALOR FALTANTE: ${formatCurrency(balance)}
`;
      report += `   O QUE LEVOU: ${userItems.length > 0 ? userItems.join(', ') : 'NENHUM ITEM SELECIONADO'}
`;
      if (pay.proof) report += `   COMPROVANTE: ${pay.proof}
`;
      if (pay.updatedAt) report += `   ÚLTIMA ATUALIZAÇÃO: ${new Date(pay.updatedAt).toLocaleString('pt-BR')}
`;
      report += `
`;
    });

    report += `6. PESSOAS SEM COTA

`;

    if (presenceOnlyList.length === 0) {
      report += `- Nenhuma pessoa sem cota.

`;
    } else {
      presenceOnlyList.forEach((name) => {
        report += `👤 NOME: ${name}
`;
        report += `   COMPARECIMENTO: ${statusLabel(getStatus(name))}
`;
        report += `   STATUS FINANCEIRO: FORA DA COTA

`;
      });
    }

    report += `7. RESUMO DE MATERIAIS POR CATEGORIA

`;

    const cats = [
      { title: 'MESA DE COMIDAS', data: allItemsForReport.comidas },
      { title: 'CAFÉ E BEBIDAS', data: allItemsForReport.bebidas },
      { title: 'VELAS DE SÉTIMO DIA', data: allItemsForReport.velas },
      { title: 'FUNDAMENTOS DE EXU ONAN E CATIÇO', data: allItemsForReport.fundamento },
    ];

    cats.forEach((cat) => {
      report += `[${cat.title}]
`;
      cat.data.forEach((item) => {
        const resps = item.people.map((p) => `${p.name} (${p.qty})`).join(', ');
        if (resps) report += `  - ${item.item}: ${resps}
`;
      });
      report += `
`;
    });

    report += `8. OBSERVAÇÕES FINAIS

`;
    report += `Este relatório consolida as informações registradas no dashboard da Obrigação de Pretos Velhos, incluindo confirmações, comparecimento, contribuições financeiras e materiais organizados.

`;
    report += `As pessoas fora da cota foram mantidas no controle de presença, mas não participaram da divisão dos custos dos materiais.

`;
    report += `Saravá Pretos Velhos.
`;
    report += `Adorei as Almas.
`;

    return report;
  }, [officialDate, totalParticipants, totalQuotaParticipants, participantsList, quotaParticipantsList, presenceOnlyList, totalCost, costPerPerson, totalReceived, remainingTarget, allItemsForReport, payments, attendance]);

  const handleGeneratePDF = async () => {
    const escapedReport = reportText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    let logoUrl = '';

    try {
      const logoResponse = await fetch('/logo-ile.png');
      const logoBlob = await logoResponse.blob();

      logoUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          resolve(reader.result);
        };

        reader.onerror = reject;
        reader.readAsDataURL(logoBlob);
      });
    } catch (error) {
      console.error('Erro ao carregar a logo para o relatório:', error);
    }

    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="Logo do Ilè" class="logo" />`
      : '';

    const html = `<!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Relatório - Obrigação Pretos Velhos</title>

          <style>
            body {
              margin: 0;
              padding: 40px;
              background: #f7f3f0;
              color: #2d1b18;
              font-family: Arial, sans-serif;
            }

            .page {
              max-width: 800px;
              margin: 0 auto;
              background: #ffffff;
              padding: 40px;
              border-radius: 24px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            }

            .header {
              text-align: center;
              padding-bottom: 24px;
              margin-bottom: 28px;
              border-bottom: 1px solid #d6d3d1;
            }

            .logo {
              width: 130px;
              height: auto;
              margin: 0 auto 18px;
              display: block;
            }

            .title {
              font-size: 20px;
              font-weight: 900;
              text-transform: uppercase;
              margin: 0;
              color: #1c1917;
              letter-spacing: 0.04em;
            }

            .subtitle {
              font-size: 16px;
              font-weight: 900;
              text-transform: uppercase;
              margin: 6px 0 18px;
              color: #292524;
              letter-spacing: 0.04em;
            }

            .meta {
              font-size: 13px;
              line-height: 1.6;
              color: #44403c;
              margin: 0;
            }

            .blessing {
              margin-top: 14px;
              font-size: 13px;
              font-weight: 700;
              color: #44403c;
            }

            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: "Courier New", Courier, monospace;
              font-size: 12px;
              line-height: 1.6;
              margin: 0;
              color: #2d1b18;
            }

            .print-button {
              position: fixed;
              top: 16px;
              right: 16px;
              border: 0;
              border-radius: 999px;
              padding: 12px 18px;
              background: #d97706;
              color: white;
              font-weight: 900;
              cursor: pointer;
              box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
            }

            @media print {
              body {
                background: #ffffff;
                padding: 0;
              }

              .page {
                max-width: none;
                margin: 0;
                padding: 0;
                box-shadow: none;
                border-radius: 0;
              }

              .print-button {
                display: none;
              }

              @page {
                margin: 15mm;
              }
            }
          </style>
        </head>

        <body>
          <button class="print-button" onclick="window.print()">Salvar como PDF</button>

          <div class="page">
            <div class="header">
              ${logoHtml}

              <h1 class="title">Relatório Final da Obrigação</h1>
              <p class="subtitle">Pretos Velhos 2026</p>

              <p class="meta"><strong>Casa:</strong> Ilè Asè Ôgún Méjèje ty Ộ'ṣun Íjimú</p>
              <p class="meta"><strong>Bàbálòrìṣà:</strong> Geraldo Nunes da Rocha</p>
              <p class="meta"><strong>Data oficial:</strong> ${officialDate}</p>
              <p class="meta"><strong>Gerado em:</strong> ${generatedAt}</p>

              <p class="blessing">Adorei as Almas. 🍃</p>
            </div>

            <pre>${escapedReport}</pre>
          </div>
        </body>
      </html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');

    if (!printWindow) {
      URL.revokeObjectURL(url);
      alert('O navegador bloqueou a abertura do relatório. Permita pop-ups para este site e tente novamente.');
      return;
    }

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  };

  const handleSaveResourceEntry = async (itemName, section) => {
    if (!newItemResp.trim() || !user) return;
    setIsSaving(true);

    const upperResp = normalizeName(newItemResp);
    const upperItem = itemName.toUpperCase();
    const qtyNum = parseInt(newItemQty) || 1;

    try {
      const existingEntry = additionalItems.find((e) => e.item === upperItem && e.resp === upperResp);

      if (editingId && !editingId.toString().startsWith('static-')) {
        await updateDoc(doc(db, 'extra_items', editingId), { qty: qtyNum, section, at: Date.now() });
      } else if (existingEntry) {
        await updateDoc(doc(db, 'extra_items', existingEntry.id), { qty: qtyNum, section, at: Date.now() });
      } else {
        await addDoc(collection(db, 'extra_items'), { item: upperItem, resp: upperResp, qty: qtyNum, section, at: Date.now() });
      }

      setNewItemResp('');
      setNewItemQty('');
      setActiveItemTarget(null);
      setEditingId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveExtraItem = async (idToDelete, respName, itemName) => {
    setIsSaving(true);

    try {
      const upperResp = normalizeName(respName);
      const upperItem = itemName.toUpperCase();

      if (idToDelete && !idToDelete.toString().startsWith('static-')) {
        await deleteDoc(doc(db, 'extra_items', idToDelete));
      }

      await addDoc(collection(db, 'extra_items'), { item: upperItem, resp: upperResp, qty: -1, section: 'removed', at: Date.now() });
      setActiveItemTarget(null);
      setEditingId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddVote = async () => {
    if (!tempName.trim() || !selectedDateId || !user || isSaving) return;

    const name = normalizeName(tempName);

    const alreadyVotedThisDate = votes.some(
      (vote) => normalizeName(vote.userName) === name && vote.dateId === selectedDateId
    );

    if (alreadyVotedThisDate) {
      alert(name + ' já confirmou presença nessa data.');
      return;
    }

    setIsSaving(true);

    const voteId = selectedDateId + '_' + encodeURIComponent(name);

    try {
      await setDoc(doc(db, 'votes', voteId), {
        userId: user.uid,
        userName: name,
        dateId: selectedDateId,
        at: Date.now(),
      });

      setIsModalOpen(false);
      setTempName('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveVote = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'votes', id));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePriceUpdate = async (id, val) => {
    if (!user || !isAdmin) return;
    try {
      await setDoc(doc(db, 'prices', id), { value: val });
    } catch (e) {
      console.error(e);
    }
  };

  const updatePayment = async (userName, field, value) => {
    if (!user || !isAdmin) return;
    const id = normalizeName(userName);
    const current = payments[id] || { paid: 0, proof: '', updatedAt: 0 };

    try {
      await setDoc(doc(db, 'payments', id), { ...current, [field]: value, updatedAt: Date.now() });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetOfficial = async (id) => {
    if (!user || !isAdmin) return;
    const newId = settings.officialDateId === id ? null : id;

    try {
      await setDoc(doc(db, 'settings', 'global'), { officialDateId: newId });
    } catch (e) {
      console.error(e);
    }
  };

  const updateAttendance = async (userName, status) => {
    if (!user || !isAdmin) return;
    const id = normalizeName(userName);

    try {
      await setDoc(doc(db, 'attendance', id), {
        userName: id,
        status,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const getAttendanceStatus = (userName) => {
    const id = normalizeName(userName);
    return attendance[id]?.status || 'pending';
  };

  const tryAdminLogin = () => {
    if (adminInput === ADMIN_PIN) {
      setIsAdmin(true);
      localStorage.setItem('obrigacao_admin', 'true');
      setIsAdminModalOpen(false);
      setAdminInput('');
    } else {
      setAdminInput('');
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('obrigacao_admin');
  };

  const startEdit = (person, item) => {
    setActiveItemTarget(item);
    setEditingId(person.id);
    setNewItemResp(person.name);
    setNewItemQty(person.qty.toString());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3f0] flex flex-col items-center justify-center p-10 space-y-4">
        <Loader2 className="animate-spin text-amber-600" size={48} />
        <p className="font-black text-[10px] text-stone-400 uppercase tracking-[0.2em]">Conectando ao Ilè...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3f0] pb-24 font-sans text-stone-900 select-none overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 flex flex-col justify-around items-center">
        <Coffee size={300} className="-rotate-12" />
        <Wind size={350} className="rotate-12" />
        <Leaf size={400} />
      </div>

      <header className="bg-gradient-to-b from-[#2d1b18] to-[#1a0f0d] text-white px-4 sm:px-6 pt-8 sm:pt-10 pb-12 sm:pb-14 lg:pb-16 rounded-b-[2.5rem] sm:rounded-b-[3.5rem] shadow-2xl relative z-10 border-b-8 border-black/40">
        <div className="w-full max-w-[1100px] mx-auto text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-4 bg-white/10 rounded-full border-2 border-amber-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Coffee className="text-amber-500 animate-bounce-subtle" size={42} />
            </div>
          </div>

          <div>
            <h2 className="text-sm md:text-lg font-bold text-white/80 uppercase tracking-[0.4em] mb-1 transition-all">OBRIGAÇÃO</h2>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[0.05em] leading-none drop-shadow-lg text-amber-500 transition-all">PRETOS VELHOS</h1>
          </div>

          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-[2px] w-8 bg-amber-500/40 rounded-full" />
            <p className="text-amber-100/50 font-black text-[10px] md:text-xs tracking-[0.5em] uppercase">ADOREI AS ALMAS</p>
            <div className="h-[2px] w-8 bg-amber-500/40 rounded-full" />
          </div>

          <div className="flex items-center justify-center gap-1 bg-black/30 p-1.5 rounded-[2rem] border border-white/10 w-fit mx-auto backdrop-blur-xl mt-4">
            <button
              onClick={() => setView('dashboard')}
              className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${view === 'dashboard' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 'text-white/40 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('finance')}
              className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${view === 'finance' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 'text-white/40 hover:text-white'}`}
            >
              Financeiro
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 space-y-4 relative z-20">
        {view === 'dashboard' && (
          <div className="animate-in fade-in duration-500 space-y-4">
            {!settings.officialDateId && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-l-8 border-red-600 flex items-center gap-4 border border-stone-200/50 max-w-xl mx-auto md:max-w-full">
                <div className="bg-red-50 p-2 rounded-xl text-red-600">
                  <AlertTriangle size={20} className="animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase leading-tight text-stone-900 tracking-tight">
                  CONFIRMAÇÃO ATÉ <span className="text-red-600">10/05</span>. SEM A LISTA FECHADA, O PAI DE SANTO NÃO REALIZARÁ A OBRIGAÇÃO.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-4 flex flex-col">
                {settings.officialDateId && (
                  <div className="bg-[#3e2723] text-white rounded-[2.5rem] p-6 shadow-2xl flex items-center justify-between border-b-8 border-black ring-1 ring-white/10">
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-600 p-4 rounded-3xl shadow-xl border border-white/10">
                        <CheckCircle className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase opacity-60 tracking-[0.3em] text-amber-100 mb-1">DATA OFICIAL CONFIRMADA</p>
                        <p className="text-xl md:text-2xl font-black uppercase text-amber-400 leading-none">{dateOptions.find((d) => d.id === settings.officialDateId)?.label}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-[#1a1a1a] text-white rounded-[2.5rem] p-6 shadow-2xl border-b-8 border-black relative overflow-hidden ring-1 ring-white/10 flex-1 flex flex-col justify-center">
                  <Calculator className="absolute -right-6 -bottom-6 text-white/5 pointer-events-none" size={160} />
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 flex items-center gap-2">
                        <DollarSign size={14} /> CAIXA DA OBRIGAÇÃO
                      </h3>
                      <div className="bg-white/10 px-4 py-2 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 border border-white/5">
                        <Users2 size={12} className="text-stone-400" />
                        <span>{totalQuotaParticipants} NA COTA</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/40 p-4 rounded-3xl border border-white/5 shadow-inner">
                        <p className="text-[8px] uppercase font-black text-stone-500 mb-1 tracking-widest">TOTAL MATERIAIS</p>
                        <p className="text-xl md:text-2xl font-black text-amber-100">{formatCurrency(totalCost)}</p>
                      </div>
                      <div className="bg-amber-600 p-4 rounded-3xl border-b-4 border-amber-900 shadow-lg">
                        <p className="text-[8px] font-black text-black/60 uppercase tracking-widest mb-1">COTA P/ PESSOA</p>
                        <p className="text-xl md:text-2xl font-black text-black leading-none">{formatCurrency(costPerPerson)}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <p className="text-[9px] font-black text-stone-500 uppercase tracking-[0.3em]">ARRECADAÇÃO COLETIVA</p>
                        <span className="text-[10px] font-black text-amber-500">{percentCollected.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-amber-600 transition-all duration-1000" style={{ width: `${percentCollected}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 mt-4 border-t border-white/5">
                      <div>
                        <p className="text-[8px] font-black text-stone-500 uppercase tracking-widest mb-1">JÁ ARRECADADO</p>
                        <p className="text-lg md:text-xl font-black text-green-500">{formatCurrency(totalReceived)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-stone-500 uppercase tracking-widest mb-1">FALTA ARRECADAR</p>
                        <p className="text-lg md:text-xl font-black text-red-500">{formatCurrency(remainingTarget)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex flex-col">
                <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-stone-200">
                  <div className="flex items-center justify-between mb-5 pb-2 border-b-2 border-stone-50">
                    <div className="flex items-center gap-2 text-[#3e2723]">
                      <Users2 size={18} />
                      <h3 className="font-black uppercase text-[10px] tracking-widest">PRESENÇA</h3>
                    </div>
                    <button onClick={() => (isAdmin ? logoutAdmin() : setIsAdminModalOpen(true))} className={`p-2 rounded-xl transition-all ${isAdmin ? 'bg-amber-600 text-white shadow-lg' : 'text-stone-200 hover:text-stone-400'}`}>
                      {isAdmin ? <Unlock size={16} /> : <Crown size={16} />}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {dateOptions.map((date) => {
                      const dVotes = votes.filter((v) => v.dateId === date.id).sort((a, b) => normalizeName(a.userName).localeCompare(normalizeName(b.userName)));
                      const isOfficial = settings.officialDateId === date.id;

                      return (
                        <div key={date.id} className={`rounded-[1.5rem] border-2 transition-all p-3 ${isOfficial ? 'border-amber-500 bg-amber-50/30' : 'border-stone-50 bg-stone-50/50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-2xl ${date.color} text-white shadow-lg`}>
                                <Clock size={16} />
                              </div>
                              <p className="font-black text-stone-900 text-sm uppercase leading-none">
                                {date.label} <span className="text-amber-600 ml-1">({dVotes.length})</span>
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {isAdmin && (
                                <button onClick={() => handleSetOfficial(date.id)} className={`p-2 rounded-xl transition-all ${isOfficial ? 'bg-amber-600 text-white' : 'bg-white border border-stone-200 text-stone-300'}`}>
                                  <CheckCircle size={20} />
                                </button>
                              )}
                              <button onClick={() => { setSelectedDateId(date.id); setIsModalOpen(true); }} className="p-2.5 bg-white shadow-lg border border-stone-200 rounded-xl active:scale-90 transition-all shadow-amber-900/10">
                                <Plus size={20} className="text-[#3e2723]" />
                              </button>
                            </div>
                          </div>

                          {dVotes.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-200/40">
                              {dVotes.map((v) => (
                                <div key={v.id} className="bg-white px-2 py-1 rounded-xl border border-stone-200 text-[8px] font-black text-[#3e2723] uppercase flex items-center gap-1 shadow-sm">
                                  <Heart size={8} className="text-red-500 fill-red-500" /> {String(v.userName)}
                                  {(v.userId === user?.uid || isAdmin) && <XCircle size={12} className="text-stone-300 ml-1 cursor-pointer hover:text-red-600" onClick={() => handleRemoveVote(v.id)} />}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-stone-200 flex-1">
                  <div className="flex items-center gap-2 mb-5 text-green-700 font-black uppercase text-[10px] tracking-widest leading-none">
                    <Leaf size={18} /> MATERIAIS DA PARTILHA
                  </div>
                  <div className="space-y-2">
                    {staticData.ervas.map((herb) => (
                      <div key={herb.id} className="p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between group hover:bg-white transition-all">
                        <div className="flex items-center gap-3">
                          <ItemIcon emoji={herb.emoji} />
                          <p className="font-black text-stone-800 text-[10px] uppercase tracking-tighter">{herb.item}</p>
                        </div>
                        <CurrencyInput initialValue={prices[herb.id]} onSave={(val) => handlePriceUpdate(herb.id, val)} isAdmin={isAdmin} isCompact={true} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group max-w-2xl mx-auto my-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="BUSCAR ITEM OU RESPONSÁVEL..."
                className="w-full bg-white border-2 border-stone-200 rounded-2xl py-4 pl-12 pr-6 shadow-xl outline-none focus:border-amber-400 text-[10px] font-black uppercase tracking-widest transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-8 pb-8">
              <Section
                title="MESA DE COMIDAS"
                items={filteredItems.comidas}
                icon={ChefHat}
                color="text-amber-900"
                bgColor="bg-amber-100"
                isResource
                onEdit={startEdit}
                activeItemTarget={activeItemTarget}
                setActiveItemTarget={setActiveItemTarget}
                editingId={editingId}
                setEditingId={setEditingId}
                newItemResp={newItemResp}
                setNewItemResp={setNewItemResp}
                newItemQty={newItemQty}
                setNewItemQty={setNewItemQty}
                handleSave={handleSaveResourceEntry}
                handleDelete={handleRemoveExtraItem}
                isSaving={isSaving}
                isAdmin={isAdmin}
                hideQty={true}
              />

              <Section
                title="CAFÉ E BEBIDAS"
                icon={Coffee}
                items={filteredItems.bebidas}
                color="text-[#3e2723]"
                bgColor="bg-stone-200"
                isResource
                onEdit={startEdit}
                activeItemTarget={activeItemTarget}
                setActiveItemTarget={setActiveItemTarget}
                editingId={editingId}
                setEditingId={setEditingId}
                newItemResp={newItemResp}
                setNewItemResp={setNewItemResp}
                newItemQty={newItemQty}
                setNewItemQty={setNewItemQty}
                handleSave={handleSaveResourceEntry}
                handleDelete={handleRemoveExtraItem}
                isSaving={isSaving}
                isAdmin={isAdmin}
              />

              <Section
                title="VELAS DE SÉTIMO DIA"
                icon={Flame}
                items={filteredItems.velas}
                color="text-orange-900"
                bgColor="bg-orange-50"
                isResource
                onEdit={startEdit}
                activeItemTarget={activeItemTarget}
                setActiveItemTarget={setActiveItemTarget}
                editingId={editingId}
                setEditingId={setEditingId}
                newItemResp={newItemResp}
                setNewItemResp={setNewItemResp}
                newItemQty={newItemQty}
                setNewItemQty={setNewItemQty}
                handleSave={handleSaveResourceEntry}
                handleDelete={handleRemoveExtraItem}
                isSaving={isSaving}
                isAdmin={isAdmin}
              />

              <Section
                title="FUNDAMENTOS DE EXU ONAN E CATIÇO"
                items={filteredItems.fundamento}
                icon={Sparkles}
                color="text-red-900"
                bgColor="bg-red-50"
                isResource
                onEdit={startEdit}
                activeItemTarget={activeItemTarget}
                setActiveItemTarget={setActiveItemTarget}
                editingId={editingId}
                setEditingId={setEditingId}
                newItemResp={newItemResp}
                setNewItemResp={setNewItemResp}
                newItemQty={newItemQty}
                setNewItemQty={setNewItemQty}
                handleSave={handleSaveResourceEntry}
                handleDelete={handleRemoveExtraItem}
                isSaving={isSaving}
                isAdmin={isAdmin}
              />
            </div>
          </div>
        )}

        {view === 'finance' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-stone-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-stone-50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-600 rounded-2xl text-white shadow-lg shadow-amber-600/20">
                    <ListChecks size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-stone-900 uppercase tracking-tighter leading-none">Contribuições</h2>
                    <p className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Cota por pessoa: {formatCurrency(costPerPerson)}</p>
                    <p className="text-[8px] font-bold text-amber-600 uppercase tracking-widest mt-1">Na cota: {totalQuotaParticipants} • Sem cota: {presenceOnlyList.length} • Presença total: {totalParticipants}</p>
                  </div>
                </div>

                {!isAdmin && (
                  <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-xl border border-stone-100 self-start md:self-auto">
                    <Lock size={14} className="text-amber-600" />
                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Somente leitura</span>
                  </div>
                )}
              </div>

              <div className="mb-5 flex items-center gap-2 text-stone-900 font-black uppercase text-[10px] tracking-widest">
                <DollarSign size={16} className="text-amber-600" />
                Contribuições
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
                {quotaParticipantsList.length === 0 && (
                  <div className="col-span-full p-10 text-center text-stone-300 italic text-[10px] uppercase font-black tracking-widest">
                    Ninguém entrou na cota ainda.
                  </div>
                )}

                {quotaParticipantsList.map((name) => {
                  const pay = payments[name] || { paid: 0, proof: '', updatedAt: 0 };
                  const isFullyPaid = costPerPerson > 0 && pay.paid >= costPerPerson;
                  const balance = costPerPerson > 0 ? Math.max(0, costPerPerson - pay.paid) : 0;
                  const statusColor = isFullyPaid ? 'text-green-600 bg-green-50 border-green-100' : pay.paid > 0 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-red-600 bg-red-50 border-red-100';

                  return (
                    <div key={name} className="p-4 rounded-[2rem] bg-stone-50 border border-stone-100 space-y-3 shadow-sm hover:shadow-md transition-all h-fit">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-2xl shadow-sm">
                            <Heart size={14} className="text-red-500 fill-red-500/10" />
                          </div>
                          <p className="text-xs font-black text-stone-900 uppercase tracking-tight">{String(name)}</p>
                        </div>
                        <span className={`text-[8px] font-black px-3 py-1.5 rounded-full border shadow-sm ${statusColor}`}>{isFullyPaid ? 'PAGO' : 'PENDENTE'}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label className="text-[7px] font-black text-stone-400 uppercase tracking-widest ml-3">VALOR PAGO</label>
                          <CurrencyInput initialValue={pay.paid} onSave={(val) => updatePayment(name, 'paid', val)} isAdmin={isAdmin} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[7px] font-black text-stone-400 uppercase tracking-widest ml-3">PENDÊNCIA</label>
                          <div className={`p-2.5 rounded-2xl border font-black text-[11px] text-center flex items-center justify-center h-[42px] ${isFullyPaid ? 'bg-green-50 text-green-600 border-green-100 shadow-sm' : 'bg-white text-red-600 border-stone-200 shadow-inner'}`}>
                            {isFullyPaid ? 'QUITADO' : formatCurrency(balance)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 rounded-2xl p-2.5 border bg-white border-stone-200 shadow-inner group transition-all">
                        <FileText size={14} className="text-stone-300" />
                        <input
                          type="text"
                          placeholder="LINK DO COMPROVANTE"
                          className="w-full bg-transparent outline-none font-bold text-[9px] text-stone-600 placeholder:opacity-20 uppercase"
                          value={String(pay.proof || '')}
                          onChange={(e) => updatePayment(name, 'proof', e.target.value)}
                          disabled={!isAdmin}
                        />
                        {pay.proof && (
                          <a href={pay.proof} target="_blank" rel="noreferrer" className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:scale-110 transition-transform">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>

                      {isAdmin && (
                        <AttendanceControl
                          status={getAttendanceStatus(name)}
                          onChange={(status) => updateAttendance(name, status)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {presenceOnlyList.length > 0 && (
                <div className="mt-10 pt-8 border-t border-stone-100">
                  <div className="mb-5 flex items-center gap-2 text-stone-900 font-black uppercase text-[10px] tracking-widest">
                    <Users2 size={16} className="text-amber-600" />
                    Presenças sem cota
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
                    {presenceOnlyList.map((name) => (
                      <div key={name} className="p-4 rounded-[2rem] bg-amber-50/40 border border-amber-100 space-y-4 shadow-sm hover:shadow-md transition-all h-fit">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-2xl shadow-sm">
                              <Heart size={14} className="text-red-500 fill-red-500/10" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-stone-900 uppercase tracking-tight">{String(name)}</p>
                              <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest mt-1">Fora da cota</p>
                            </div>
                          </div>
                        </div>

                        {isAdmin && (
                          <AttendanceControl
                            status={getAttendanceStatus(name)}
                            onChange={(status) => updateAttendance(name, status)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isAdmin && (
                <div className="mt-8 pt-6 border-t border-stone-100 flex justify-center">
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="flex items-center gap-3 bg-amber-600 text-white px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-amber-700 active:scale-95 transition-all border-b-4 border-amber-900"
                  >
                    <FileDown size={18} />
                    Relatório Final
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="py-8 flex flex-col items-center gap-4 opacity-20 text-[#3e2723]">
          <div className="flex gap-6">
            <Coffee size={24} />
            <Wind size={24} />
            <Leaf size={24} />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-[8px] font-black tracking-[0.8em] uppercase">SARAVÁ PRETOS VELHOS</p>
            <p className="text-[9px] font-bold tracking-widest uppercase mt-1">Ilè Asè Ôgún Méjèje ty Ộ'ṣun Íjimú</p>
            <p className="text-[8px] font-bold tracking-widest uppercase mt-0.5">Bàbálórìṣà Geraldo Nunes da Rocha</p>
          </div>
        </div>
      </main>

      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border-t-[10px] border-amber-600 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-stone-900 mb-2 uppercase text-center tracking-tighter">Modo ADM</h3>
            <input
              type="password"
              placeholder="••••"
              autoFocus
              className="w-full border-2 border-stone-100 rounded-2xl py-5 px-6 mb-6 outline-none focus:border-amber-600 font-black text-center bg-stone-50 text-stone-900 text-2xl tracking-[0.5em]"
              value={adminInput}
              onChange={(e) => setAdminInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryAdminLogin()}
            />
            <button onClick={tryAdminLogin} className="w-full bg-amber-600 text-white rounded-2xl py-5 font-black text-xs uppercase tracking-[0.2em] shadow-xl">
              Autenticar
            </button>
            <button onClick={() => setIsAdminModalOpen(false)} className="w-full py-2 mt-2 text-stone-300 font-black text-[9px] uppercase tracking-widest">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-stone-950/95 backdrop-blur-xl">
          <div className="bg-white w-full max-w-sm rounded-[4rem] p-10 shadow-2xl border-t-[14px] border-[#3e2723] animate-in zoom-in-95">
            <h3 className="text-3xl font-black text-stone-900 mb-8 uppercase text-center tracking-tighter">Confirmar</h3>
            <input
              type="text"
              placeholder="DIGITE SEU NOME"
              className="w-full border-2 border-stone-100 rounded-[2.5rem] py-6 px-8 mb-8 outline-none focus:border-amber-600 font-black text-center bg-stone-50 text-stone-900 text-lg uppercase shadow-inner"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
            />
            <button onClick={handleAddVote} disabled={!tempName.trim() || isSaving} className="w-full bg-[#3e2723] text-white rounded-[2.5rem] py-6 font-black text-xs uppercase tracking-[0.3em] shadow-xl border-b-4 border-black">
              {isSaving ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Confirmar Presença'}
            </button>
            <button onClick={() => setIsModalOpen(false)} className="w-full py-2 mt-2 text-stone-300 font-black text-[9px] uppercase tracking-widest">
              Fechar
            </button>
          </div>
        </div>
      )}

      {activeItemTarget && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border-t-8 border-amber-600">
            <h4 className="font-black uppercase text-[10px] mb-4 text-stone-900 tracking-widest">Responsável: {String(activeItemTarget)}</h4>
            <div className="space-y-4">
              <input type="text" placeholder="QUEM TRAZ?" className="w-full p-4 bg-stone-50 border rounded-xl font-black uppercase text-xs shadow-inner" value={newItemResp} onChange={(e) => setNewItemResp(e.target.value)} disabled={!!editingId} />
              <input type="number" placeholder="QTD" className="w-full p-4 bg-stone-50 border rounded-xl font-black text-xs shadow-inner" value={newItemQty} onChange={(e) => setNewItemQty(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={() => handleSaveResourceEntry(activeItemTarget, 'Geral')} className="flex-1 bg-stone-900 text-white py-4 rounded-xl font-black text-[10px] uppercase shadow-xl active:scale-95 transition-all">
                  {isSaving ? '...' : 'Salvar'}
                </button>
                <button onClick={() => { setActiveItemTarget(null); setEditingId(null); setNewItemResp(''); }} className="px-4 font-black uppercase text-[10px] text-stone-400">
                  Voltar
                </button>
              </div>
              {editingId && !editingId.toString().startsWith('static-') && (
                <button onClick={() => handleRemoveExtraItem(editingId, newItemResp, activeItemTarget)} className="w-full bg-red-50 text-red-600 py-2 rounded-lg text-[9px] font-black uppercase border border-red-100 shadow-sm active:bg-red-100 transition-all">
                  Eliminar Registro
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isReportOpen && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg md:max-w-3xl h-[85vh] md:h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-stone-50 border-b-2 border-stone-100 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-stone-900 uppercase tracking-tighter">Relatório</h3>
                <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Obrigação Pretos Velhos</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleGeneratePDF} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                  <FileDown size={14} />
                  Gerar PDF
                </button>
                <button onClick={() => setIsReportOpen(false)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div id="report-content" className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-left">
              <div className="max-w-2xl mx-auto">
                <div className="text-center pb-6 mb-6 border-b border-stone-200">
                  <img
                    src="/logo-ile.png"
                    alt="Logo do Ilè"
                    className="w-28 sm:w-32 h-auto mx-auto mb-4"
                  />

                  <h2 className="font-black text-base sm:text-lg uppercase tracking-wide text-stone-900">
                    Relatório Final da Obrigação
                  </h2>

                  <p className="font-black text-sm sm:text-base uppercase tracking-wide text-stone-800 mt-1">
                    Pretos Velhos 2026
                  </p>

                  <div className="mt-5 space-y-1 text-[11px] sm:text-sm text-stone-700 leading-relaxed">
                    <p>
                      <strong>Casa:</strong> Ilè Asè Ôgún Méjèje ty Ộ'ṣun Íjimú
                    </p>
                    <p>
                      <strong>Bàbálòrìṣà:</strong> Geraldo Nunes da Rocha
                    </p>
                    <p>
                      <strong>Data oficial:</strong> {officialDate}
                    </p>
                    <p>
                      <strong>Gerado em:</strong> {generatedAt}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-stone-700 mt-4">
                    Adorei as Almas. 🍃
                  </p>
                </div>

                <pre className="font-mono text-[11px] sm:text-[12px] text-stone-800 leading-relaxed whitespace-pre-wrap break-words m-0">
                  {reportText}
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-stone-50 bg-stone-50/50 flex flex-col items-center">
              <div className="w-32 h-[1px] bg-stone-300 mb-2" />
              <p className="text-[8px] font-black text-stone-500 uppercase tracking-widest text-center">
                Ilè Asè Ôgún Méjèje ty Ộ'ṣun Íjimú
                <br />
                Bàbálórìṣà Geraldo Nunes da Rocha
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AttendanceControl = ({ status, onChange }) => {
  const optionClass = (option) => {
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
      <p className="text-[7px] font-black text-stone-400 uppercase tracking-widest ml-1">Comparecimento</p>
      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={() => onChange('attended')} className={`py-2 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${optionClass('attended')}`}>
          Foi
        </button>
        <button type="button" onClick={() => onChange('missed')} className={`py-2 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${optionClass('missed')}`}>
          Não foi
        </button>
        <button type="button" onClick={() => onChange('pending')} className={`py-2 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${optionClass('pending')}`}>
          Limpar
        </button>
      </div>
    </div>
  );
};

// Componente que desenha as secções de itens
const Section = ({
  title,
  items,
  icon: Icon,
  color,
  bgColor,
  isResource,
  onEdit,
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
}) => (
  items.length > 0 && (
    <div className="mb-8 w-full">
      <div className={`flex items-center gap-3 mb-6 p-3 rounded-2xl ${color} ${bgColor} w-fit pr-6 shadow-md border border-white opacity-90 text-left`}>
        <Icon size={18} className="shrink-0" />
        <p className="text-[10px] font-black uppercase tracking-widest leading-none text-current">{title}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {items.map((i, idx) => (
          <div key={idx} className="p-4 rounded-[2rem] bg-white border border-stone-200 shadow-xl hover:shadow-2xl group hover:border-amber-200 transition-all flex flex-col justify-between text-left">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <ItemIcon emoji={i.emoji} />
                  <div>
                    <p className="font-black text-stone-900 text-sm leading-tight uppercase tracking-tighter">{String(i.item)}</p>
                    {isResource && !hideQty && <p className="text-[8px] font-black text-amber-600 leading-none mt-1 uppercase tracking-widest">TOTAL: {i.total}</p>}
                  </div>
                </div>

                {isResource && (
                  <button
                    onClick={() => isAdmin && (setActiveItemTarget(activeItemTarget === i.item ? null : i.item), setEditingId(null), setNewItemResp(''), setNewItemQty(''))}
                    className={`p-2 rounded-xl transition-all shadow-md shrink-0 ml-2 border-b-2 ${isAdmin ? 'bg-[#3e2723] text-white active:scale-90 border-black shadow-amber-900/20' : 'bg-stone-50 text-stone-300 cursor-not-allowed'}`}
                  >
                    {isAdmin ? <PlusCircle size={18} /> : <Lock size={18} />}
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-stone-50/80">
                <p className="text-[7px] font-black uppercase text-stone-300 tracking-widest mb-2 leading-none text-left w-full">RESPONSÁVEL(S)</p>
                <div className="flex flex-wrap gap-1.5">
                  {i.people.map((p, pIdx) => (
                    <div key={pIdx} className="bg-stone-50 border border-stone-100 px-2.5 py-1.5 rounded-xl flex items-center gap-2 shadow-sm border-b-2">
                      <p className="text-[9px] font-bold text-[#3e2723] uppercase">
                        {String(p.name)} {!hideQty && <span className="text-amber-600 font-black ml-0.5">({p.qty})</span>}
                      </p>
                      {isAdmin && (
                        <button onClick={() => onEdit(p, i.item)} className="p-0.5 text-stone-300 hover:text-amber-700 transition-colors">
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
                  onCancel={() => { setActiveItemTarget(null); setEditingId(null); }}
                  onDelete={handleDelete}
                  isSaving={isSaving}
                  isEditing={!!editingId}
                  editingId={editingId}
                  sectionLabel={title}
                  hideQty={hideQty}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
);

export default App;
