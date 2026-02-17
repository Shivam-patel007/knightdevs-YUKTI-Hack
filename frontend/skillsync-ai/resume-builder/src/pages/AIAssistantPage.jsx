import { Link } from 'react-router-dom'
import AIAssistant from '../components/AIAssistant'

export default function AIAssistantPage({ data, onUpdate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-500/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-8 md:py-12">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/20"
          >
            ← Back to Resume
          </Link>
          <h1 className="text-xl font-semibold text-white md:text-2xl">
            AI Assistant
          </h1>
        </header>

        <main className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
          <AIAssistant data={data} onUpdate={onUpdate} />
        </main>

        <p className="mt-6 text-center text-sm text-white/50">
          Generate summaries, enhance job descriptions, and suggest skills using Claude.
        </p>
      </div>
    </div>
  )
}
