import { useState } from 'react'

const STEPS = [
  { id: 'personal', label: 'Personal', icon: 'Profile' },
  { id: 'experience', label: 'Experience', icon: 'Work' },
  { id: 'projects', label: 'Projects', icon: 'Build' },
  { id: 'education', label: 'Education', icon: 'Study' },
  { id: 'skills', label: 'Skills', icon: 'Skill' },
  { id: 'summary', label: 'Summary', icon: 'Text' },
]

const emptyExperience = () => ({ title: '', company: '', start: '', end: '', description: '' })
const emptyProject = () => ({
  name: '',
  role: '',
  start: '',
  end: '',
  description: '',
  liveLink: '',
  githubLink: '',
})
const emptyEducation = () => ({ degree: '', school: '', field: '', start: '', end: '' })

export default function ResumeForm({ data, onChange }) {
  const [step, setStep] = useState(0)
  const currentStepId = STEPS[step].id

  const update = (section, value) => onChange({ ...data, [section]: value })
  const updatePersonal = (field, value) => update('personal', { ...data.personal, [field]: value })
  const updateExperience = (index, field, value) => {
    const next = [...(data.experience || [])]
    if (!next[index]) next[index] = emptyExperience()
    next[index] = { ...next[index], [field]: value }
    update('experience', next)
  }
  const addExperience = () => update('experience', [...(data.experience || []), emptyExperience()])
  const removeExperience = (i) => update('experience', data.experience.filter((_, j) => j !== i))
  const updateProject = (index, field, value) => {
    const next = [...(data.projects || [])]
    if (!next[index]) next[index] = emptyProject()
    next[index] = { ...next[index], [field]: value }
    update('projects', next)
  }
  const addProject = () => update('projects', [...(data.projects || []), emptyProject()])
  const removeProject = (i) => update('projects', data.projects.filter((_, j) => j !== i))
  const updateEducation = (index, field, value) => {
    const next = [...(data.education || [])]
    if (!next[index]) next[index] = emptyEducation()
    next[index] = { ...next[index], [field]: value }
    update('education', next)
  }
  const addEducation = () => update('education', [...(data.education || []), emptyEducation()])
  const removeEducation = (i) => update('education', data.education.filter((_, j) => j !== i))
  const updateSkills = (value) => {
    const list = typeof value === 'string' ? value.split(',').map((s) => s.trim()).filter(Boolean) : value
    update('skills', list)
  }
  const skillsText = (data.skills || []).join(', ')

  const inputGlass =
    'w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 outline-none transition focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20'

  return (
    <div className="rounded-3xl border border-white/20 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
      <div className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
              i === step
                ? 'border-white/30 bg-white/20 text-white shadow-lg'
                : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {currentStepId === 'personal' && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-white">Personal details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Full name</label>
              <input
                type="text"
                value={data.personal?.name ?? ''}
                onChange={(e) => updatePersonal('name', e.target.value)}
                className={inputGlass}
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Email</label>
              <input
                type="email"
                value={data.personal?.email ?? ''}
                onChange={(e) => updatePersonal('email', e.target.value)}
                className={inputGlass}
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Phone</label>
              <input
                type="tel"
                value={data.personal?.phone ?? ''}
                onChange={(e) => updatePersonal('phone', e.target.value)}
                className={inputGlass}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Location</label>
              <input
                type="text"
                value={data.personal?.location ?? ''}
                onChange={(e) => updatePersonal('location', e.target.value)}
                className={inputGlass}
                placeholder="City, Country"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Target role (optional)</label>
              <input
                type="text"
                value={data.personal?.targetRole ?? ''}
                onChange={(e) => updatePersonal('targetRole', e.target.value)}
                className={inputGlass}
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm text-white/70">
                <span>LinkedIn profile (optional)</span>
              </label>
              <input
                type="url"
                value={data.personal?.linkedin ?? ''}
                onChange={(e) => updatePersonal('linkedin', e.target.value)}
                className={inputGlass}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm text-white/70">
                <span>GitHub profile (optional)</span>
              </label>
              <input
                type="url"
                value={data.personal?.github ?? ''}
                onChange={(e) => updatePersonal('github', e.target.value)}
                className={inputGlass}
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>
        </div>
      )}

      {currentStepId === 'experience' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Work experience</h2>
            <button
              type="button"
              onClick={addExperience}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              + Add
            </button>
          </div>
          <div className="space-y-6">
            {(data.experience?.length ? data.experience : [emptyExperience()]).map((exp, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl"
              >
                <div className="mb-4 flex justify-end">
                  {data.experience?.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(i)}
                      className="text-sm text-red-300 hover:text-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">Job title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(i, 'title', e.target.value)}
                      className={inputGlass}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(i, 'company', e.target.value)}
                      className={inputGlass}
                      placeholder="Acme Inc."
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">Start date</label>
                    <input
                      type="text"
                      value={exp.start}
                      onChange={(e) => updateExperience(i, 'start', e.target.value)}
                      className={inputGlass}
                      placeholder="Jan 2020"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">End date</label>
                    <input
                      type="text"
                      value={exp.end}
                      onChange={(e) => updateExperience(i, 'end', e.target.value)}
                      className={inputGlass}
                      placeholder="Present"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm text-white/70">Description / bullet points</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(i, 'description', e.target.value)}
                    className={`${inputGlass} min-h-[100px] resize-y`}
                    placeholder="Key responsibilities and achievements..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStepId === 'projects' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Projects</h2>
            <button
              type="button"
              onClick={addProject}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              + Add
            </button>
          </div>
          <div className="space-y-6">
            {(data.projects?.length ? data.projects : [emptyProject()]).map((project, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl"
              >
                <div className="mb-4 flex justify-end">
                  {data.projects?.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProject(i)}
                      className="text-sm text-red-300 hover:text-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">Project name</label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => updateProject(i, 'name', e.target.value)}
                      className={inputGlass}
                      placeholder="Portfolio Website"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">Your role / stack</label>
                    <input
                      type="text"
                      value={project.role}
                      onChange={(e) => updateProject(i, 'role', e.target.value)}
                      className={inputGlass}
                      placeholder="Full Stack Developer"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">Start date</label>
                    <input
                      type="text"
                      value={project.start}
                      onChange={(e) => updateProject(i, 'start', e.target.value)}
                      className={inputGlass}
                      placeholder="Jan 2024"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">End date</label>
                    <input
                      type="text"
                      value={project.end}
                      onChange={(e) => updateProject(i, 'end', e.target.value)}
                      className={inputGlass}
                      placeholder="Mar 2024"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">Live link (optional)</label>
                    <input
                      type="url"
                      value={project.liveLink}
                      onChange={(e) => updateProject(i, 'liveLink', e.target.value)}
                      className={inputGlass}
                      placeholder="https://yourproject.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">GitHub link (optional)</label>
                    <input
                      type="url"
                      value={project.githubLink}
                      onChange={(e) => updateProject(i, 'githubLink', e.target.value)}
                      className={inputGlass}
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm text-white/70">Description / highlights</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(i, 'description', e.target.value)}
                    className={`${inputGlass} min-h-[100px] resize-y`}
                    placeholder="What you built, impact, and key technologies..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStepId === 'education' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Education</h2>
            <button
              type="button"
              onClick={addEducation}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              + Add
            </button>
          </div>
          <div className="space-y-6">
            {(data.education?.length ? data.education : [emptyEducation()]).map((edu, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl"
              >
                <div className="mb-4 flex justify-end">
                  {data.education?.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(i)}
                      className="text-sm text-red-300 hover:text-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                      className={inputGlass}
                      placeholder="B.S. Computer Science"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">School</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateEducation(i, 'school', e.target.value)}
                      className={inputGlass}
                      placeholder="University of Example"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-white/70">Field (optional)</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => updateEducation(i, 'field', e.target.value)}
                      className={inputGlass}
                      placeholder="Computer Science"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="mb-1.5 block text-sm text-white/70">Start</label>
                      <input
                        type="text"
                        value={edu.start}
                        onChange={(e) => updateEducation(i, 'start', e.target.value)}
                        className={inputGlass}
                        placeholder="2016"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1.5 block text-sm text-white/70">End</label>
                      <input
                        type="text"
                        value={edu.end}
                        onChange={(e) => updateEducation(i, 'end', e.target.value)}
                        className={inputGlass}
                        placeholder="2020"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStepId === 'skills' && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-white">Skills</h2>
          <p className="text-sm text-white/60">Comma-separated (e.g. React, Node.js, Leadership)</p>
          <textarea
            value={skillsText}
            onChange={(e) => updateSkills(e.target.value)}
            className={`${inputGlass} min-h-[140px] resize-y`}
            placeholder="JavaScript, React, Tailwind CSS, ..."
          />
        </div>
      )}

      {currentStepId === 'summary' && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-white">Professional summary</h2>
          <p className="text-sm text-white/60">A brief overview for the top of your resume. Use the AI assistant to generate one.</p>
          <textarea
            value={data.summary ?? ''}
            onChange={(e) => update('summary', e.target.value)}
            className={`${inputGlass} min-h-[180px] resize-y`}
            placeholder="Experienced professional with..."
          />
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-white transition disabled:opacity-40 hover:bg-white/20 disabled:hover:bg-white/10"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          className="rounded-xl border border-white/30 bg-white/20 px-5 py-2.5 font-medium text-white shadow-lg transition disabled:opacity-40 hover:bg-white/30 disabled:hover:bg-white/20"
        >
          Next
        </button>
      </div>
    </div>
  )
}
