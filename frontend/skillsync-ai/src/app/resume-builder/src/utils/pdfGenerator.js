import { jsPDF } from 'jspdf'

const MARGIN = 20
const PAGE_W = 210
const LINE_HEIGHT = 6
const TITLE_SIZE = 18
const SECTION_SIZE = 12
const BODY_SIZE = 10
const CONTENT_W = PAGE_W - 2 * MARGIN

function toUrl(value) {
  const raw = (value || '').trim()
  if (!raw) return ''
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

function ensureSpace(doc, y, needed = 12) {
  if (y + needed > 280) {
    doc.addPage()
    return MARGIN
  }
  return y
}

function addSection(doc, y, title, fontSize) {
  y = ensureSpace(doc, y, 12)
  doc.setFontSize(fontSize)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(title, MARGIN, y)
  return y + LINE_HEIGHT + 2
}

function drawLink(doc, label, url, x, y) {
  doc.setTextColor(0, 102, 204)
  doc.text(label, x, y)
  const width = doc.getTextWidth(label)
  doc.link(x, y - 4, width, LINE_HEIGHT, { url })
  doc.setTextColor(0, 0, 0)
  return x + width
}

export function generateResumePDF(resume) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MARGIN

  const {
    personal = {},
    experience = [],
    projects = [],
    education = [],
    skills = [],
    summary = '',
  } = resume

  const linkedinUrl = toUrl(personal.linkedin)
  const githubUrl = toUrl(personal.github)

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
      contactX += doc.getTextWidth(part) + 6
      if (i < contactParts.length - 1) {
        doc.text('|', contactX, y)
        contactX += 4
      }
    })
    y += LINE_HEIGHT
  }

  if (linkedinUrl || githubUrl) {
    let linkX = MARGIN
    if (linkedinUrl) {
      linkX = drawLink(doc, 'LinkedIn', linkedinUrl, linkX, y) + 8
    }
    if (githubUrl) {
      linkX = drawLink(doc, 'GitHub', githubUrl, linkX, y) + 8
    }
    y += LINE_HEIGHT + 2
  }

  if (summary) {
    y = addSection(doc, y, 'Summary', SECTION_SIZE)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(BODY_SIZE)
    const summaryLines = doc.splitTextToSize(summary, CONTENT_W)
    y = ensureSpace(doc, y, summaryLines.length * LINE_HEIGHT + 4)
    doc.text(summaryLines, MARGIN, y)
    y += summaryLines.length * LINE_HEIGHT + 6
  }

  if (experience.length) {
    y = addSection(doc, y, 'Experience', SECTION_SIZE)
    doc.setFontSize(BODY_SIZE)
    for (const exp of experience) {
      y = ensureSpace(doc, y, 20)
      const titleLine = [exp.title, exp.company].filter(Boolean).join(' | ') || 'Experience'
      doc.setFont(undefined, 'bold')
      doc.text(titleLine, MARGIN, y)
      y += LINE_HEIGHT

      if (exp.start || exp.end) {
        doc.setFont(undefined, 'normal')
        doc.text(`${exp.start || ''} - ${exp.end || ''}`, MARGIN, y)
        y += LINE_HEIGHT
      }

      if (exp.description) {
        doc.setFont(undefined, 'normal')
        const descLines = doc.splitTextToSize(exp.description, CONTENT_W)
        y = ensureSpace(doc, y, descLines.length * LINE_HEIGHT + 4)
        doc.text(descLines, MARGIN, y)
        y += descLines.length * LINE_HEIGHT
      }

      y += 4
    }
    y += 2
  }

  if (projects.length) {
    y = addSection(doc, y, 'Projects', SECTION_SIZE)
    doc.setFontSize(BODY_SIZE)
    for (const project of projects) {
      y = ensureSpace(doc, y, 24)
      doc.setFont(undefined, 'bold')
      const projectLine = [project.name, project.role].filter(Boolean).join(' | ') || 'Project'
      doc.text(projectLine, MARGIN, y)
      y += LINE_HEIGHT

      if (project.start || project.end) {
        doc.setFont(undefined, 'normal')
        doc.text(`${project.start || ''} - ${project.end || ''}`, MARGIN, y)
        y += LINE_HEIGHT
      }

      const liveUrl = toUrl(project.liveLink)
      const projectGithubUrl = toUrl(project.githubLink)
      if (liveUrl || projectGithubUrl) {
        let x = MARGIN
        if (liveUrl) {
          x = drawLink(doc, 'Live', liveUrl, x, y) + 8
        }
        if (projectGithubUrl) {
          x = drawLink(doc, 'GitHub', projectGithubUrl, x, y) + 8
        }
        y += LINE_HEIGHT
      }

      if (project.description) {
        doc.setFont(undefined, 'normal')
        const projectLines = doc.splitTextToSize(project.description, CONTENT_W)
        y = ensureSpace(doc, y, projectLines.length * LINE_HEIGHT + 4)
        doc.text(projectLines, MARGIN, y)
        y += projectLines.length * LINE_HEIGHT
      }

      y += 4
    }
    y += 2
  }

  if (education.length) {
    y = addSection(doc, y, 'Education', SECTION_SIZE)
    doc.setFontSize(BODY_SIZE)
    for (const edu of education) {
      y = ensureSpace(doc, y, 18)
      doc.setFont(undefined, 'bold')
      doc.text(`${edu.degree || ''}${edu.field ? ` in ${edu.field}` : ''}`, MARGIN, y)
      y += LINE_HEIGHT
      doc.setFont(undefined, 'normal')
      doc.text(edu.school || '', MARGIN, y)
      y += LINE_HEIGHT
      if (edu.start || edu.end) {
        doc.text(`${edu.start || ''} - ${edu.end || ''}`, MARGIN, y)
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
    const skillLines = doc.splitTextToSize(skillsText, CONTENT_W)
    y = ensureSpace(doc, y, skillLines.length * LINE_HEIGHT + 2)
    doc.text(skillLines, MARGIN, y)
  }

  return doc
}

export function downloadResumePDF(resume) {
  const doc = generateResumePDF(resume)
  const name = (resume.personal?.name || 'resume').replace(/\s+/g, '-')
  doc.save(`${name}-resume.pdf`)
}
