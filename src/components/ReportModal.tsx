import { useMemo } from 'react';
import { FileDown, X } from 'lucide-react';
import { formatReportHtml, generateReportPdf } from '../utils/report';

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reportText: string;
  officialDate: string;
  generatedAt: string;
};

const ReportModal = ({
  isOpen,
  onClose,
  reportText,
  officialDate,
  generatedAt,
}: ReportModalProps) => {
  const formattedReportHtml = useMemo(() => {
    return formatReportHtml(reportText);
  }, [reportText]);

  const handleGeneratePDF = async () => {
    await generateReportPdf({
      reportHtml: formattedReportHtml,
      officialDate,
      generatedAt,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg md:max-w-3xl h-[85vh] md:h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-stone-50 border-b-2 border-stone-100 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-stone-900 uppercase tracking-tighter">
              Relatório
            </h3>

            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">
              Obrigação Pretos Velhos
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleGeneratePDF}
              className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              <FileDown size={14} />
              Gerar PDF
            </button>

            <button
              onClick={onClose}
              className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div
          id="report-content"
          className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-left"
        >
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

            <div
              className="font-mono text-[11px] sm:text-[12px] text-stone-800 leading-relaxed whitespace-pre-wrap break-words m-0 [&_strong]:font-black [&_strong]:text-stone-950"
              dangerouslySetInnerHTML={{ __html: formattedReportHtml }}
            />
          </div>
        </div>

        <div className="p-4 border-t border-stone-50 bg-stone-50/50 flex flex-col items-center">
          <div className="w-32 h-[1px] bg-stone-300 mb-2" />

          <p className="text-[8px] font-black text-stone-500 uppercase tracking-widest text-center">
            Ilè Asè Ôgún Méjèje ty Ộ'ṣun Íjimú
            <br />
            Bàbálòrìṣà Geraldo Nunes da Rocha
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;