import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';

export type TripartitePdfInput = {
  migrantName: string;
  idNumber: string;
  passportNumber: string;
  migrantSignature?: string | null;
  labourPsSignature?: string | null;
  labourPsSignedAt?: Date | string | null;
  msmePsSignature?: string | null;
  msmePsSignedAt?: Date | string | null;
  acknowledgmentNumber: string;
  agreementDate?: Date | string | null;
};

const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 50;
const CONTENT_WIDTH = PAGE.width - MARGIN * 2;
const BODY_SIZE = 11;
const TITLE_SIZE = 12;
const LINE_GAP = 4;
const BLACK = rgb(0, 0, 0);

const LABOUR_ITEMS = [
  'Overseeing the overall implementation of the Wezesha Majuu Programme, and ensuring alignment with National and International Labour laws and policies.',
  'Coordinate engagements with international and local partners, facilitates inter-ministerial and inter-agency coordination, leads communication and advocacy efforts, approves key program decisions, and monitors program performance and impact.',
  'They also facilitate labour mobility and international job placements, handle labour-related disputes, provide labour market information, develop and implement labor mobility policies.',
  'Facilitate recruitment of prospective Migrant Workers for the programme, verify the job opportunities and provide attestation of the contracts.',
  'Provide reasonable assurance to the Fund for the repayment of the funds on-lent to the prospective migrant workers.',
];

const MSME_ITEMS = [
  'Allocate the budget for the Labour Mobility Loan.',
  'Receive and process loan applications.',
  'Disburse approved loans to individual members within the clusters.',
  'In liaison with MSEA, cluster the groups accordingly in order to access funding.',
  'Structure loan repayment plan and commit prospective migrant workers in liaison with the Ministry of Labour and Social Protection.',
  'Track and report on the program performance, document and share success stories of beneficiaries.',
];

const MIGRANT_ITEMS = [
  'Seeking and securing international employment opportunities through the Ministry of Labour and Social Protection or its Agencies.',
  'Expressing interest for funding under Wezesha Majuu Loan Product.',
  'Adhering to stipulated terms and conditions for loan application including cluster formation.',
  'Adhering to the stipulated loan repayment terms, failure to which, I commit to be repatriated, arrested and recovery measures initiated upon me.',
  'Participating in pre-departure training and orientation.',
  'Providing feedback on program effectiveness.',
  'Providing the required information and sharing success stories and experiences.',
];

