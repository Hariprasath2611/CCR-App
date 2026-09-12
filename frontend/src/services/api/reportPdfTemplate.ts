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

export const generateReportHTML = (report: ConsolidatedReport): string => {
  const { classId, weekNumber, subjects } = report;
  const displaySubjects = filterNonAcademicSubjects(subjects || []);

  // Derive section metadata using section templates
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

  const firstWithDates = displaySubjects.find(s => s.fromDate && s.toDate);
  const defaultDates = getDates(weekNumber);
  const dates = {
    from: firstWithDates?.fromDate ? firstWithDates.fromDate.replace(/\//g, '.') : defaultDates.from,
    to: firstWithDates?.toDate ? firstWithDates.toDate.replace(/\//g, '.') : defaultDates.to,
  };

  const tableRowsHtml = displaySubjects.map((subj, index) => {
    const actualTopicsText = subj.topicsCoveredText || '';
    const topics = actualTopicsText
      ? actualTopicsText.split(/[,\n]/).map(t => t.trim()).filter(Boolean)
      : getBriefTopics(subj.code);
    
    const plannedTopicsText = subj.plannedTopicsText || '';
    const plannedTopics = plannedTopicsText
      ? plannedTopicsText.split(/[,\n]/).map(t => t.trim()).filter(Boolean)
      : getBriefTopics(subj.code);

    const topicsBullets = topics.map(t => `<li>${t}</li>`).join('');
    const plannedBullets = plannedTopics.map(t => `<li>${t}</li>`).join('');

    const periodsPlanned = subj.periodsPlanned !== null && subj.periodsPlanned !== undefined ? subj.periodsPlanned : '';
    const periodsHandled = subj.periodsHandled !== null && subj.periodsHandled !== undefined ? subj.periodsHandled : '';
    const periodsRequired = subj.periodsRequired !== null && subj.periodsRequired !== undefined ? subj.periodsRequired : '';
    const reasonsForPending = subj.reasonsForPending || '';

    let deviationText = '';
    if (subj.coverage < 100) {
      if (periodsRequired) {
        deviationText = `${periodsRequired} periods`;
      }
      if (reasonsForPending) {
        deviationText += deviationText ? `<br/>Reason: ${reasonsForPending}` : reasonsForPending;
      }
    }

    return `
      <tr>
        <td style="text-align: center; vertical-align: middle;">${index + 1}</td>
        <td style="font-weight: bold; vertical-align: middle; font-size: 9.5px;">${subj.code}-${subj.name}</td>
        <td style="vertical-align: middle; font-size: 9.5px;">${subj.faculty}</td>
        <td style="vertical-align: top;"><ul style="margin: 0; padding-left: 12px; font-size: 9px;">${plannedBullets}</ul></td>
        <td style="vertical-align: top;">
          <ul style="margin: 0; padding-left: 12px; font-size: 9px;">${topicsBullets}</ul>
        </td>
        <td style="text-align: center; vertical-align: middle;">${periodsPlanned}</td>
        <td style="text-align: center; vertical-align: middle;">${periodsHandled}</td>
        <td style="text-align: center; vertical-align: middle;">${subj.cumulativePercent || (subj.coverage + '%')}</td>
        <td style="vertical-align: middle; font-size: 9px; text-align: center;">${deviationText || '-'}</td>
        <td style="vertical-align: middle;"></td>
        <td style="vertical-align: middle; font-size: 9px;">${subj.reasonsForPending || ''}</td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Weekly Syllabus Completion Report</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 15px; 
          color: #000000; 
          background-color: #FFFFFF; 
        }
        .data-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px; 
        }
        .data-table th, .data-table td { 
          border: 1px solid #000000; 
          padding: 6px 4px; 
          font-size: 9.5px; 
          color: #000000;
        }
        .data-table th { 
          background-color: #FFFFFF; 
          color: #000000; 
          font-weight: bold; 
          text-align: center;
          vertical-align: middle;
          font-size: 9.5px;
        }
        ul {
          margin: 0;
          padding-left: 12px;
        }
        li {
          margin-bottom: 2px;
        }
      </style>
    </head>
    <body>
      <!-- JEC Letterhead Table -->
      <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 10px;">
        <tr style="border: none;">
          <td style="width: 15%; border: none; text-align: left; padding: 0; vertical-align: middle;">
            <img src="${JEC_LOGO_BASE64}" style="width: 80px; height: auto;" />
          </td>
          <td style="width: 70%; border: none; text-align: center; padding: 0; vertical-align: middle;">
            <div style="font-family: 'Times New Roman', Times, serif; font-size: 24px; font-weight: bold; color: #b71c1c; margin: 0; letter-spacing: 0.5px; text-transform: uppercase;">
              JAYA ENGINEERING COLLEGE
            </div>
            <div style="font-size: 11px; font-weight: bold; color: #0d47a1; margin: 2px 0 0 0;">
              (Approved by AICTE, New Delhi || Affiliated to Anna University, Chennai)
            </div>
            <div style="font-size: 9px; font-weight: bold; color: #0d47a1; margin: 1px 0 0 0;">
              Accredited by NAAC & NBA(CSE&TEXTILE)/Recognized by UGC under section 2(f) & 12(b)
            </div>
            <div style="font-size: 9.5px; font-weight: bold; color: #1e293b; margin: 1px 0 0 0;">
              Thiruninravur, Chennai, Tamil Nadu, 602 024
            </div>
            <div style="font-size: 9.5px; font-weight: bold; color: #1e293b; margin: 1px 0 0 0;">
              Phone:044-26300982 || Website: jec.ac.in || Email: info@jec.ac.in
            </div>
          </td>
          <td style="width: 15%; border: none; text-align: right; padding: 0; vertical-align: middle;">
            <!-- CSS 31 Years Gold Badge -->
            <div style="display: inline-block; width: 76px; height: 76px; border-radius: 38px; background: linear-gradient(135deg, #ffd700, #ffa500); border: 2px solid #b71c1c; position: relative; text-align: center; box-sizing: border-box; padding: 3px;">
              <div style="border: 1px dashed #b71c1c; border-radius: 50%; height: 100%; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box; background: rgba(255,255,255,0.1);">
                <span style="font-size: 5px; font-weight: 900; color: #b71c1c; line-height: 6px; text-transform: uppercase;">Your Success Is</span>
                <span style="font-size: 5px; font-weight: 900; color: #b71c1c; line-height: 6px; text-transform: uppercase; margin-bottom: 1px;">Our Service</span>
                <span style="font-size: 16px; font-weight: 900; color: #b71c1c; line-height: 16px; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;">31</span>
                <span style="font-size: 6px; font-weight: 900; color: #b71c1c; line-height: 6px; text-transform: uppercase;">Years</span>
                <span style="font-size: 5px; font-weight: 900; color: #b71c1c; line-height: 5px; text-transform: uppercase; margin-top: 1px; letter-spacing: 0.3px;">Excellence</span>
              </div>
            </div>
          </td>
        </tr>
      </table>
      <div style="border-bottom: 2px solid #000000; margin-bottom: 12px; width: 100%;"></div>

      <!-- Weekly Title and Date -->
      <div style="text-align: center; font-size: 12px; font-weight: bold; font-family: Arial, sans-serif; text-transform: uppercase; margin-bottom: 8px;">
        WEEKLY SYLLABUS COMPLETION REPORT (AY: 2026-2027 ODD SEMESTER)
      </div>
      <div style="text-align: right; font-size: 11px; font-weight: bold; margin-bottom: 10px; padding-right: 5px;">
        Date: ${report.submittedAt || ''}
      </div>

      <!-- Meta Table Information -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-family: Arial, sans-serif; font-size: 11px;">
        <tr>
          <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold; width: 45%; vertical-align: middle;">
            Department: ${displayDept}
          </td>
          <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold; width: 12%; vertical-align: middle; text-align: center;">
            Year: ${classId.includes('3rd') || classId.includes('III') ? 'III' : (classId.includes('4th') || classId.includes('IV') ? 'IV' : 'II')}
          </td>
          <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold; width: 13%; vertical-align: middle; text-align: center;">
            Semester: ${classId.includes('3rd') || classId.includes('III') ? 'V' : (classId.includes('4th') || classId.includes('IV') ? 'VII' : 'III')}
          </td>
          <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold; width: 12%; vertical-align: middle; text-align: center;">
            Sec:- '${sectionChar}'
          </td>
          <td style="border: 1px solid #000000; padding: 4px 6px; font-weight: bold; width: 18%; vertical-align: middle; line-height: 1.3;">
            Date(s)<br/>
            From: ${dates.from}<br/>
            To : ${dates.to}
          </td>
        </tr>
      </table>

      <!-- Main Data Table -->
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 4%;">S.No</th>
            <th style="width: 14%;">Sub-code & Name</th>
            <th style="width: 12%;">Staff In charge</th>
            <th style="width: 18%;">Topics to be handled in this week as per plan</th>
            <th style="width: 18%;">Actual Topics Covered</th>
            <th style="width: 6%;">No. of Periods Planned for this week</th>
            <th style="width: 6%;">No. of Periods Handled</th>
            <th style="width: 7%;">Cumulative % Unit wise Completed</th>
            <th style="width: 7%;">If deviation, Period required to complete</th>
            <th style="width: 4%;">Sign. of the faculty In-charge</th>
            <th style="width: 4%;">HoD Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `;
};
