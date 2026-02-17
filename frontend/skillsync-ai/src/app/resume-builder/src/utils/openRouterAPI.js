const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'anthropic/claude-3.5-sonnet'

/**
 * Call OpenRouter API for AI content generation
 * @param {string} prompt - The user/system prompt
 * @param {string} [userContent] - Optional additional user content
 * @returns {Promise<string>} - Generated text
 */
export async function callOpenRouter(prompt, userContent = '') {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('VITE_OPENROUTER_API_KEY is not set. Add it to .env')
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin || 'https://localhost:5173',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userContent || 'Proceed.' },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(err || `OpenRouter API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('No content in OpenRouter response')
  return content.trim()
}

/**
 * Generate a professional resume summary from user details
 */
export async function generateSummary(personal, experience = [], education = [], skills = []) {
  const context = [
    `Name: ${personal?.name || 'N/A'}`,
    `Target role/industry: ${personal?.targetRole || 'General'}`,
    `Experience: ${experience?.map((e) => `${e.title} at ${e.company}`).join('; ') || 'None'}`,
    `Education: ${education?.map((e) => `${e.degree} - ${e.school}`).join('; ') || 'None'}`,
    `Skills: ${skills?.join(', ') || 'None'}`,
  ].join('\n')

  const prompt = `You are a professional resume writer. Write a concise, impactful professional summary (3-5 sentences) for a resume. Use third person or no pronoun. Be specific and achievement-oriented. Output only the summary text, no headings or labels.`
  return callOpenRouter(prompt, context)
}

/**
 * Enhance a job description to be more professional and achievement-focused
 */
export async function enhanceJobDescription(role, company, rawDescription) {
  const prompt = `You are a resume expert. Rewrite this job/role description into 3-5 bullet points suitable for a resume. Use strong action verbs and quantify where possible. Keep each bullet to one line. Output only the bullet points, one per line, no numbering.`
  const userContent = `Role: ${role}\nCompany: ${company}\n\nOriginal description:\n${rawDescription}`
  return callOpenRouter(prompt, userContent)
}

/**
 * Suggest skills based on work experience and education
 */
export async function suggestSkills(experience = [], education = [], existingSkills = []) {
  const context = [
    `Work experience: ${experience?.map((e) => `${e.title} at ${e.company}: ${e.description || ''}`).join('\n') || 'None'}`,
    `Education: ${education?.map((e) => `${e.degree} - ${e.school} (${e.field || ''})`).join('; ') || 'None'}`,
    `Existing skills: ${existingSkills?.join(', ') || 'None'}`,
  ].join('\n')

  const prompt = `You are a career advisor. Suggest 8-12 relevant professional skills (technical and soft) for this profile. Output only a comma-separated list of skills, no numbering or bullets.`
  const result = await callOpenRouter(prompt, context)
  return result.split(',').map((s) => s.trim()).filter(Boolean)
}
