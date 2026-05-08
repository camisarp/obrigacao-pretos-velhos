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
  
  type GenerateReportPdfParams = {
    reportHtml: string;
    officialDate: string;
    generatedAt: string;
    logoPath?: string;
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