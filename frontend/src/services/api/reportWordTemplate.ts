import { 
  Document, 
  Packer, 
  Paragraph, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  ImageRun, 
  TextRun, 
  BorderStyle,
  VerticalAlign
} from 'docx';
import * as FileSystem from 'expo-file-system/legacy';
import { ConsolidatedReport } from '@features/cc/store/useReportStore';
import { JEC_LOGO_BASE64 } from '../../assets/logo_base64';
import { getSectionTemplate, filterNonAcademicSubjects } from '@config/sectionTemplates';

const getBriefTopics = (code: string): string[] => {
  const lookup: Record<string, string[]> = {
    CS3591: ['OSI & TCP/IP Network Models', 'Data Link Layer & Framing', 'Routing Algorithms'],
    CS3501: ['Lexical Analysis & DFA', 'Syntax Analysis & Parsers', 'Syntax Directed Translation'],
    CB3491: ['Symmetric Key Encryption', 'Public Key Cryptography', 'Firewalls & Cyber Security'],
    CS3551: ['Message Passing IPC', 'Distributed File Systems', 'Mutual Exclusion Algorithms'],
    CCS375: ['HTML5 structure & CSS3 styling', 'JavaScript DOM manipulation', 'React Component Architecture'],
    CCS370: ['User Research & Personas', 'Wireframing & Prototyping', 'Usability Testing Methods'],
    MX3084: ['Natural Hazards & Cyclones', 'Mitigation Systems & Plans', 'Risk Assessment Strategies'],
  };
  return lookup[code] || ['Unit syllabus topics covered', 'Weekly planned sub-topics', 'Class presentation session'];
};

