import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { prisma } from '../src/lib/prisma';

async function generateUsersPdf() {
  console.log('🔄 Fetching users from database...');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      isClassCoordinator: true,
      assignedClassId: true,
      createdAt: true,
    },
    orderBy: [
      { role: 'asc' },
      { department: 'asc' },
      { name: 'asc' },
    ],
  });

  console.log(`📊 Found ${users.length} users.`);

  const outputPath = path.resolve(__dirname, '../../../faculty_user_directory.pdf');
  const doc = new PDFDocument({
    margin: 36,
    size: 'A4',
    bufferPages: true,
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  const primaryColor = '#2B35E0'; // JEC Blue
  const secondaryColor = '#0E1030'; // Dark ink
  const mutedColor = '#64748B';
  const tableHeaderBg = '#F1F3FF';
  const alternateRowBg = '#F8FAFC';
  const borderColor = '#E2E8F0';

  // ── HEADER SECTION ──
  doc.rect(36, 36, doc.page.width - 72, 85).fill(primaryColor);

  doc.fillColor('#FFFFFF')
     .font('Helvetica-Bold')
     .fontSize(18)
     .text('JEC ACADEMICS', 50, 48);

  doc.font('Helvetica')
     .fontSize(11)
     .text('COURSE COVERAGE REPORT (CCR) SYSTEM', 50, 72);

  doc.font('Helvetica-Oblique')
     .fontSize(9)
     .fillColor('#D5D8F5')
     .text('Official Faculty & User Directory Report', 50, 88);

  const reportDate = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  doc.font('Helvetica')
     .fontSize(8)
     .fillColor('#FFFFFF')
     .text(`Generated: ${reportDate}`, doc.page.width - 230, 52, { width: 180, align: 'right' });
  doc.text(`Total Records: ${users.length}`, doc.page.width - 230, 66, { width: 180, align: 'right' });

  doc.y = 135;

  // ── SUMMARY CARDS ──
  const staffCount = users.filter((u) => u.role === 'STAFF').length;
  const hodCount = users.filter((u) => u.role === 'HOD').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const ccCount = users.filter((u) => u.isClassCoordinator).length;

  const cardWidth = (doc.page.width - 72 - 30) / 4;
  const stats = [
    { label: 'Total Users', count: users.length, color: '#2B35E0' },
    { label: 'Teaching Staff', count: staffCount, color: '#3DDBB0' },
    { label: 'HODs & Leadership', count: hodCount, color: '#FFB020' },
    { label: 'Class Coordinators', count: ccCount, color: '#FF5D73' },
  ];

  stats.forEach((stat, i) => {
    const cardX = 36 + i * (cardWidth + 10);
    const cardY = 135;
    doc.rect(cardX, cardY, cardWidth, 44).fillAndStroke('#F8FAFC', borderColor);
    doc.rect(cardX, cardY, 4, 44).fill(stat.color);

    doc.font('Helvetica-Bold')
       .fontSize(14)
       .fillColor(secondaryColor)
       .text(stat.count.toString(), cardX + 12, cardY + 8);

    doc.font('Helvetica')
       .fontSize(8)
       .fillColor(mutedColor)
       .text(stat.label, cardX + 12, cardY + 26);
  });

  doc.y = 195;

  // ── TABLE DRAWING ──
  const headers = [
    { text: '#', width: 25, align: 'center' },
    { text: 'Faculty Name', width: 125, align: 'left' },
    { text: 'Institutional Email', width: 145, align: 'left' },
    { text: 'Department', width: 100, align: 'left' },
    { text: 'Role', width: 55, align: 'center' },
    { text: 'Coordinator', width: 72, align: 'center' },
  ];

  let currentY = 195;

  function drawTableHeader(y: number) {
    doc.rect(36, y, doc.page.width - 72, 22).fill(tableHeaderBg);
    doc.rect(36, y, doc.page.width - 72, 22).stroke(primaryColor);

    let currentX = 36;
    headers.forEach((h) => {
      doc.font('Helvetica-Bold')
         .fontSize(8.5)
         .fillColor(primaryColor)
         .text(h.text, currentX + 4, y + 6, {
           width: h.width - 8,
           align: h.align as any,
         });
      currentX += h.width;
    });
    return y + 22;
  }

  currentY = drawTableHeader(currentY);

  users.forEach((user, idx) => {
    // Check if we need a new page
    if (currentY > doc.page.height - 65) {
      doc.addPage();
      currentY = 40;
      currentY = drawTableHeader(currentY);
    }

    const rowBg = idx % 2 === 1 ? alternateRowBg : '#FFFFFF';
    doc.rect(36, currentY, doc.page.width - 72, 20).fillAndStroke(rowBg, borderColor);

    let cellX = 36;
    const coordinatorInfo = user.isClassCoordinator
      ? user.assignedClassId ? `Yes (${user.assignedClassId})` : 'Yes'
      : 'No';

    const rowData = [
      { text: (idx + 1).toString(), width: 25, align: 'center' },
      { text: user.name || 'N/A', width: 125, align: 'left' },
      { text: user.email, width: 145, align: 'left' },
      { text: user.department || 'General', width: 100, align: 'left' },
      { text: user.role, width: 55, align: 'center' },
      { text: coordinatorInfo, width: 72, align: 'center' },
    ];

    rowData.forEach((col) => {
      doc.font('Helvetica')
         .fontSize(8)
         .fillColor(secondaryColor)
         .text(col.text, cellX + 4, currentY + 5, {
           width: col.width - 8,
           align: col.align as any,
           ellipsis: true,
         });
      cellX += col.width;
    });

    currentY += 20;
  });

  // ── FOOTER ON ALL PAGES ──
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    const footerY = doc.page.height - 35;

    doc.rect(36, footerY - 5, doc.page.width - 72, 0.5).fill(borderColor);

    doc.font('Helvetica')
       .fontSize(7.5)
       .fillColor(mutedColor)
       .text(
         'CCR Confidential · Official Internal Academic Directory · Passwords are protected via one-way cryptographic hash',
         36,
         footerY,
         { width: doc.page.width - 150, align: 'left' }
       );

    doc.text(`Page ${i + 1} of ${pages.count}`, doc.page.width - 120, footerY, {
      width: 84,
      align: 'right',
    });
  }

  doc.end();

  await new Promise<void>((resolve, reject) => {
    writeStream.on('finish', () => resolve());
    writeStream.on('error', (err) => reject(err));
  });

  console.log(`\n✅ PDF report generated successfully!`);
  console.log(`📄 Saved to: ${outputPath}`);
}

generateUsersPdf()
  .catch((err) => {
    console.error('❌ Error generating PDF:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
