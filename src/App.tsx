import React, { useEffect, useMemo, useState } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import {
  Clock,
  AlertTriangle,
  Search,
  ChefHat,
  Sparkles,
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
  ListChecks,
  FileText,
  ExternalLink,
  Lock,
  Unlock,
  FileDown,
  FolderPlus,
} from 'lucide-react';

import AddResourceItemModal from './components/AddResourceItemModal';
import AddResourceSectionModal from './components/AddResourceSectionModal';
import AttendanceControl from './components/AttendanceControl';
import BackToTopButton from './components/BackToTopButton';
import CurrencyInput from './components/CurrencyInput';
import ReportModal from './components/ReportModal';
import Section from './components/Section';

import { auth, db } from './config/firebase';
import { staticData } from './data/staticData';
import { formatCurrency } from './utils/formatters';
import { normalizeName } from './utils/normalizeName';
import { buildReportText } from './utils/report';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '';

const NOMES_FORA_DA_COTA = ['CAMILA21', 'CAMILA 21', 'BIA'];

const ItemIcon = ({ emoji, color = 'bg-stone-100' }: { emoji: string; color?: string }) => (
  <div
    className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shadow-sm text-xl shrink-0 border border-stone-200/50`}
  >
    {emoji}
  </div>
);

const createEmojiIcon = (emoji: string) => {
  return function EmojiIcon({ className }: { className?: string; size?: number }) {
    return <span className={`text-base leading-none ${className || ''}`}>{emoji}</span>;
  };
};

const BASE_RESOURCE_SECTIONS = [
  {
    id: null,
    title: 'MESA DE COMIDAS',
    emoji: '🍽️',
    icon: ChefHat,
    color: 'text-amber-900',
    bgColor: 'bg-amber-100',
    baseItems: staticData.comidasList,
    hideQty: true,
    order: 1,
    canDelete: false,
  },
  {
    id: null,
    title: 'CAFÉ E BEBIDAS',
    emoji: '☕',
    icon: Coffee,
    color: 'text-[#3e2723]',
    bgColor: 'bg-stone-200',
    baseItems: staticData.drinks,
    hideQty: false,
    order: 2,
    canDelete: false,
  },
  {
    id: null,
    title: 'VELAS DE SÉTIMO DIA',
    emoji: '🕯️',
    icon: Flame,
    color: 'text-orange-900',
    bgColor: 'bg-orange-50',
    baseItems: staticData.velas,
    hideQty: false,
    order: 3,
    canDelete: false,
  },
  {
    id: null,
    title: 'FUNDAMENTOS DE EXU ONAN E CATIÇO',
    emoji: '✨',
    icon: Sparkles,
    color: 'text-red-900',
    bgColor: 'bg-red-50',
    baseItems: staticData.fundamentoExu,
    hideQty: false,
    order: 4,
    canDelete: false,
  },
];

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');

  const [votes, setVotes] = useState<any[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [settings, setSettings] = useState<{ officialDateId?: string | null }>({
    officialDateId: null,
  });
  const [additionalItems, setAdditionalItems] = useState<any[]>([]);
  const [resourceItems, setResourceItems] = useState<any[]>([]);
  const [resourceSections, setResourceSections] = useState<any[]>([]);
  const [payments, setPayments] = useState<Record<string, any>>({});
  const [attendance, setAttendance] = useState<Record<string, any>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [newItemDefaultSection, setNewItemDefaultSection] = useState('MESA DE COMIDAS');

  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState('');

  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('obrigacao_admin') === 'true');
  const [isSaving, setIsSaving] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [activeItemTarget, setActiveItemTarget] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItemResp, setNewItemResp] = useState('');
  const [newItemQty, setNewItemQty] = useState('');

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

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    const unsubVotes = onSnapshot(collection(db, 'votes'), (snap) => {
      setVotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubPrices = onSnapshot(collection(db, 'prices'), (snap) => {
      const p: Record<string, number> = {};

      snap.docs.forEach((d) => {
        p[d.id] = Number(d.data().value) || 0;
      });

      setPrices(p);
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data());
      }
    });

    const unsubAddItems = onSnapshot(collection(db, 'extra_items'), (snap) => {
      setAdditionalItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubResourceItems = onSnapshot(collection(db, 'resource_items'), (snap) => {
      setResourceItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubResourceSections = onSnapshot(collection(db, 'resource_sections'), (snap) => {
      setResourceSections(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubPayments = onSnapshot(collection(db, 'payments'), (snap) => {
      const p: Record<string, any> = {};

      snap.docs.forEach((d) => {
        p[d.id] = d.data();
      });

      setPayments(p);
    });

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snap) => {
      const p: Record<string, any> = {};

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
      unsubResourceItems();
      unsubResourceSections();
      unsubPayments();
      unsubAttendance();
    };
  }, [user]);

  const resourceSectionsForRender = useMemo(() => {
    const baseTitles = BASE_RESOURCE_SECTIONS.map((section) => normalizeName(section.title));

    const dynamicSections = resourceSections
      .filter((section) => section.active !== false)
      .map((section) => {
        const title = normalizeName(section.title);
        const emoji = section.emoji || '📦';

        return {
          id: section.id,
          title,
          emoji,
          icon: createEmojiIcon(emoji),
          color: 'text-stone-900',
          bgColor: 'bg-stone-100',
          baseItems: [],
          hideQty: false,
          order: Number(section.order) || 999,
          at: Number(section.at) || 0,
          canDelete: true,
        };
      })
      .filter((section) => !baseTitles.includes(section.title));

    return [...BASE_RESOURCE_SECTIONS, ...dynamicSections].sort((a, b) => {
      const orderDiff = (Number(a.order) || 999) - (Number(b.order) || 999);

      if (orderDiff !== 0) return orderDiff;

      return (Number((a as any).at) || 0) - (Number((b as any).at) || 0);
    });
  }, [resourceSections]);

  const getResourceItemNamesBySection = (section: string) => {
    const sectionName = normalizeName(section);

    return resourceItems
      .filter((item) => normalizeName(item.section) === sectionName && item.active !== false)
      .map((item) => normalizeName(item.item));
  };

  const mergeItemNames = (baseItems: string[], section: string) => {
    return [
      ...new Set([
        ...baseItems.map((item) => normalizeName(item)),
        ...getResourceItemNamesBySection(section),
      ]),
    ];
  };

  const generateCombinedData = (nameList: string[]) => {
    const emojiMap: Record<string, string> = {
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
      CAFÉ: '☕',
      VINHO: '🍷',
      'VINAGRE DE ÁLCOOL': '🍶',
      REFRIGERANTE: '🥤',
      CERVEJA: '🍺',
      'VELAS DE SÉTIMO DIA': '🕯️',
      LARANJAS: '🍊',
      'PALMA BANANA': '🍌',
      ABACAXIS: '🍍',
      FARINHAS: '🌾',
      AZEITE: '🏺',
    };

    return nameList.map((name) => {
      const responsiblesMap: Record<string, any> = {};

      const dynamicItem = resourceItems.find((resource) => {
        return normalizeName(resource.item) === name && resource.active !== false;
      });

      additionalItems
        .filter((entry) => {
          return (
            normalizeName(entry.item) === name &&
            Number(entry.qty) > 0 &&
            entry.section !== 'removed'
          );
        })
        .sort((a, b) => (Number(a.at) || 0) - (Number(b.at) || 0))
        .forEach((entry) => {
          const respName = normalizeName(entry.resp);

          responsiblesMap[respName] = {
            name: respName,
            qty: Number(entry.qty) || 1,
            id: entry.id,
            item: name,
          };
        });

      const people = Object.values(responsiblesMap).sort((a: any, b: any) =>
        a.name.localeCompare(b.name)
      );

      return {
        id: dynamicItem?.id || null,
        item: name,
        total: people.reduce((acc: number, person: any) => acc + Math.max(0, person.qty), 0),
        emoji: dynamicItem?.emoji || emojiMap[name] || '📦',
        people,
        canDeleteItem: Boolean(dynamicItem?.id),
      };
    });
  };

  const sectionsWithItems = useMemo(() => {
    return resourceSectionsForRender.map((section) => {
      const itemNames = mergeItemNames(section.baseItems || [], section.title);

      return {
        ...section,
        items: generateCombinedData(itemNames),
      };
    });
  }, [resourceSectionsForRender, additionalItems, resourceItems]);

  const filteredSections = useMemo(() => {
    const s = searchTerm.toUpperCase();

    return sectionsWithItems.map((section) => ({
      ...section,
      items: section.items.filter(
        (item: any) => item.item.includes(s) || item.people.some((p: any) => p.name.includes(s))
      ),
    }));
  }, [searchTerm, sectionsWithItems]);

  const reportSections = useMemo(() => {
    return sectionsWithItems.map((section) => ({
      title: section.title,
      items: section.items,
    }));
  }, [sectionsWithItems]);

  const participantsList = useMemo(() => {
    return [...new Set(votes.map((v) => normalizeName(v.userName)).filter(Boolean))].sort();
  }, [votes]);

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

  const sortedQuotaParticipantsList = useMemo(() => {
    const getPaymentPriority = (name: string) => {
      const pay = payments[name] || { paid: 0 };
      const paid = Number(pay.paid) || 0;
  
      if (costPerPerson > 0 && paid >= costPerPerson) {
        return 3; // quitado fica por último
      }
  
      if (paid > 0) {
        return 2; // parcial fica no meio
      }
  
      return 1; // pendente fica primeiro
    };
  
    return [...quotaParticipantsList].sort((a, b) => {
      const priorityA = getPaymentPriority(a);
      const priorityB = getPaymentPriority(b);
  
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
  
      return a.localeCompare(b, 'pt-BR');
    });
  }, [quotaParticipantsList, payments, costPerPerson]);

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
    return buildReportText({
      officialDate,
      totalParticipants,
      totalQuotaParticipants,
      participantsList,
      quotaParticipantsList,
      presenceOnlyList,
      totalCost,
      costPerPerson,
      totalReceived,
      remainingTarget,
      reportSections,
      payments,
      attendance,
    });
  }, [
    officialDate,
    totalParticipants,
    totalQuotaParticipants,
    participantsList,
    quotaParticipantsList,
    presenceOnlyList,
    totalCost,
    costPerPerson,
    totalReceived,
    remainingTarget,
    reportSections,
    payments,
    attendance,
  ]);

  const openNewItemModal = (section: string) => {
    setNewItemDefaultSection(section);
    setIsNewItemModalOpen(true);
  };

  const handleAddResourceSection = async (data: { title: string; emoji: string }) => {
    if (!user || !isAdmin) return;

    const title = normalizeName(data.title);

    const alreadyExists = resourceSectionsForRender.some((section) => {
      return normalizeName(section.title) === title;
    });

    if (alreadyExists) {
      alert(`${title} já existe como tópico.`);
      return;
    }

    setIsSaving(true);

    try {
      await addDoc(collection(db, 'resource_sections'), {
        title,
        emoji: data.emoji || '📦',
        active: true,
        order: resourceSectionsForRender.length + 1,
        at: Date.now(),
      });

      setIsNewSectionModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResourceSection = async (section: any) => {
    if (!user || !isAdmin || !section?.id || !section?.canDelete) return;

    const confirmed = window.confirm(
      `Deseja remover o tópico "${section.title}"?\n\nOs cards desse tópico também serão ocultados.`
    );

    if (!confirmed) return;

    setIsSaving(true);

    try {
      await updateDoc(doc(db, 'resource_sections', section.id), {
        active: false,
        deletedAt: Date.now(),
      });

      const itemsFromSection = resourceItems.filter((item) => {
        return normalizeName(item.section) === normalizeName(section.title) && item.active !== false;
      });

      await Promise.all(
        itemsFromSection.map((item) =>
          updateDoc(doc(db, 'resource_items', item.id), {
            active: false,
            deletedAt: Date.now(),
          })
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddResourceItem = async (data: { item: string; section: string; emoji: string }) => {
    if (!user || !isAdmin) return;

    const itemName = normalizeName(data.item);
    const sectionName = normalizeName(data.section);

    const alreadyExists = sectionsWithItems.some((section) => {
      return section.items.some((item: any) => normalizeName(item.item) === itemName);
    });

    if (alreadyExists) {
      alert(`${itemName} já existe nos cards.`);
      return;
    }

    setIsSaving(true);

    try {
      await addDoc(collection(db, 'resource_items'), {
        item: itemName,
        section: sectionName,
        emoji: data.emoji || '📦',
        active: true,
        at: Date.now(),
      });

      setIsNewItemModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResourceItem = async (item: any) => {
    if (!user || !isAdmin || !item?.id || !item?.canDeleteItem) return;

    const confirmed = window.confirm(
      `Deseja remover o card "${item.item}"?\n\nOs responsáveis cadastrados nesse card também serão ocultados.`
    );

    if (!confirmed) return;

    setIsSaving(true);

    try {
      await updateDoc(doc(db, 'resource_items', item.id), {
        active: false,
        deletedAt: Date.now(),
      });

      const relatedResponsibles = additionalItems.filter((entry) => {
        return normalizeName(entry.item) === normalizeName(item.item);
      });

      await Promise.all(
        relatedResponsibles.map((entry) =>
          updateDoc(doc(db, 'extra_items', entry.id), {
            qty: -1,
            section: 'removed',
            deletedAt: Date.now(),
          })
        )
      );

      if (normalizeName(activeItemTarget || '') === normalizeName(item.item)) {
        setActiveItemTarget(null);
        setEditingId(null);
        setNewItemResp('');
        setNewItemQty('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveResourceEntry = async (itemName: string, section: string) => {
    if (!newItemResp.trim() || !user) return;

    setIsSaving(true);

    const upperResp = normalizeName(newItemResp);
    const upperItem = normalizeName(itemName);
    const upperSection = normalizeName(section);
    const qtyNum = parseInt(newItemQty) || 1;

    try {
      const existingEntry = additionalItems.find((e) => {
        return normalizeName(e.item) === upperItem && normalizeName(e.resp) === upperResp;
      });

      if (editingId && !editingId.toString().startsWith('static-')) {
        await updateDoc(doc(db, 'extra_items', editingId), {
          qty: qtyNum,
          section: upperSection,
          at: Date.now(),
        });
      } else if (existingEntry) {
        await updateDoc(doc(db, 'extra_items', existingEntry.id), {
          qty: qtyNum,
          section: upperSection,
          at: Date.now(),
        });
      } else {
        await addDoc(collection(db, 'extra_items'), {
          item: upperItem,
          resp: upperResp,
          qty: qtyNum,
          section: upperSection,
          at: Date.now(),
        });
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

  const handleRemoveExtraItem = async (
    idToDelete: string,
    _respName: string,
    _itemName: string
  ) => {
    if (!idToDelete) return;

    setIsSaving(true);

    try {
      if (!idToDelete.toString().startsWith('static-')) {
        await deleteDoc(doc(db, 'extra_items', idToDelete));
      }

      setActiveItemTarget(null);
      setEditingId(null);
      setNewItemResp('');
      setNewItemQty('');
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
      alert(`${name} já confirmou presença nessa data.`);
      return;
    }

    setIsSaving(true);

    const voteId = `${selectedDateId}_${encodeURIComponent(name)}`;

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

  const handleRemoveVote = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'votes', id));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePriceUpdate = async (id: string, val: number) => {
    if (!user || !isAdmin) return;

    try {
      await setDoc(doc(db, 'prices', id), { value: val });
    } catch (e) {
      console.error(e);
    }
  };

  const updatePayment = async (userName: string, field: string, value: string | number) => {
    if (!user || !isAdmin) return;

    const id = normalizeName(userName);
    const current = payments[id] || { paid: 0, proof: '', updatedAt: 0 };

    try {
      await setDoc(doc(db, 'payments', id), {
        ...current,
        [field]: value,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetOfficial = async (id: string) => {
    if (!user || !isAdmin) return;

    const newId = settings.officialDateId === id ? null : id;

    try {
      await setDoc(doc(db, 'settings', 'global'), { officialDateId: newId });
    } catch (e) {
      console.error(e);
    }
  };

  const updateAttendance = async (userName: string, status: string) => {
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

  const getAttendanceStatus = (userName: string) => {
    const id = normalizeName(userName);
    return attendance[id]?.status || 'pending';
  };

  const tryAdminLogin = () => {
    if (adminInput === ADMIN_PIN) {
      setIsAdmin(true);
      localStorage.setItem('obrigacao_admin', 'true');
      setIsAdminModalOpen(false);
      setAdminInput('');
      setAdminError('');
    } else {
      setAdminInput('');
      setAdminError('PIN incorreto. Tente novamente.');
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('obrigacao_admin');
  };

  const startEdit = (person: any, item: string) => {
    setActiveItemTarget(item);
    setEditingId(person.id);
    setNewItemResp(person.name);
    setNewItemQty(person.qty.toString());
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3f0] flex flex-col items-center justify-center p-10 space-y-4">
        <Loader2 className="animate-spin text-amber-600" size={48} />

        <p className="font-black text-[10px] text-stone-400 uppercase tracking-[0.2em]">
          Conectando ao Ilè...
        </p>
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
            <h2 className="text-sm md:text-lg font-bold text-white/80 uppercase tracking-[0.4em] mb-1 transition-all">
              OBRIGAÇÃO
            </h2>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[0.05em] leading-none drop-shadow-lg text-amber-500 transition-all">
              PRETOS VELHOS
            </h1>
          </div>

          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-[2px] w-8 bg-amber-500/40 rounded-full" />

            <p className="text-amber-100/50 font-black text-[10px] md:text-xs tracking-[0.5em] uppercase">
              ADOREI AS ALMAS
            </p>

            <div className="h-[2px] w-8 bg-amber-500/40 rounded-full" />
          </div>

          <div className="flex items-center justify-center gap-1 bg-black/30 p-1.5 rounded-[2rem] border border-white/10 w-fit mx-auto backdrop-blur-xl mt-4">
            <button
              onClick={() => setView('dashboard')}
              className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                view === 'dashboard'
                  ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setView('finance')}
              className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                view === 'finance'
                  ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                  : 'text-white/40 hover:text-white'
              }`}
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
                        <p className="text-[8px] font-black uppercase opacity-60 tracking-[0.3em] text-amber-100 mb-1">
                          DATA OFICIAL CONFIRMADA
                        </p>

                        <p className="text-xl md:text-2xl font-black uppercase text-amber-400 leading-none">
                          {dateOptions.find((d) => d.id === settings.officialDateId)?.label}
                        </p>
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
                        <p className="text-[8px] uppercase font-black text-stone-500 mb-1 tracking-widest">
                          TOTAL MATERIAIS
                        </p>

                        <p className="text-xl md:text-2xl font-black text-amber-100">
                          {formatCurrency(totalCost)}
                        </p>
                      </div>

                      <div className="bg-amber-600 p-4 rounded-3xl border-b-4 border-amber-900 shadow-lg">
                        <p className="text-[8px] font-black text-black/60 uppercase tracking-widest mb-1">
                          COTA P/ PESSOA
                        </p>

                        <p className="text-xl md:text-2xl font-black text-black leading-none">
                          {formatCurrency(costPerPerson)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <p className="text-[9px] font-black text-stone-500 uppercase tracking-[0.3em]">
                          ARRECADAÇÃO COLETIVA
                        </p>

                        <span className="text-[10px] font-black text-amber-500">
                          {percentCollected.toFixed(0)}%
                        </span>
                      </div>

                      <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-amber-600 transition-all duration-1000"
                          style={{ width: `${percentCollected}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 mt-4 border-t border-white/5">
                      <div>
                        <p className="text-[8px] font-black text-stone-500 uppercase tracking-widest mb-1">
                          JÁ ARRECADADO
                        </p>

                        <p className="text-lg md:text-xl font-black text-green-500">
                          {formatCurrency(totalReceived)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[8px] font-black text-stone-500 uppercase tracking-widest mb-1">
                          FALTA ARRECADAR
                        </p>

                        <p className="text-lg md:text-xl font-black text-red-500">
                          {formatCurrency(remainingTarget)}
                        </p>
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

                      <h3 className="font-black uppercase text-[10px] tracking-widest">
                        PRESENÇA
                      </h3>
                    </div>

                    <button
                      onClick={() => (isAdmin ? logoutAdmin() : setIsAdminModalOpen(true))}
                      className={`p-2 rounded-xl transition-all ${
                        isAdmin
                          ? 'bg-amber-600 text-white shadow-lg'
                          : 'text-stone-200 hover:text-stone-400'
                      }`}
                    >
                      {isAdmin ? <Unlock size={16} /> : <Crown size={16} />}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {dateOptions.map((date) => {
                      const dVotes = votes
                        .filter((v) => v.dateId === date.id)
                        .sort((a, b) => normalizeName(a.userName).localeCompare(normalizeName(b.userName)));

                      const isOfficial = settings.officialDateId === date.id;

                      return (
                        <div
                          key={date.id}
                          className={`rounded-[1.5rem] border-2 transition-all p-3 ${
                            isOfficial
                              ? 'border-amber-500 bg-amber-50/30'
                              : 'border-stone-50 bg-stone-50/50'
                          }`}
                        >
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
                                <button
                                  onClick={() => handleSetOfficial(date.id)}
                                  className={`p-2 rounded-xl transition-all ${
                                    isOfficial
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-white border border-stone-200 text-stone-300'
                                  }`}
                                >
                                  <CheckCircle size={20} />
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedDateId(date.id);
                                  setIsModalOpen(true);
                                }}
                                className="p-2.5 bg-white shadow-lg border border-stone-200 rounded-xl active:scale-90 transition-all shadow-amber-900/10"
                              >
                                <Plus size={20} className="text-[#3e2723]" />
                              </button>
                            </div>
                          </div>

                          {dVotes.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-200/40">
                              {dVotes.map((v) => (
                                <div
                                  key={v.id}
                                  className="bg-white px-2 py-1 rounded-xl border border-stone-200 text-[8px] font-black text-[#3e2723] uppercase flex items-center gap-1 shadow-sm"
                                >
                                  <Heart size={8} className="text-red-500 fill-red-500" />
                                  {String(v.userName)}

                                  {(v.userId === user?.uid || isAdmin) && (
                                    <XCircle
                                      size={12}
                                      className="text-stone-300 ml-1 cursor-pointer hover:text-red-600"
                                      onClick={() => handleRemoveVote(v.id)}
                                    />
                                  )}
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
                      <div
                        key={herb.id}
                        className="p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between group hover:bg-white transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <ItemIcon emoji={herb.emoji} />

                          <p className="font-black text-stone-800 text-[10px] uppercase tracking-tighter">
                            {herb.item}
                          </p>
                        </div>

                        <CurrencyInput
                          initialValue={prices[herb.id] || 0}
                          onSave={(val) => handlePriceUpdate(herb.id, val)}
                          isAdmin={isAdmin}
                          isCompact={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group max-w-2xl mx-auto my-8">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors"
                size={20}
              />

              <input
                type="text"
                placeholder="BUSCAR ITEM OU RESPONSÁVEL..."
                className="w-full bg-white border-2 border-stone-200 rounded-2xl py-4 pl-12 pr-6 shadow-xl outline-none focus:border-amber-400 text-[10px] font-black uppercase tracking-widest transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isAdmin && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsNewSectionModalOpen(true)}
                  className="flex items-center gap-3 bg-white text-[#3e2723] border border-stone-200 rounded-3xl px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                >
                  <FolderPlus size={16} />
                  Novo tópico
                </button>
              </div>
            )}

            <div className="space-y-8 pb-8">
              {filteredSections.map((section) => (
                <Section
                  key={section.title}
                  title={section.title}
                  items={section.items}
                  icon={section.icon}
                  color={section.color}
                  bgColor={section.bgColor}
                  isResource
                  onAddItem={() => openNewItemModal(section.title)}
                  onDeleteSection={() => handleDeleteResourceSection(section)}
                  onDeleteItem={handleDeleteResourceItem}
                  canDeleteSection={section.canDelete}
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
                  hideQty={section.hideQty}
                />
              ))}
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
                    <h2 className="text-lg md:text-xl font-black text-stone-900 uppercase tracking-tighter leading-none">
                      Contribuições
                    </h2>

                    <p className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                      Cota por pessoa: {formatCurrency(costPerPerson)}
                    </p>

                    <p className="text-[8px] font-bold text-amber-600 uppercase tracking-widest mt-1">
                      Na cota: {totalQuotaParticipants} • Sem cota: {presenceOnlyList.length} • Presença total: {totalParticipants}
                    </p>
                  </div>
                </div>

                {!isAdmin && (
                  <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-xl border border-stone-100 self-start md:self-auto">
                    <Lock size={14} className="text-amber-600" />

                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                      Somente leitura
                    </span>
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

                {sortedQuotaParticipantsList.map((name) => {
                  const pay = payments[name] || { paid: 0, proof: '', updatedAt: 0 };
                  const paid = Number(pay.paid) || 0;
                  const isFullyPaid = costPerPerson > 0 && paid >= costPerPerson;
                  const balance = costPerPerson > 0 ? Math.max(0, costPerPerson - paid) : 0;

                  const statusColor = isFullyPaid
                    ? 'text-green-600 bg-green-50 border-green-100'
                    : paid > 0
                      ? 'text-amber-600 bg-amber-50 border-amber-100'
                      : 'text-red-600 bg-red-50 border-red-100';

                  return (
                    <div
                      key={name}
                      className="p-4 rounded-[2rem] bg-stone-50 border border-stone-100 space-y-3 shadow-sm hover:shadow-md transition-all h-fit"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-2xl shadow-sm">
                            <Heart size={14} className="text-red-500 fill-red-500/10" />
                          </div>

                          <p className="text-xs font-black text-stone-900 uppercase tracking-tight">
                            {String(name)}
                          </p>
                        </div>

                        <span className={`text-[8px] font-black px-3 py-1.5 rounded-full border shadow-sm ${statusColor}`}>
                          {isFullyPaid ? 'PAGO' : 'PENDENTE'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label className="text-[7px] font-black text-stone-400 uppercase tracking-widest ml-3">
                            VALOR PAGO
                          </label>

                          <CurrencyInput
                            initialValue={paid}
                            onSave={(val) => updatePayment(name, 'paid', val)}
                            isAdmin={isAdmin}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[7px] font-black text-stone-400 uppercase tracking-widest ml-3">
                            PENDÊNCIA
                          </label>

                          <div
                            className={`p-2.5 rounded-2xl border font-black text-[11px] text-center flex items-center justify-center h-[42px] ${
                              isFullyPaid
                                ? 'bg-green-50 text-green-600 border-green-100 shadow-sm'
                                : 'bg-white text-red-600 border-stone-200 shadow-inner'
                            }`}
                          >
                            {isFullyPaid ? 'QUITADO' : formatCurrency(balance)}
                          </div>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-2 rounded-2xl p-2.5 border bg-white border-stone-200 shadow-inner group transition-all">
                          <FileText size={14} className="text-stone-300" />

                          <input
                            type="text"
                            placeholder="LINK DO COMPROVANTE"
                            className="w-full bg-transparent outline-none font-bold text-[9px] text-stone-600 placeholder:opacity-20 uppercase"
                            value={String(pay.proof || '')}
                            onChange={(e) => updatePayment(name, 'proof', e.target.value)}
                          />

                          {pay.proof && (
                            <a
                              href={pay.proof}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:scale-110 transition-transform"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      )}

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
                      <div
                        key={name}
                        className="p-4 rounded-[2rem] bg-amber-50/40 border border-amber-100 space-y-4 shadow-sm hover:shadow-md transition-all h-fit"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-2xl shadow-sm">
                              <Heart size={14} className="text-red-500 fill-red-500/10" />
                            </div>

                            <div>
                              <p className="text-xs font-black text-stone-900 uppercase tracking-tight">
                                {String(name)}
                              </p>

                              <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest mt-1">
                                Fora da cota
                              </p>
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
            <p className="text-[8px] font-black tracking-[0.8em] uppercase">
              SARAVÁ PRETOS VELHOS
            </p>

            <p className="text-[9px] font-bold tracking-widest uppercase mt-1">
              Ilè Asè Ôgún Méjèje ty Ộ'ṣun Íjimú
            </p>

            <p className="text-[8px] font-bold tracking-widest uppercase mt-0.5">
              Bàbálòrìṣà Geraldo Nunes da Rocha
            </p>
          </div>
        </div>
      </main>

      <BackToTopButton show={showBackToTop} onClick={scrollToTop} />

      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border-t-[10px] border-amber-600 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-stone-900 mb-2 uppercase text-center tracking-tighter">
              Modo ADM
            </h3>

            <input
              type="password"
              placeholder="••••"
              autoFocus
              className="w-full border-2 border-stone-100 rounded-2xl py-5 px-6 mb-6 outline-none focus:border-amber-600 font-black text-center bg-stone-50 text-stone-900 text-2xl tracking-[0.5em]"
              value={adminInput}
              onChange={(e) => {
                setAdminInput(e.target.value);
                setAdminError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && tryAdminLogin()}
            />

            {adminError && (
              <p className="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-100 rounded-2xl py-3 px-4">
                {adminError}
              </p>
            )}

            <button
              onClick={tryAdminLogin}
              className="w-full bg-amber-600 text-white rounded-2xl py-5 font-black text-xs uppercase tracking-[0.2em] shadow-xl"
            >
              Autenticar
            </button>

            <button
              onClick={() => {
                setIsAdminModalOpen(false);
                setAdminInput('');
                setAdminError('');
              }}
              className="w-full py-2 mt-2 text-stone-300 font-black text-[9px] uppercase tracking-widest"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-stone-950/95 backdrop-blur-xl">
          <div className="bg-white w-full max-w-sm rounded-[4rem] p-10 shadow-2xl border-t-[14px] border-[#3e2723] animate-in zoom-in-95">
            <h3 className="text-3xl font-black text-stone-900 mb-8 uppercase text-center tracking-tighter">
              Confirmar
            </h3>

            <input
              type="text"
              placeholder="DIGITE SEU NOME"
              className="w-full border-2 border-stone-100 rounded-[2.5rem] py-6 px-8 mb-8 outline-none focus:border-amber-600 font-black text-center bg-stone-50 text-stone-900 text-lg uppercase shadow-inner"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
            />

            <button
              onClick={handleAddVote}
              disabled={!tempName.trim() || isSaving}
              className="w-full bg-[#3e2723] text-white rounded-[2.5rem] py-6 font-black text-xs uppercase tracking-[0.3em] shadow-xl border-b-4 border-black"
            >
              {isSaving ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Confirmar Presença'}
            </button>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2 mt-2 text-stone-300 font-black text-[9px] uppercase tracking-widest"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {activeItemTarget && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border-t-8 border-amber-600">
            <h4 className="font-black uppercase text-[10px] mb-4 text-stone-900 tracking-widest">
              Responsável: {String(activeItemTarget)}
            </h4>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="QUEM TRAZ?"
                className="w-full p-4 bg-stone-50 border rounded-xl font-black uppercase text-xs shadow-inner"
                value={newItemResp}
                onChange={(e) => setNewItemResp(e.target.value)}
                disabled={!!editingId}
              />

              <input
                type="number"
                placeholder="QTD"
                className="w-full p-4 bg-stone-50 border rounded-xl font-black text-xs shadow-inner"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveResourceEntry(activeItemTarget, 'Geral')}
                  className="flex-1 bg-stone-900 text-white py-4 rounded-xl font-black text-[10px] uppercase shadow-xl active:scale-95 transition-all"
                >
                  {isSaving ? '...' : 'Salvar'}
                </button>

                <button
                  onClick={() => {
                    setActiveItemTarget(null);
                    setEditingId(null);
                    setNewItemResp('');
                  }}
                  className="px-4 font-black uppercase text-[10px] text-stone-400"
                >
                  Voltar
                </button>
              </div>

              {editingId && !editingId.toString().startsWith('static-') && (
                <button
                  onClick={() => handleRemoveExtraItem(editingId, newItemResp, activeItemTarget)}
                  className="w-full bg-red-50 text-red-600 py-2 rounded-lg text-[9px] font-black uppercase border border-red-100 shadow-sm active:bg-red-100 transition-all"
                >
                  Eliminar Registro
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <AddResourceSectionModal
        isOpen={isNewSectionModalOpen}
        onClose={() => setIsNewSectionModalOpen(false)}
        onSave={handleAddResourceSection}
        isSaving={isSaving}
      />

      <AddResourceItemModal
        isOpen={isNewItemModalOpen}
        onClose={() => setIsNewItemModalOpen(false)}
        onSave={handleAddResourceItem}
        isSaving={isSaving}
        defaultSection={newItemDefaultSection}
        sectionOptions={resourceSectionsForRender.map((section) => ({
          title: section.title,
          emoji: section.emoji,
        }))}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportText={reportText}
        officialDate={officialDate}
        generatedAt={generatedAt}
      />
    </div>
  );
};

export default App;