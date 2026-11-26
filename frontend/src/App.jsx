import { useState } from 'react'
import DashboardHeader from './components/DashboardHeader.jsx'
import Sidebar from './components/Sidebar.jsx'
import HomePage from './pages/HomePage.jsx'

function App() {
  const [activeSection, setActiveSection] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="main-panel">
        <DashboardHeader
          activeSection={activeSection}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />
        <HomePage activeSection={activeSection} />
      </div>
    </div>
  )
}

export default App
