import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatAgreementDate } from '@/lib/pdf/tripartite-pdf';

export type OfferLetterPdfInput = {
  applicantName: string;
  idNumber: string;
  groupName: string;
  acknowledgmentNumber: string;
  amountToPay: string;
  airTicket: string;
  visaApplication: string;
  upkeepTrade: string;
  signature?: string | null;
  signedAt?: Date | string | null;
};

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

export function offerLetterPdfFileName(acknowledgmentNumber: string, name: string) {
  const safe = name.replace(/[^\w.-]+/g, '_').slice(0, 40);
  return `Offer-Letter-${acknowledgmentNumber}-${safe}.pdf`;
}

export async function buildOfferLetterPdf(input: OfferLetterPdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595.28, 841.89]);
  const black = rgb(0, 0, 0);
  let y = 790;

  const line = (text: string, size = 11, useBold = false) => {
    page.drawText(text, { x: 50, y, size, font: useBold ? bold : font, color: black });
    y -= size + 6;
  };

  line('REPUBLIC OF KENYA', 12, true);
  line('UWEZO FUND — WEZESHA MAJUU', 12, true);
  line('OFFER LETTER', 14, true);
  y -= 8;
  line(`Applicant: ${input.applicantName}`);
  line(`National ID: ${input.idNumber}`);
  line(`Group: ${input.groupName}`);
  line(`Application: ${input.acknowledgmentNumber}`);
  y -= 6;
  line('Approved loan breakdown', 12, true);
  line(`AIR TICKET: KES ${input.airTicket}`);
  line(`VISA APPLICATION: KES ${input.visaApplication}`);
  line(`UPKEEP/TRADE: KES ${input.upkeepTrade}`);
  line(`Amount you are expected to pay: KES ${input.amountToPay}`, 12, true);
  line('Loan not yet disbursed.');
  y -= 8;
  line('Terms and conditions', 12, true);
  const terms = [
    `I, a member of ${input.groupName}, commit to repay KES ${input.amountToPay}, being the loan amount approved for me.`,
    'Repayment period shall be a maximum of twelve (12) months.',
    'Grace period shall not exceed one (1) month after the end of the probationary employment period, where applicable.',
    'Repayment shall be through check off, standing order, direct deposit into the Fund account, or any other approved method.',
    'The loan shall be charged an 8% service charge of the approved loan amount, deductible upfront.',
    'Applicable insurance fee for credit life policy.',
  ];
  for (const term of terms) {
    const words = term.split(' ');
    let current = '';
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(next, 11) > 495) {
        line(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) line(current);
    y -= 4;
  }

  y -= 10;
  line('Signature', 12, true);
  line(`Date: ${formatAgreementDate(input.signedAt)}`);
  const image = await embedSignature(doc, input.signature);
  if (image) {
    const scale = Math.min(180 / image.width, 50 / image.height);
    page.drawImage(image, {
      x: 50,
      y: y - 54,
      width: image.width * scale,
      height: image.height * scale,
    });
  }

  return doc.save();
}
