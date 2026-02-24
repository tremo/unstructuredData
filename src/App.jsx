import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import DetectedFiles from './pages/DetectedFiles'
import Rules from './pages/Rules'
import WorkflowBuilder from './pages/WorkflowBuilder'
import WorkflowTemplates from './pages/WorkflowTemplates'
import Policies from './pages/Policies'
import Exceptions from './pages/Exceptions'
import AuditLog from './pages/AuditLog'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/detected-files" element={<DetectedFiles />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/workflows" element={<WorkflowBuilder />} />
          <Route path="/workflow-templates" element={<WorkflowTemplates />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/exceptions" element={<Exceptions />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}