export const generateReportWord = async (report: ConsolidatedReport): Promise<string> => {
  const { classId, weekNumber, subjects } = report;
  const displaySubjects = filterNonAcademicSubjects(subjects || []);

  const template = getSectionTemplate(classId);
  const sectionChar = template.section;
  const displayDept = template.department;
  const displayYear = classId.includes('3rd') || classId.includes('III') ? 'III' : (classId.includes('4th') || classId.includes('IV') ? 'IV' : 'I');
  const displaySem = classId.includes('3rd') || classId.includes('III') ? 'V' : (classId.includes('4th') || classId.includes('IV') ? 'VII' : 'I');

  const getDates = (week: number) => {
    const baseDate = new Date(2024, 4, 20); // 20 May 2024
    const weeksDiff = week - 5;
    const startDate = new Date(baseDate.getTime() + weeksDiff * 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);

    const formatDate = (d: Date) => {
      const dd = d.getDate().toString().padStart(2, '0');
      const mm = (d.getMonth() + 1).toString().padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    };

    return {
      from: formatDate(startDate),
      to: formatDate(endDate),
    };
  };

  const firstWithDates = subjects.find(s => s.fromDate && s.toDate);
  const defaultDates = getDates(weekNumber);
  const dates = {
    from: firstWithDates?.fromDate ? firstWithDates.fromDate.replace(/\//g, '.') : defaultDates.from,
    to: firstWithDates?.toDate ? firstWithDates.toDate.replace(/\//g, '.') : defaultDates.to,
  };

  // 1. Process Logo
  const logoBase64Raw = JEC_LOGO_BASE64.startsWith('data:image') 
    ? JEC_LOGO_BASE64.split(';base64,').pop() || ''
    : JEC_LOGO_BASE64;

  const logoImage = new ImageRun({
    data: logoBase64Raw,
    type: 'png',
    transformation: {
      width: 70,
      height: 70,
    },
  });

  // 2. Letterhead Table (No borders)
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'auto' };
  const letterheadTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: noBorder,
      bottom: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ children: [logoImage], alignment: AlignmentType.LEFT })],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'JAYA ENGINEERING COLLEGE',
                    bold: true,
                    size: 32, // 16pt
                    color: 'B71C1C',
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '(Approved by AICTE, New Delhi || Affiliated to Anna University, Chennai)',
                    bold: true,
                    size: 16, // 8pt
                    color: '0D47A1',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Accredited by NAAC & NBA(CSE&TEXTILE)/Recognized by UGC under section 2(f) & 12(b)',
                    bold: true,
                    size: 14, // 7pt
                    color: '0D47A1',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Thiruninravur, Chennai, Tamil Nadu, 602 024\nPhone: 044-26300982 || Website: jec.ac.in || Email: info@jec.ac.in',
                    bold: true,
                    size: 14, // 7pt
                    color: '1E293B',
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: '31 Years',
                    bold: true,
                    size: 16,
                    color: 'B71C1C',
                  }),
                  new TextRun({
                    text: '\nExcellence',
                    bold: true,
                    size: 12,
                    color: '1E293B',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Thin black border helper
  const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: '000000' };

  // 3. Metadata Table (100% width)
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: thinBorder,
      bottom: thinBorder,
      left: thinBorder,
      right: thinBorder,
      insideHorizontal: thinBorder,
      insideVertical: thinBorder,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `Department: `, bold: true, size: 18 }),
                  new TextRun({ text: displayDept, size: 18 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 12, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `Year: `, bold: true, size: 18 }),
                  new TextRun({ text: displayYear, size: 18 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 13, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `Semester: `, bold: true, size: 18 }),
                  new TextRun({ text: displaySem, size: 18 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 12, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `Sec: `, bold: true, size: 18 }),
                  new TextRun({ text: `'${sectionChar}'`, size: 18 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 23, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Date(s)\n', bold: true, size: 16 }),
                  new TextRun({ text: `From: ${dates.from}\nTo: ${dates.to}`, size: 16 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // 4. Main Data Table Header
  const headers = [
    { text: 'S.No', width: 4 },
    { text: 'Sub-code & Name', width: 14 },
    { text: 'Staff In charge', width: 12 },
    { text: 'Topics to be handled as per plan', width: 18 },
    { text: 'Actual Topics Covered', width: 18 },
    { text: 'Periods Planned', width: 6 },
    { text: 'Periods Handled', width: 6 },
    { text: 'Cumulative %', width: 7 },
    { text: 'If deviation, period req.', width: 7 },
    { text: 'Sign. of Faculty', width: 4 },
    { text: 'HoD Remarks', width: 4 }
  ];

  const headerRow = new TableRow({
    children: headers.map(h => new TableCell({
      width: { size: h.width, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: h.text, bold: true, size: 16 })],
        }),
      ],
    })),
  });

  // Main Data Rows
  const tableRows = [headerRow];
  displaySubjects.forEach((subj, index) => {
    const actualTopicsText = subj.topicsCoveredText || '';
    const topics = actualTopicsText
      ? actualTopicsText.split(/[,\n]/).map(t => t.trim()).filter(Boolean)
      : getBriefTopics(subj.code);
    
    const plannedTopicsText = subj.plannedTopicsText || '';
    const plannedTopics = plannedTopicsText
      ? plannedTopicsText.split(/[,\n]/).map(t => t.trim()).filter(Boolean)
      : getBriefTopics(subj.code);

    const periodsPlanned = subj.periodsPlanned !== null && subj.periodsPlanned !== undefined ? subj.periodsPlanned : '';
    const periodsHandled = subj.periodsHandled !== null && subj.periodsHandled !== undefined ? subj.periodsHandled : '';
    
    let deviationText = '';
    if (subj.coverage < 100) {
      if (subj.periodsRequired) {
        deviationText = `${subj.periodsRequired} periods`;
      }
      if (subj.reasonsForPending) {
        deviationText += deviationText ? `\nReason: ${subj.reasonsForPending}` : subj.reasonsForPending;
      }
    }

    const plannedParagraphs = plannedTopics.map(t => new Paragraph({
      children: [new TextRun({ text: `• ${t}`, size: 15 })],
    }));

    const actualParagraphs = topics.map(t => new Paragraph({
      children: [new TextRun({ text: `• ${t}`, size: 15 })],
    }));

    const row = new TableRow({
      children: [
        // S.No
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${index + 1}`, size: 16 })] })],
        }),
        // Sub-code & Name
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [new TextRun({ text: `${subj.code}-${subj.name}`, bold: true, size: 16 })] })],
        }),
        // Staff In charge
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [new TextRun({ text: subj.faculty, size: 16 })] })],
        }),
        // Topics to be handled
        new TableCell({
          verticalAlign: VerticalAlign.TOP,
          children: plannedParagraphs,
        }),
        // Actual Topics Covered
        new TableCell({
          verticalAlign: VerticalAlign.TOP,
          children: actualParagraphs,
        }),
        // Periods Planned
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${periodsPlanned}`, size: 16 })] })],
        }),
        // Periods Handled
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${periodsHandled}`, size: 16 })] })],
        }),
        // Cumulative %
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: subj.cumulativePercent || `${subj.coverage}%`, size: 16 })] })],
        }),
        // If deviation, period req.
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: deviationText || '-', size: 16 })] })],
        }),
        // Sign. of Faculty
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [] })],
        }),
        // HoD Remarks
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [new TextRun({ text: subj.reasonsForPending || '', size: 16 })] })],
        }),
      ],
    });
    tableRows.push(row);
  });

  const dataTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: thinBorder,
      bottom: thinBorder,
      left: thinBorder,
      right: thinBorder,
      insideHorizontal: thinBorder,
      insideVertical: thinBorder,
    },
    rows: tableRows,
  });

  // 5. Signatures Table
  const sigs = ['CC', 'HOD', 'AC', 'VP', 'PRINCIPAL', 'DIRECTOR(Acad.,)-JGC'];
  const signaturesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: noBorder,
      bottom: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: sigs.map(s => new TableCell({
          width: { size: 16.6, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: '\n\n\n' }), // spacing for signature
                new TextRun({ text: s, bold: true, size: 16 }),
              ],
            }),
          ],
        })),
      }),
    ],
  });

  // 6. Build Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          letterheadTable,
          new Paragraph({ text: '\n' }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'WEEKLY SYLLABUS COMPLETION REPORT (AY: 2026-2027 ODD SEMESTER)',
                bold: true,
                size: 20, // 10pt
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Date: ${report.submittedAt || ''}`,
                bold: true,
                size: 18,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          metaTable,
          new Paragraph({ text: '\n' }),
          dataTable,
          new Paragraph({ text: '\n' }),
          signaturesTable,
        ],
      },
    ],
  });

  const base64Data = await Packer.toBase64String(doc);
  const cleanClassId = classId.replace(/[^a-zA-Z0-9-_]/g, '_');
  const fileName = `Weekly_Report_${cleanClassId}_W${weekNumber}.docx`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
};
