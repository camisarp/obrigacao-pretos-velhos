import { ArrowUp } from 'lucide-react';

type BackToTopButtonProps = {
  show: boolean;
  onClick: () => void;
};

const BackToTopButton = ({ show, onClick }: BackToTopButtonProps) => {
  if (!show) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Voltar ao topo"
      className="fixed bottom-6 right-6 z-[250] w-12 h-12 rounded-full bg-amber-600 text-white shadow-2xl shadow-amber-900/30 border-b-4 border-amber-900 flex items-center justify-center active:scale-90 hover:bg-amber-700 transition-all"
    >
      <ArrowUp size={22} />
    </button>
  );
};

export default BackToTopButton;