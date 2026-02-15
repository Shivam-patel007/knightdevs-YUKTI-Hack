import { useState, useEffect } from 'react'
import { generateSummary, enhanceJobDescription, suggestSkills } from '../utils/openRouterAPI'

const STORAGE_KEY = 'resume-builder-openrouter-api-key'

export default function AIAssistant({ data, onUpdate }) {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const envKey = (import.meta.env?.VITE_OPENROUTER_API_KEY || '').trim()
      if (stored) setApiKey(stored)
      else if (!envKey) setShowKey(true)
      // If env key is set, no need to show key input; API will use it
    } catch (_) {}
  }, [])

  const saveKey = (value) => {
    setApiKey(value)
    try {
      if (value.trim()) localStorage.setItem(STORAGE_KEY, value.trim())
      else localStorage.removeItem(STORAGE_KEY)
    } catch (_) {}
  }

  const update = (field, value) => onUpdate({ ...data, [field]: value })
  const envKey = (import.meta.env?.VITE_OPENROUTER_API_KEY || '').trim()
  const keyToUse = apiKey.trim() || envKey || undefined

  const handleGenerateSummary = async () => {
    setError('')
    setLoading('summary')
    try {
      const summary = await generateSummary(data.personal, data.experience, data.education, data.skills, keyToUse)
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
      const enhanced = await enhanceJobDescription(exp.title, exp.company, exp.description || 'No description provided.', keyToUse)
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
      const suggested = await suggestSkills(data.experience, data.education, data.skills || [], keyToUse)
      const merged = [...new Set([...(data.skills || []), ...suggested])]
      update('skills', merged)
    } catch (e) {
      setError(e.message || 'Failed to suggest skills')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="rounded-2xl border border-violet-200/60 bg-violet-100/95 p-4 shadow-lg backdrop-blur-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl" aria-hidden>✨</span>
          <h3 className="text-base font-semibold text-gray-900 sm:text-lg">AI Assistant</h3>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={() => setShowKey((s) => !s)}
          className="text-xs font-medium text-gray-600 hover:text-gray-900 sm:text-sm"
        >
          {showKey ? 'Hide' : 'Set'} OpenRouter API key
        </button>
        {envKey && !apiKey.trim() && (
          <p className="text-[10px] text-green-700 sm:text-xs">Using API key from .env</p>
        )}
        {showKey && (
          <div className="space-y-1.5">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => saveKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full rounded-lg border border-violet-200 bg-white/80 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 outline-none transition focus:border-violet-400 focus:ring-1 focus:ring-violet-300"
              autoComplete="off"
            />
            <p className="text-[10px] text-gray-600 sm:text-xs">
              Stored in this device only. Or set VITE_OPENROUTER_API_KEY in .env.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 sm:text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:gap-3">
        <button
          type="button"
          onClick={handleGenerateSummary}
          disabled={loading !== null}
          className="w-full rounded-xl border border-violet-200 bg-white/90 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-violet-50 disabled:opacity-50 sm:py-3"
        >
          {loading === 'summary' ? 'Generating…' : 'Generate professional summary'}
        </button>
        <button
          type="button"
          onClick={handleSuggestSkills}
          disabled={loading !== null}
          className="w-full rounded-xl border border-violet-200 bg-white/90 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-violet-50 disabled:opacity-50 sm:py-3"
        >
          {loading === 'skills' ? 'Suggesting…' : 'Suggest skills from experience'}
        </button>
        {data.experience?.length > 0 && (
          <div className="space-y-1.5 pt-1 sm:space-y-2 sm:pt-2">
            <p className="text-[10px] font-medium text-gray-700 sm:text-xs">Enhance job description:</p>
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {data.experience.map((exp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleEnhanceJob(i)}
                  disabled={loading !== null}
                  className="w-full rounded-lg border border-violet-100 bg-white/70 py-2 pl-2.5 pr-2 text-left text-xs font-medium text-gray-900 transition hover:bg-violet-50 disabled:opacity-50 sm:rounded-xl sm:py-2.5 sm:pl-3 sm:text-sm"
                >
                  <span className="truncate">
                    {exp.title || 'Untitled'} at {exp.company || 'Unknown'}
                  </span>
                  {loading === `enhance-${i}` && <span className="ml-1.5 text-gray-600 sm:ml-2">Enhancing…</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
