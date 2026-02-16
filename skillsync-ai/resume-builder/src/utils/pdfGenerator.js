import { jsPDF } from 'jspdf'

const MARGIN = 20
const PAGE_W = 210
const LINE_HEIGHT = 6
const TITLE_SIZE = 18
const SECTION_SIZE = 12
const BODY_SIZE = 10

export function generateResumePDF(resume) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MARGIN
  const { personal = {}, experience = [], education = [], projects = [], skills = [], summary = '' } = resume

  doc.setFontSize(TITLE_SIZE)
  doc.setFont(undefined, 'bold')
  doc.text(personal.name || 'Your Name', MARGIN, y)
  y += LINE_HEIGHT + 2

  doc.setFontSize(BODY_SIZE)
  doc.setFont(undefined, 'normal')
  const contactParts = [personal.email, personal.phone, personal.location].filter(Boolean)
  if (contactParts.length > 0) {
    let contactX = MARGIN
    contactParts.forEach((part, i) => {
      doc.text(part, contactX, y)
      const textWidth = doc.getTextWidth(part)
      contactX += textWidth + 8
      if (i < contactParts.length - 1) {
        doc.text('•', contactX, y)
        contactX += 6
      }
    })
    y += LINE_HEIGHT
  }
  
  // LinkedIn and GitHub links (clickable in PDF)
  if (personal.linkedin || personal.github) {
    let linkX = MARGIN
    doc.setTextColor(0, 102, 204)
    if (personal.linkedin) {
      const linkWidth = doc.getTextWidth('LinkedIn')
      doc.text('LinkedIn', linkX, y)
      doc.link(linkX, y - 4, linkWidth, LINE_HEIGHT, { url: personal.linkedin })
      linkX += linkWidth + 8
    }
    if (personal.github) {
      const linkWidth = doc.getTextWidth('GitHub')
      doc.text('GitHub', linkX, y)
      doc.link(linkX, y - 4, linkWidth, LINE_HEIGHT, { url: personal.github })
    }
    doc.setTextColor(0, 0, 0)
    y += LINE_HEIGHT + 2
  }

  if (summary) {
    y = addSection(doc, y, 'Summary', SECTION_SIZE)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(BODY_SIZE)
    const summaryLines = doc.splitTextToSize(summary, PAGE_W - 2 * MARGIN)
    doc.text(summaryLines, MARGIN, y)
    y += summaryLines.length * LINE_HEIGHT + 6
  }

  if (experience.length) {
    y = addSection(doc, y, 'Experience', SECTION_SIZE)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(BODY_SIZE)
    for (const exp of experience) {
      const titleLine = [exp.title, exp.company].filter(Boolean).join(' | ') || 'Experience'
      doc.setFont(undefined, 'bold')
      doc.text(titleLine, MARGIN, y)
      y += LINE_HEIGHT
      if (exp.start || exp.end) { doc.setFont(undefined, 'normal'); doc.text(`${exp.start || ''} – ${exp.end || ''}`, MARGIN, y); y += LINE_HEIGHT }
      if (exp.description) {
        const descLines = doc.splitTextToSize(exp.description, PAGE_W - 2 * MARGIN)
        doc.text(descLines, MARGIN, y)
        y += descLines.length * LINE_HEIGHT
      }
      y += 4
    }
    y += 2
  }

  if (education.length) {
    y = addSection(doc, y, 'Education', SECTION_SIZE)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(BODY_SIZE)
    for (const edu of education) {
      doc.setFont(undefined, 'bold')
      doc.text(`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`, MARGIN, y)
      y += LINE_HEIGHT
      doc.setFont(undefined, 'normal')
      doc.text(edu.school || '', MARGIN, y)
      y += LINE_HEIGHT
      if (edu.start || edu.end) { doc.text(`${edu.start || ''} – ${edu.end || ''}`, MARGIN, y); y += LINE_HEIGHT }
      y += 4
    }
    y += 2
  }

  if (projects.length) {
    y = addSection(doc, y, 'Projects', SECTION_SIZE)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(BODY_SIZE)
    for (const proj of projects) {
      doc.setFont(undefined, 'bold')
      doc.text(proj.title || 'Project', MARGIN, y)
      y += LINE_HEIGHT
      if (proj.description) {
        doc.setFont(undefined, 'normal')
        const descLines = doc.splitTextToSize(proj.description, PAGE_W - 2 * MARGIN)
        doc.text(descLines, MARGIN, y)
        y += descLines.length * LINE_HEIGHT
      }
      if (proj.linkedin || proj.github) {
        let linkX = MARGIN
        doc.setTextColor(0, 102, 204)
        if (proj.linkedin) {
          const linkWidth = doc.getTextWidth('LinkedIn')
          doc.text('LinkedIn', linkX, y)
          doc.link(linkX, y - 4, linkWidth, LINE_HEIGHT, { url: proj.linkedin })
          linkX += linkWidth + 8
        }
        if (proj.github) {
          const linkWidth = doc.getTextWidth('GitHub')
          doc.text('GitHub', linkX, y)
          doc.link(linkX, y - 4, linkWidth, LINE_HEIGHT, { url: proj.github })
        }
        doc.setTextColor(0, 0, 0)
        y += LINE_HEIGHT
      }
      y += 4
    }
    y += 2
  }

  if (skills.length) {
    y = addSection(doc, y, 'Skills', SECTION_SIZE)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(BODY_SIZE)
    const skillsText = Array.isArray(skills) ? skills.join(', ') : skills
    const skillLines = doc.splitTextToSize(skillsText, PAGE_W - 2 * MARGIN)
    doc.text(skillLines, MARGIN, y)
  }

  return doc
}

function addSection(doc, y, title, fontSize) {
  if (y > 270) { doc.addPage(); y = MARGIN }
  doc.setFontSize(fontSize)
  doc.setFont(undefined, 'bold')
  doc.text(title, MARGIN, y)
  return y + LINE_HEIGHT + 2
}

export function downloadResumePDF(resume) {
  const doc = generateResumePDF(resume)
  const name = (resume.personal?.name || 'resume').replace(/\s+/g, '-')
  doc.save(`${name}-resume.pdf`)
}
