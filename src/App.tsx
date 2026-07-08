import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import TestAuth from './pages/TestAuth'
import NotFound from './pages/NotFound'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'
import IcpBuilder from './pages/IcpBuilder'
import Outreach from './pages/Outreach'
import Sources from './pages/Sources'
import Settings from './pages/Settings'
import AppLayout from './components/AppLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/test-auth" element={<TestAuth />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/leads/:id" element={<LeadDetail />} />
        <Route path="/icp" element={<IcpBuilder />} />
        <Route path="/outreach" element={<Outreach />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
