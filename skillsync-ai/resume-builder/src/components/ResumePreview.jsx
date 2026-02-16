import { useState } from 'react'
import { downloadResumePDF, downloadResumeTXT, downloadResumeHTML, downloadResumeDOCX } from '../utils/resumeExports'

const FORMATS = [
  { id: 'pdf', label: 'PDF', ext: 'pdf', fn: downloadResumePDF },
  { id: 'docx', label: 'Word (DOCX)', ext: 'docx', fn: downloadResumeDOCX, async: true },
  { id: 'html', label: 'HTML', ext: 'html', fn: downloadResumeHTML },
  { id: 'txt', label: 'Plain text (TXT)', ext: 'txt', fn: downloadResumeTXT },
]

export default function ResumePreview({ data }) {
  const [downloading, setDownloading] = useState(null)
  const { personal = {}, experience = [], education = [], projects = [], skills = [], summary = '' } = data
  const skillsList = Array.isArray(skills) ? skills : (skills ? [skills] : [])

  const handleDownload = async (format) => {
    if (downloading) return
    setDownloading(format.id)
    try {
      if (format.async) await format.fn(data)
      else format.fn(data)
    } catch (e) {
      console.error(e)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-white/90">Live preview</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/60">Download:</span>
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleDownload(f)}
              disabled={downloading !== null}
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-2xl transition hover:border-white/30 hover:bg-white/10 disabled:opacity-50 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              {downloading === f.id ? '…' : f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="resume-paper min-h-[320px] flex-1 overflow-auto rounded-3xl border border-white/20 bg-white/[0.08] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-2xl md:min-h-[420px] md:p-6" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.08) 100%)' }}>
        <article className="mx-auto max-w-[21cm] rounded-2xl border border-white/10 bg-white/90 p-6 text-gray-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm md:p-8">
          <header className="border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{personal.name || 'Your Name'}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              {(personal.email || personal.phone || personal.location || personal.linkedin || personal.github) ? (
                <>
                  {personal.email && <span>{personal.email}</span>}
                  {personal.phone && <span>{personal.phone}</span>}
                  {personal.location && <span>{personal.location}</span>}
                  {personal.linkedin && (
                    <a
                      href={personal.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                      title="Open LinkedIn profile"
                    >
                      <span>🔗</span>
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {personal.github && (
                    <a
                      href={personal.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                      title="Open GitHub profile"
                    >
                      <span>💻</span>
                      <span>GitHub</span>
                    </a>
                  )}
                </>
              ) : (
                <span className="text-gray-400">Email · Phone · Location</span>
              )}
            </div>
          </header>
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Summary</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-700">
              {summary || <span className="text-gray-400 italic">Your professional summary will appear here. Use the form or AI to generate one.</span>}
            </p>
          </section>
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Experience</h2>
            <div className="mt-3 space-y-4">
              {experience?.length > 0 ? experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-gray-900">{exp.title || 'Job Title'}{exp.company && ` · ${exp.company}`}</h3>
                    {(exp.start || exp.end) && <span className="text-xs text-gray-500">{[exp.start, exp.end].filter(Boolean).join(' – ')}</span>}
                  </div>
                  {exp.description && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">{exp.description}</p>}
                </div>
              )) : (
                <p className="text-sm text-gray-400 italic">Add work experience in the form. Job title, company, dates, and description will show here.</p>
              )}
            </div>
          </section>
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Education</h2>
            <div className="mt-3 space-y-3">
              {education?.length > 0 ? education.map((edu, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-gray-900">{edu.degree || 'Degree'}{edu.field ? ` in ${edu.field}` : ''}</h3>
                  <p className="text-sm text-gray-700">{edu.school || 'School name'}</p>
                  {(edu.start || edu.end) && <p className="text-xs text-gray-500">{[edu.start, edu.end].filter(Boolean).join(' – ')}</p>}
                </div>
              )) : (
                <p className="text-sm text-gray-400 italic">Add education in the form. Degree, school, and dates will show here.</p>
              )}
            </div>
          </section>
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Projects</h2>
            <div className="mt-3 space-y-4">
              {projects?.length > 0 ? projects.map((proj, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-gray-900">{proj.title || 'Project Title'}</h3>
                  {proj.description && (
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">{proj.description}</p>
                  )}
                  {(proj.linkedin || proj.github) && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {proj.linkedin && (
                        <a
                          href={proj.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                          title="Open LinkedIn post"
                        >
                          <span>🔗</span>
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {proj.github && (
                        <a
                          href={proj.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                          title="Open GitHub repository"
                        >
                          <span>💻</span>
                          <span>GitHub</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-sm text-gray-400 italic">Add projects in the form. Project title, description, and links will show here.</p>
              )}
            </div>
          </section>
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Skills</h2>
            <p className="mt-1.5 text-sm text-gray-700">
              {skillsList.length > 0 ? skillsList.join(', ') : <span className="text-gray-400 italic">Add skills (comma-separated) in the form. They will appear here.</span>}
            </p>
          </section>
        </article>
      </div>
    </div>
  )
}
