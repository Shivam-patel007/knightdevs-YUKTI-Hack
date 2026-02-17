import { useState } from 'react'
import { generateSummary, enhanceJobDescription, suggestSkills } from '../utils/openRouterAPI'

const glass =
  'rounded-2xl border border-white/20 bg-white/5 p-5 shadow-xl backdrop-blur-2xl'

export default function AIAssistant({ data, onUpdate }) {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')

  const update = (field, value) => onUpdate({ ...data, [field]: value })

  const handleGenerateSummary = async () => {
    setError('')
    setLoading('summary')
    try {
      const summary = await generateSummary(
        data.personal,
        data.experience,
        data.education,
        data.skills
      )
      update('summary', summary)
    } catch (e) {
      setError(e.message || 'Failed to generate summary')
    } finally {
      setLoading(null)
    }
  }

  const handleEnhanceJob = async (index) => {
    const exp = data.experience?.[index]
    if (!exp?.title || !exp?.company) {
      setError('Add job title and company first.')
      return
    }
    setError('')
    setLoading(`enhance-${index}`)
    try {
      const enhanced = await enhanceJobDescription(
        exp.title,
        exp.company,
        exp.description || 'No description provided.'
      )
      const next = [...(data.experience || [])]
      next[index] = { ...next[index], description: enhanced }
      onUpdate({ ...data, experience: next })
    } catch (e) {
      setError(e.message || 'Failed to enhance description')
    } finally {
      setLoading(null)
    }
  }

  const handleSuggestSkills = async () => {
    setError('')
    setLoading('skills')
    try {
      const suggested = await suggestSkills(
        data.experience,
        data.education,
        data.skills || []
      )
      const merged = [...new Set([...(data.skills || []), ...suggested])]
      update('skills', merged)
    } catch (e) {
      setError(e.message || 'Failed to suggest skills')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className={`${glass} space-y-5`}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">✨</span>
        <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
      </div>
      <p className="text-sm text-white/70">
        Generate and polish content using Claude. Add your OpenRouter API key in <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">.env</code> as <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">VITE_OPENROUTER_API_KEY</code>.
      </p>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleGenerateSummary}
          disabled={loading !== null}
          className="w-full rounded-xl border border-white/20 bg-white/10 py-3 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
        >
          {loading === 'summary' ? 'Generating…' : 'Generate professional summary'}
        </button>

        <button
          type="button"
          onClick={handleSuggestSkills}
          disabled={loading !== null}
          className="w-full rounded-xl border border-white/20 bg-white/10 py-3 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
        >
          {loading === 'skills' ? 'Suggesting…' : 'Suggest skills from experience'}
        </button>

        {data.experience?.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-white/60">Enhance job description:</p>
            {data.experience.map((exp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleEnhanceJob(i)}
                disabled={loading !== null}
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-3 pr-2 text-left text-sm text-white transition hover:bg-white/15 disabled:opacity-50"
              >
                <span className="truncate">
                  {exp.title || 'Untitled'} at {exp.company || 'Unknown'}
                </span>
                {loading === `enhance-${i}` && (
                  <span className="ml-2 text-white/60">Enhancing…</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
