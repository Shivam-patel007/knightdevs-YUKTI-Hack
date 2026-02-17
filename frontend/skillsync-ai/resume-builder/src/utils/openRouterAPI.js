const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'anthropic/claude-3.5-sonnet'
const STORAGE_KEY = 'resume-builder-openrouter-api-key'

function getStoredApiKey() {
  try {
    return (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || ''
  } catch {
    return ''
  }
}

/** Resolve API key: passed key > localStorage > env */
export function resolveApiKey(apiKey) {
  const passed = (apiKey || '').trim()
  const stored = getStoredApiKey().trim()
  const env = (import.meta.env?.VITE_OPENROUTER_API_KEY || '').trim()
  const key = passed || stored || env
  if (!key) throw new Error('API key required. Open the AI Assistant, click "Set OpenRouter API key", and paste your key from openrouter.ai/keys')
  return key
}

export async function callOpenRouter(prompt, userContent = '', apiKey = null) {
  const key = resolveApiKey(apiKey)

  let response
  try {
    response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': window.location.origin || 'https://localhost:5173',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userContent || 'Proceed.' },
      ],
      max_tokens: 900,
      temperature: 0.7,
    }),
  })
  } catch (err) {
    const msg = err?.message || ''
    if (msg.includes('fetch') || msg.includes('NetworkError') || msg.includes('Failed to fetch') || msg.includes('connection') || err?.name === 'TypeError') {
      throw new Error('Connection failed. Check your internet connection and try again. If the problem continues, openrouter.ai may be temporarily unavailable.')
    }
    throw err
  }

  if (!response.ok) {
    const errText = await response.text()
    if (response.status === 401) throw new Error('Invalid or expired API key. Get a new key at openrouter.ai/keys and paste it in the AI Assistant.')
    if (response.status === 403) throw new Error('Access denied. Check your OpenRouter API key and account.')
    try {
      const errJson = JSON.parse(errText)
      const msg = errJson?.error?.message || errJson?.message || errText
      throw new Error(msg || `API error: ${response.status}`)
    } catch (e) {
      if (e.message && e.message !== errText) throw e
      throw new Error(errText || `OpenRouter API error: ${response.status}`)
    }
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('No content in OpenRouter response')
  return content.trim()
}

export async function generateSummary(personal, experience = [], education = [], skills = [], apiKey = null) {
  const context = [
    `Name: ${personal?.name || 'N/A'}`,
    `Target role/industry: ${personal?.targetRole || 'General'}`,
    `Experience: ${experience?.map((e) => `${e.title} at ${e.company}`).join('; ') || 'None'}`,
    `Education: ${education?.map((e) => `${e.degree} - ${e.school}`).join('; ') || 'None'}`,
    `Skills: ${skills?.join(', ') || 'None'}`,
  ].join('\n')
  const prompt = `You are a professional resume writer. Write a concise, impactful professional summary (3-5 sentences) for a resume. Use third person or no pronoun. Be specific and achievement-oriented. Output only the summary text, no headings or labels.`
  return callOpenRouter(prompt, context, apiKey)
}

export async function enhanceJobDescription(role, company, rawDescription, apiKey = null) {
  const prompt = `You are a resume expert. Rewrite this job/role description into 3-5 bullet points suitable for a resume. Use strong action verbs and quantify where possible. Keep each bullet to one line. Output only the bullet points, one per line, no numbering.`
  const userContent = `Role: ${role}\nCompany: ${company}\n\nOriginal description:\n${rawDescription}`
  return callOpenRouter(prompt, userContent, apiKey)
}

export async function suggestSkills(experience = [], education = [], existingSkills = [], apiKey = null) {
  const context = [
    `Work experience: ${experience?.map((e) => `${e.title} at ${e.company}: ${e.description || ''}`).join('\n') || 'None'}`,
    `Education: ${education?.map((e) => `${e.degree} - ${e.school} (${e.field || ''})`).join('; ') || 'None'}`,
    `Existing skills: ${existingSkills?.join(', ') || 'None'}`,
  ].join('\n')
  const prompt = `You are a career advisor. Suggest 8-12 relevant professional skills (technical and soft) for this profile. Output only a comma-separated list of skills, no numbering or bullets.`
  const result = await callOpenRouter(prompt, context, apiKey)
  return result.split(',').map((s) => s.trim()).filter(Boolean)
}
