import { formatCurrency } from './formatters';

type ReportPerson = {
  name: string;
  qty: number;
};

type ReportItem = {
  item: string;
  people: ReportPerson[];
};

type BuildReportTextParams = {
  officialDate: string;
  totalParticipants: number;
  totalQuotaParticipants: number;
  participantsList: string[];
  quotaParticipantsList: string[];
  presenceOnlyList: string[];
  totalCost: number;
  costPerPerson: number;
  totalReceived: number;
  remainingTarget: number;
  allItemsForReport: {
    comidas: ReportItem[];
    bebidas: ReportItem[];
    velas: ReportItem[];
    fundamento: ReportItem[];
  };
  payments: Record<string, any>;
  attendance: Record<string, any>;
};

type GenerateReportPdfParams = {
  reportHtml: string;
  officialDate: string;
  generatedAt: string;
  logoPath?: string;
};

export const buildReportText = ({
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
  allItemsForReport,
  payments,
  attendance,
}: BuildReportTextParams) => {
  const getStatus = (name: string) => attendance[name]?.status || 'pending';

  const statusLabel = (status: string) => {
    if (status === 'attended') return 'FOI';
    if (status === 'missed') return 'NÃO FOI';
    return 'NÃO MARCADO';
  };

  const attendedNames = participantsList.filter((name) => getStatus(name) === 'attended');
  const missedNames = participantsList.filter((name) => getStatus(name) === 'missed');
  const pendingAttendanceNames = participantsList.filter((name) => getStatus(name) === 'pending');

  const paidNames: string[] = [];
  const partialNames: string[] = [];
  const pendingPaymentNames: string[] = [];

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

  const writeList = (title: string, list: string[], emptyMessage = 'Nenhum registro.') => {
    let text = `${title}\n`;

    if (list.length === 0) {
      text += `- ${emptyMessage}\n\n`;
      return text;
    }

    list.forEach((name) => {
      text += `- ${name}\n`;
    });

    text += `\n`;
    return text;
  };

  let report = ``;

  report += `1. RESUMO GERAL\n\n`;
  report += `- Data oficial: ${officialDate}\n`;
  report += `- Presença total confirmada: ${totalParticipants} pessoa(s)\n`;
  report += `- Pessoas na cota: ${totalQuotaParticipants} pessoa(s)\n`;
  report += `- Pessoas sem cota: ${presenceOnlyList.length} pessoa(s)\n`;
  report += `- Fora da cota: ${presenceOnlyList.length > 0 ? presenceOnlyList.join(', ') : 'Ninguém'}\n\n`;

  report += `2. RESUMO FINANCEIRO\n\n`;
  report += `- Custo total dos materiais: ${formatCurrency(totalCost)}\n`;
  report += `- Valor por pessoa na cota: ${formatCurrency(costPerPerson)}\n`;
  report += `- Total arrecadado: ${formatCurrency(totalReceived)}\n`;
  report += `- Pendência geral: ${formatCurrency(remainingTarget)}\n\n`;

  report += `3. RESUMO DE COMPARECIMENTO\n\n`;
  report += `- Confirmaram presença: ${totalParticipants} pessoa(s)\n`;
  report += `- Foram: ${attendedNames.length} pessoa(s)\n`;
  report += `- Não foram: ${missedNames.length} pessoa(s)\n`;
  report += `- Não marcados: ${pendingAttendanceNames.length} pessoa(s)\n\n`;

  report += writeList('PESSOAS QUE FORAM:', attendedNames, 'Ninguém marcado como foi.');
  report += writeList('PESSOAS QUE NÃO FORAM:', missedNames, 'Ninguém marcado como não foi.');
  report += writeList('PESSOAS AINDA NÃO MARCADAS:', pendingAttendanceNames, 'Todos foram marcados.');

  report += `4. STATUS DOS PAGAMENTOS\n\n`;
  report += writeList('PESSOAS QUITADAS:', paidNames, 'Ninguém quitado.');

  report += `PAGAMENTOS PARCIAIS:\n`;

  if (partialNames.length === 0) {
    report += `- Nenhum pagamento parcial.\n\n`;
  } else {
    partialNames.forEach((name) => {
      const pay = payments[name] || { paid: 0 };
      const paid = Number(pay.paid) || 0;
      const balance = Math.max(0, costPerPerson - paid);

      report += `- ${name}: pagou ${formatCurrency(paid)} | falta ${formatCurrency(balance)}\n`;
    });

    report += `\n`;
  }

  report += `PESSOAS PENDENTES:\n`;

  if (pendingPaymentNames.length === 0) {
    report += `- Ninguém pendente.\n\n`;
  } else {
    pendingPaymentNames.forEach((name) => {
      report += `- ${name}: falta ${formatCurrency(costPerPerson)}\n`;
    });

    report += `\n`;
  }

  report += `5. DETALHAMENTO DAS PESSOAS NA COTA\n\n`;

  quotaParticipantsList.forEach((name) => {
    const pay = payments[name] || { paid: 0, proof: '', updatedAt: 0 };
    const paid = Number(pay.paid) || 0;
    const isFullyPaid = costPerPerson > 0 && paid >= costPerPerson;
    const balance = costPerPerson > 0 ? Math.max(0, costPerPerson - paid) : 0;
    const status = isFullyPaid ? 'PAGO (QUITADO)' : paid > 0 ? 'PAGO (PARCIAL)' : 'PENDENTE';

    const userItems: string[] = [];
    const allCategories = [
      ...allItemsForReport.comidas,
      ...allItemsForReport.bebidas,
      ...allItemsForReport.velas,
      ...allItemsForReport.fundamento,
    ];

    allCategories.forEach((item) => {
      const found = item.people.find((p) => p.name === name);
      if (found) userItems.push(`${item.item} (${found.qty})`);
    });

    report += `👤 NOME: ${name}\n`;
    report += `   COMPARECIMENTO: ${statusLabel(getStatus(name))}\n`;
    report += `   STATUS FINANCEIRO: ${status}\n`;
    report += `   VALOR PAGO: ${formatCurrency(paid)}\n`;
    report += `   VALOR FALTANTE: ${formatCurrency(balance)}\n`;
    report += `   O QUE LEVOU: ${userItems.length > 0 ? userItems.join(', ') : 'NENHUM ITEM SELECIONADO'}\n`;

    if (pay.proof) report += `   COMPROVANTE: ${pay.proof}\n`;
    if (pay.updatedAt) report += `   ÚLTIMA ATUALIZAÇÃO: ${new Date(pay.updatedAt).toLocaleString('pt-BR')}\n`;

    report += `\n`;
  });

  report += `6. PESSOAS SEM COTA\n\n`;

  if (presenceOnlyList.length === 0) {
    report += `- Nenhuma pessoa sem cota.\n\n`;
  } else {
    presenceOnlyList.forEach((name) => {
      report += `👤 NOME: ${name}\n`;
      report += `   COMPARECIMENTO: ${statusLabel(getStatus(name))}\n`;
      report += `   STATUS FINANCEIRO: FORA DA COTA\n\n`;
    });
  }

  report += `7. RESUMO DE MATERIAIS POR CATEGORIA\n\n`;

  const cats = [
    { title: 'MESA DE COMIDAS', data: allItemsForReport.comidas },
    { title: 'CAFÉ E BEBIDAS', data: allItemsForReport.bebidas },
    { title: 'VELAS DE SÉTIMO DIA', data: allItemsForReport.velas },
    { title: 'FUNDAMENTOS DE EXU ONAN E CATIÇO', data: allItemsForReport.fundamento },
  ];

  cats.forEach((cat) => {
    report += `[${cat.title}]\n`;

    cat.data.forEach((item) => {
      const resps = item.people.map((p) => `${p.name} (${p.qty})`).join(', ');
      if (resps) report += `  - ${item.item}: ${resps}\n`;
    });

    report += `\n`;
  });

  report += `8. OBSERVAÇÕES FINAIS\n\n`;
  report += `Este relatório consolida as informações registradas no dashboard da Obrigação de Pretos Velhos, incluindo confirmações, comparecimento, contribuições financeiras e materiais organizados.\n\n`;
  report += `As pessoas fora da cota foram mantidas no controle de presença, mas não participaram da divisão dos custos dos materiais.\n\n`;
  report += `Saravá Pretos Velhos.\n`;
  report += `Adorei as Almas.\n`;

  return report;
};

