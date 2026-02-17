import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import ResumePage from './pages/ResumePage'
import AIAssistantPage from './pages/AIAssistantPage'

const initialData = {
  personal: {
    name: '',
    email: '',
    phone: '',
    location: '',
    targetRole: '',
  },
  experience: [],
  education: [],
  skills: [],
  summary: '',
}

export default function App() {
  const [data, setData] = useState(initialData)

  return (
    <Routes>
      <Route path="/" element={<ResumePage data={data} onChange={setData} />} />
      <Route path="/index.html" element={<ResumePage data={data} onChange={setData} />} />
      <Route path="/resume-ai" element={<AIAssistantPage data={data} onUpdate={setData} />} />
    </Routes>
  )
}