export function formatAgreementDate(date: Date | string | null | undefined): string {
  const value = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
  if (Number.isNaN(value.getTime())) {
    return formatAgreementDate(new Date());
  }
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${value.getFullYear()}`;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
  }
  if (current) lines.push(current);
  return lines;
}

type PdfContext = {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  font: PDFFont;
  fontBold: PDFFont;
  fontItalic: PDFFont;
  fontBoldItalic: PDFFont;
};

function ensureSpace(ctx: PdfContext, needed: number) {
  if (ctx.y - needed < MARGIN) {
    ctx.page = ctx.doc.addPage([PAGE.width, PAGE.height]);
    ctx.y = PAGE.height - MARGIN;
  }
}

function drawCentered(
  ctx: PdfContext,
  text: string,
  font: PDFFont,
  size: number,
  extraGap = LINE_GAP,
) {
  const lines = wrapText(text, font, size, CONTENT_WIDTH);
  for (const line of lines) {
    ensureSpace(ctx, size + extraGap);
    const width = font.widthOfTextAtSize(line, size);
    ctx.page.drawText(line, {
      x: (PAGE.width - width) / 2,
      y: ctx.y - size,
      size,
      font,
      color: BLACK,
    });
    ctx.y -= size + extraGap;
  }
}

function drawParagraph(
  ctx: PdfContext,
  text: string,
  font: PDFFont,
  size = BODY_SIZE,
  extraGap = LINE_GAP,
) {
  const lines = wrapText(text, font, size, CONTENT_WIDTH);
  for (const line of lines) {
    ensureSpace(ctx, size + extraGap);
    ctx.page.drawText(line, {
      x: MARGIN,
      y: ctx.y - size,
      size,
      font,
      color: BLACK,
    });
    ctx.y -= size + extraGap;
  }
}

function drawRomanList(ctx: PdfContext, items: string[], cautionIndex?: number) {
  const numerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
  const indent = 22;
  const numberWidth = 28;

  items.forEach((item, index) => {
    const font = index === cautionIndex ? ctx.fontBold : ctx.font;
    const label = `${numerals[index] ?? `${index + 1}`}.`;
    const lines = wrapText(item, font, BODY_SIZE, CONTENT_WIDTH - indent - numberWidth);
    ensureSpace(ctx, BODY_SIZE + LINE_GAP);
    ctx.page.drawText(label, {
      x: MARGIN + indent,
      y: ctx.y - BODY_SIZE,
      size: BODY_SIZE,
      font,
      color: BLACK,
    });
    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) ensureSpace(ctx, BODY_SIZE + LINE_GAP);
      ctx.page.drawText(line, {
        x: MARGIN + indent + numberWidth,
        y: ctx.y - BODY_SIZE,
        size: BODY_SIZE,
        font,
        color: BLACK,
      });
      ctx.y -= BODY_SIZE + LINE_GAP;
    });
    ctx.y -= 4;
  });
}

async function embedSignature(doc: PDFDocument, dataUrl?: string | null) {
  if (!dataUrl || !dataUrl.includes(',')) return null;
  try {
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    const bytes = Uint8Array.from(Buffer.from(base64, 'base64'));
    if (dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg')) {
      return await doc.embedJpg(bytes);
    }
    return await doc.embedPng(bytes);
  } catch {
    return null;
  }
}

async function drawSignatureRow(
  ctx: PdfContext,
  label: string,
  dataUrl: string | null | undefined,
  date: string,
) {
  ensureSpace(ctx, 72);
  ctx.y -= 8;
  ctx.page.drawText(label, {
    x: MARGIN,
    y: ctx.y - BODY_SIZE,
    size: BODY_SIZE,
    font: ctx.fontBold,
    color: BLACK,
  });

  const lineX = MARGIN + 42;
  const lineWidth = 220;
  const lineY = ctx.y - 28;
  ctx.page.drawLine({
    start: { x: lineX, y: lineY },
    end: { x: lineX + lineWidth, y: lineY },
    thickness: 0.6,
    color: BLACK,
    dashArray: [1, 2],
  });

  const image = await embedSignature(ctx.doc, dataUrl);
  if (image) {
    const maxH = 42;
    const maxW = 200;
    const scale = Math.min(maxW / image.width, maxH / image.height);
    ctx.page.drawImage(image, {
      x: lineX + 4,
      y: lineY + 2,
      width: image.width * scale,
      height: image.height * scale,
    });
  }

  ctx.page.drawText('Date:', {
    x: MARGIN + 300,
    y: ctx.y - BODY_SIZE,
    size: BODY_SIZE,
    font: ctx.fontBold,
    color: BLACK,
  });
  ctx.page.drawText(date, {
    x: MARGIN + 340,
    y: ctx.y - BODY_SIZE,
    size: BODY_SIZE,
    font: ctx.font,
    color: BLACK,
  });
  ctx.page.drawLine({
    start: { x: MARGIN + 338, y: lineY },
    end: { x: PAGE.width - MARGIN, y: lineY },
    thickness: 0.6,
    color: BLACK,
    dashArray: [1, 2],
  });

  ctx.y -= 56;
}

export async function buildTripartiteAgreementPdf(input: TripartitePdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Tripartite Agreement — ${input.acknowledgmentNumber}`);
  doc.setAuthor('Wezesha Majuu — Uwezo Fund');
  doc.setSubject('Tripartite Agreement for Wezesha Majuu Loan Product');

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const fontBoldItalic = await doc.embedFont(StandardFonts.HelveticaBoldOblique);

  const ctx: PdfContext = {
    doc,
    page: doc.addPage([PAGE.width, PAGE.height]),
    y: PAGE.height - MARGIN,
    font,
    fontBold,
    fontItalic,
    fontBoldItalic,
  };

  const agreementDate = formatAgreementDate(input.agreementDate);
  const labourDate = formatAgreementDate(input.labourPsSignedAt ?? input.agreementDate);
  const msmeDate = formatAgreementDate(input.msmePsSignedAt ?? input.agreementDate);

  drawCentered(ctx, 'REPUBLIC OF KENYA', fontBold, TITLE_SIZE, 3);
  drawCentered(
    ctx,
    'MINISTRY OF LABOUR AND SOCIAL PROTECTION, STATE DEPARTMENT FOR LABOUR AND SKILLS DEVELOPMENT',
    fontBold,
    10,
    3,
  );
  drawCentered(ctx, 'AND', fontBold, 10, 3);
  drawCentered(
    ctx,
    'MINISTRY OF COOPERATIVES AND MICRO SMALL AND MEDIUM ENTERPRISES DEVELOPMENT, STATE DEPARTMENT OF MICRO SMALL AND MEDIUM ENTERPRISES DEVELOPMENT',
    fontBold,
    10,
    6,
  );

  ctx.y -= 6;
  drawCentered(ctx, 'TRIPARTITE AGREEMENT FOR WEZESHA MAJUU LOAN PRODUCT', fontBold, TITLE_SIZE, 8);
  ctx.page.drawLine({
    start: { x: MARGIN + 40, y: ctx.y + 6 },
    end: { x: PAGE.width - MARGIN - 40, y: ctx.y + 6 },
    thickness: 0.8,
    color: BLACK,
  });
  ctx.y -= 10;

  drawParagraph(
    ctx,
    'This is a tripartite agreement between the Ministry of Labour and Social Protection, Ministry of Cooperatives and Micro Small and Medium Enterprises Development and Labour Migrants.',
    fontItalic,
  );

  ctx.y -= 8;
  drawParagraph(ctx, '1. THE MINISTRY OF LABOUR AND SOCIAL PROTECTION', fontBold, TITLE_SIZE);
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y + 2 },
    end: { x: MARGIN + fontBold.widthOfTextAtSize('1. THE MINISTRY OF LABOUR AND SOCIAL PROTECTION', TITLE_SIZE), y: ctx.y + 2 },
    thickness: 0.7,
    color: BLACK,
  });
  ctx.y -= 6;
  drawParagraph(
    ctx,
    'The Ministry of Labour and Social Protection commits to undertake the following;',
    font,
  );
  ctx.y -= 4;
  drawRomanList(ctx, LABOUR_ITEMS);
  await drawSignatureRow(ctx, 'Sign:', input.labourPsSignature, labourDate);
  drawParagraph(
    ctx,
    'Principal Secretary State Department for Labour and Skills Development',
    fontBoldItalic,
  );

  ctx.y -= 10;
  drawParagraph(
    ctx,
    '2. THE MINISTRY OF COOPERATIVES AND MICRO SMALL AND MEDIUM ENTERPRISES DEVELOPMENT',
    fontBold,
    TITLE_SIZE,
  );
  drawParagraph(
    ctx,
    'The Ministry of Cooperatives and Micro Small and Medium Enterprises Development through Uwezo Fund shall be the Financier of the Wezesha Majuu loan product. In performing this function, the Fund shall commit to undertake the following;',
    font,
  );
  ctx.y -= 4;
  drawRomanList(ctx, MSME_ITEMS);
  await drawSignatureRow(ctx, 'Sign:', input.msmePsSignature, msmeDate);
  drawParagraph(
    ctx,
    'Principal Secretary State Department for Micro Small and Medium Enterprise Development',
    fontBoldItalic,
  );

  ctx.y -= 10;
  drawParagraph(ctx, '3. LABOUR MIGRANTS', fontBold, TITLE_SIZE);
  drawParagraph(
    ctx,
    `I ${input.migrantName || '________________'} ID No ${input.idNumber || '__________'} Passport no. ${input.passportNumber || '__________'} is responsible for;`,
    font,
  );
  ctx.y -= 4;
  drawRomanList(ctx, MIGRANT_ITEMS, 3);
  await drawSignatureRow(ctx, 'Sign:', input.migrantSignature, agreementDate);
  drawParagraph(
    ctx,
    `Name of the Migrant Worker: ${input.migrantName || '__________________________'}`,
    fontBold,
  );

  return doc.save();
}

export function tripartitePdfFileName(acknowledgmentNumber: string, migrantName?: string) {
  const slug = (migrantName || acknowledgmentNumber)
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `Tripartite-Agreement-${slug || acknowledgmentNumber}.pdf`;
}
