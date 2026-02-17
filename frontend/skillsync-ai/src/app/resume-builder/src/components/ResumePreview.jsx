import { useRef } from 'react'
import { downloadResumePDF } from '../utils/pdfGenerator'

function toUrl(value) {
  const raw = (value || '').trim()
  if (!raw) return ''
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

export default function ResumePreview({ data }) {
  const containerRef = useRef(null)
  const { personal = {}, experience = [], projects = [], education = [], skills = [], summary = '' } = data
  const skillsList = Array.isArray(skills) ? skills : (skills ? [skills] : [])
  const linkedinUrl = toUrl(personal.linkedin)
  const githubUrl = toUrl(personal.github)

  const handleDownload = () => {
    downloadResumePDF(data)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h3 className="text-lg font-semibold text-white/90">Live preview</h3>
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-xl border border-white/25 bg-white/15 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-xl transition hover:bg-white/25 hover:shadow-xl"
        >
          Download PDF
        </button>
      </div>

      <div
        ref={containerRef}
        className="resume-paper min-h-[320px] flex-1 overflow-auto rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur-sm md:min-h-[420px] md:p-6"
      >
        <article className="mx-auto max-w-[21cm] bg-white p-6 text-gray-800 shadow-inner md:p-8">
          <header className="border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {personal.name || 'Your Name'}
            </h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0 text-sm text-gray-600">
              {(personal.email || personal.phone || personal.location || linkedinUrl || githubUrl) ? (
                <>
                  {personal.email && <span>{personal.email}</span>}
                  {personal.phone && <span>{personal.phone}</span>}
                  {personal.location && <span>{personal.location}</span>}
                  {linkedinUrl && (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                      title="Open LinkedIn profile"
                    >
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                      title="Open GitHub profile"
                    >
                      <span>GitHub</span>
                    </a>
                  )}
                </>
              ) : (
                <span className="text-gray-400">Email | Phone | Location</span>
              )}
            </div>
          </header>

          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Summary
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-700">
              {summary || (
                <span className="text-gray-400 italic">
                  Your professional summary will appear here. Use the form or AI to generate one.
                </span>
              )}
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Experience
            </h2>
            <div className="mt-3 space-y-4">
              {experience?.length > 0 ? (
                experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {exp.title || 'Job Title'}
                        {exp.company && ` | ${exp.company}`}
                      </h3>
                      {(exp.start || exp.end) && (
                        <span className="text-xs text-gray-500">
                          {[exp.start, exp.end].filter(Boolean).join(' - ')}
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Add work experience in the form. Job title, company, dates, and description will show here.
                </p>
              )}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Projects
            </h2>
            <div className="mt-3 space-y-4">
              {projects?.length > 0 ? (
                projects.map((project, i) => {
                  const liveUrl = toUrl(project.liveLink)
                  const projectGithubUrl = toUrl(project.githubLink)

                  return (
                    <div key={i}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {project.name || 'Project Name'}
                          {project.role ? ` | ${project.role}` : ''}
                        </h3>
                        {(project.start || project.end) && (
                          <span className="text-xs text-gray-500">
                            {[project.start, project.end].filter(Boolean).join(' - ')}
                          </span>
                        )}
                      </div>
                      {(liveUrl || projectGithubUrl) && (
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          {liveUrl && (
                            <a
                              href={liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Live
                            </a>
                          )}
                          {projectGithubUrl && (
                            <a
                              href={projectGithubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              GitHub
                            </a>
                          )}
                        </div>
                      )}
                      {project.description && (
                        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                          {project.description}
                        </p>
                      )}
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Add projects in the form. Project details and links will show here.
                </p>
              )}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Education
            </h2>
            <div className="mt-3 space-y-3">
              {education?.length > 0 ? (
                education.map((edu, i) => (
                  <div key={i}>
                    <h3 className="font-semibold text-gray-900">
                      {edu.degree || 'Degree'}
                      {edu.field ? ` in ${edu.field}` : ''}
                    </h3>
                    <p className="text-sm text-gray-700">{edu.school || 'School name'}</p>
                    {(edu.start || edu.end) && (
                      <p className="text-xs text-gray-500">
                        {[edu.start, edu.end].filter(Boolean).join(' - ')}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Add education in the form. Degree, school, and dates will show here.
                </p>
              )}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Skills
            </h2>
            <p className="mt-1.5 text-sm text-gray-700">
              {skillsList.length > 0 ? (
                skillsList.join(', ')
              ) : (
                <span className="text-gray-400 italic">
                  Add skills (comma-separated) in the form. They will appear here.
                </span>
              )}
            </p>
          </section>
        </article>
      </div>
    </div>
  )
}