export const formatReportHtml = (text: string) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

    .replace(/^1\. RESUMO GERAL$/gm, '<strong>1. RESUMO GERAL</strong>')
    .replace(/^2\. RESUMO FINANCEIRO$/gm, '<strong>2. RESUMO FINANCEIRO</strong>')
    .replace(/^3\. RESUMO DE COMPARECIMENTO$/gm, '<strong>3. RESUMO DE COMPARECIMENTO</strong>')
    .replace(/^4\. STATUS DOS PAGAMENTOS$/gm, '<strong>4. STATUS DOS PAGAMENTOS</strong>')
    .replace(/^5\. DETALHAMENTO DAS PESSOAS NA COTA$/gm, '<strong>5. DETALHAMENTO DAS PESSOAS NA COTA</strong>')
    .replace(/^6\. PESSOAS SEM COTA$/gm, '<strong>6. PESSOAS SEM COTA</strong>')
    .replace(/^7\. RESUMO DE MATERIAIS POR CATEGORIA$/gm, '<strong>7. RESUMO DE MATERIAIS POR CATEGORIA</strong>')
    .replace(/^8\. OBSERVAÇÕES FINAIS$/gm, '<strong>8. OBSERVAÇÕES FINAIS</strong>')

    .replace(/^PESSOAS QUE FORAM:$/gm, '<strong>PESSOAS QUE FORAM:</strong>')
    .replace(/^PESSOAS QUE NÃO FORAM:$/gm, '<strong>PESSOAS QUE NÃO FORAM:</strong>')
    .replace(/^PESSOAS AINDA NÃO MARCADAS:$/gm, '<strong>PESSOAS AINDA NÃO MARCADAS:</strong>')
    .replace(/^PESSOAS QUITADAS:$/gm, '<strong>PESSOAS QUITADAS:</strong>')
    .replace(/^PAGAMENTOS PARCIAIS:$/gm, '<strong>PAGAMENTOS PARCIAIS:</strong>')
    .replace(/^PESSOAS PENDENTES:$/gm, '<strong>PESSOAS PENDENTES:</strong>')

    .replace(/^\[MESA DE COMIDAS\]$/gm, '<strong>[MESA DE COMIDAS]</strong>')
    .replace(/^\[CAFÉ E BEBIDAS\]$/gm, '<strong>[CAFÉ E BEBIDAS]</strong>')
    .replace(/^\[VELAS DE SÉTIMO DIA\]$/gm, '<strong>[VELAS DE SÉTIMO DIA]</strong>')
    .replace(/^\[FUNDAMENTOS DE EXU ONAN E CATIÇO\]$/gm, '<strong>[FUNDAMENTOS DE EXU ONAN E CATIÇO]</strong>');
};

const getLogoAsBase64 = async (logoPath: string) => {
  try {
    const logoResponse = await fetch(logoPath);
    const logoBlob = await logoResponse.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(String(reader.result));
      };

      reader.onerror = reject;
      reader.readAsDataURL(logoBlob);
    });
  } catch (error) {
    console.error('Erro ao carregar a logo para o relatório:', error);
    return '';
  }
};

export const generateReportPdf = async ({
  reportHtml,
  officialDate,
  generatedAt,
  logoPath = '/logo-ile.png',
}: GenerateReportPdfParams) => {
  const logoUrl = await getLogoAsBase64(logoPath);

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

          .report-body {
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: "Courier New", Courier, monospace;
            font-size: 12px;
            line-height: 1.6;
            margin: 0;
            color: #2d1b18;
          }

          .report-body strong {
            font-weight: 900;
            color: #1c1917;
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

          <div class="report-body">${reportHtml}</div>
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