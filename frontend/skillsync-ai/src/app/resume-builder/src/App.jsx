import { useState } from 'react'
import ResumeForm from './components/ResumeForm'
import ResumePreview from './components/ResumePreview'
import AIAssistant from './components/AIAssistant'

const initialData = {
  personal: {
    name: '',
    email: '',
    phone: '',
    location: '',
    targetRole: '',
    linkedin: '',
    github: '',
  },
  experience: [],
  projects: [],
  education: [],
  skills: [],
  summary: '',
}

export default function App() {
  const [data, setData] = useState(initialData)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
      {/* Ambient orbs for liquid glass feel */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-500/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:py-12">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg md:text-5xl">
            AI Resume Builder
          </h1>
          <p className="mt-2 text-white/70">
            Create a professional resume with AI-powered suggestions
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <ResumeForm data={data} onChange={setData} />
            <div className="block lg:hidden">
              <AIAssistant data={data} onUpdate={setData} />
            </div>
          </div>
          <aside className="flex min-h-0 flex-col gap-6 lg:sticky lg:top-8 lg:max-h-[calc(100vh-6rem)] lg:self-start">
            <div className="flex min-h-[380px] flex-1 flex-col rounded-3xl border border-white/20 bg-white/5 p-5 shadow-2xl backdrop-blur-2xl md:min-h-[480px]">
              <ResumePreview data={data} />
            </div>
            <div className="hidden lg:block">
              <AIAssistant data={data} onUpdate={setData} />
            </div>
          </aside>
        </div>

        <footer className="mt-12 text-center text-sm text-white/50">
          Powered by OpenRouter · Claude 3.5 Sonnet
        </footer>
      </div>
    </div>
  )
}
