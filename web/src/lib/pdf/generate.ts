import PDFDocument from "pdfkit";
import type { TailoredContent } from "@/types";

export async function generateResumePdf(
  content: TailoredContent
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 50, bottom: 50, left: 55, right: 55 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // Header — Contact Info
    const { contact } = content;
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(contact.name, { align: "center" });

    const contactParts = [
      contact.email,
      contact.phone,
      contact.location,
      contact.linkedin,
    ].filter(Boolean);

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(contactParts.join("  |  "), { align: "center" });

    doc.moveDown(0.8);

    // Summary
    addSectionHeader(doc, "PROFESSIONAL SUMMARY", pageWidth);
    doc.fontSize(10).font("Helvetica").text(content.summary);
    doc.moveDown(0.6);

    // Experience
    addSectionHeader(doc, "EXPERIENCE", pageWidth);
    for (const exp of content.experience) {
      doc.fontSize(10).font("Helvetica-Bold").text(exp.title, { continued: true });
      doc.font("Helvetica").text(`  —  ${exp.company}`);
      doc.fontSize(9).fillColor("#555555").text(exp.dates);
      doc.fillColor("#000000");
      for (const bullet of exp.bullets) {
        doc
          .fontSize(9.5)
          .font("Helvetica")
          .text(`  \u2022  ${bullet}`, { indent: 8 });
      }
      doc.moveDown(0.4);
    }

    // Skills
    addSectionHeader(doc, "SKILLS", pageWidth);
    doc.fontSize(10).font("Helvetica").text(content.skills.join("  \u2022  "));
    doc.moveDown(0.6);

    // Education
    addSectionHeader(doc, "EDUCATION", pageWidth);
    for (const edu of content.education) {
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(edu.degree, { continued: true });
      doc.font("Helvetica").text(`  —  ${edu.school}, ${edu.year}`);
    }

    doc.end();
  });
}

function addSectionHeader(
  doc: PDFKit.PDFDocument,
  title: string,
  pageWidth: number
) {
  doc.moveDown(0.2);
  doc.fontSize(11).font("Helvetica-Bold").fillColor("#1a1a1a").text(title);
  const y = doc.y;
  doc
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.margins.left + pageWidth, y)
    .strokeColor("#cccccc")
    .lineWidth(0.5)
    .stroke();
  doc.fillColor("#000000");
  doc.moveDown(0.3);
}
