import { Link } from 'react-router-dom'
import ResumeForm from '../components/ResumeForm'
import ResumePreview from '../components/ResumePreview'

export default function ResumePage({ data, onChange }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-500/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:py-12">
        <header className="mb-8 flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:justify-between sm:gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg md:text-5xl">
              AI Resume Builder
            </h1>
            <p className="mt-2 text-white/70">
              Create a professional resume with AI-powered suggestions
            </p>
          </div>
          <Link
            to="/resume-ai"
            className="shrink-0 rounded-xl border border-white/25 bg-white/15 px-5 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-xl transition hover:bg-white/25 hover:shadow-xl"
          >
            Open AI Assistant
          </Link>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <ResumeForm data={data} onChange={onChange} />
          </div>
          <aside className="flex min-h-0 flex-col gap-6 lg:sticky lg:top-8 lg:max-h-[calc(100vh-6rem)] lg:self-start">
            <div className="flex min-h-[380px] flex-1 flex-col rounded-3xl border border-white/20 bg-white/[0.06] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-3xl md:min-h-[480px]" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)' }}>
              <ResumePreview data={data} />
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
