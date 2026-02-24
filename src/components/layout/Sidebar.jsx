import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Shield, GitBranch, FileSearch, Settings,
  ClipboardList, ScrollText, ShieldAlert, BookTemplate
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Gösterge Paneli' },
  { to: '/detected-files', icon: FileSearch, label: 'Tespit Edilen Dosyalar' },
  { to: '/rules', icon: Shield, label: 'Sınıflandırma Kuralları' },
  { to: '/workflows', icon: GitBranch, label: 'İş Akışları' },
  { to: '/workflow-templates', icon: BookTemplate, label: 'Akış Şablonları' },
  { to: '/policies', icon: ShieldAlert, label: 'Politikalar' },
  { to: '/exceptions', icon: ClipboardList, label: 'İstisna Yönetimi' },
  { to: '/audit', icon: ScrollText, label: 'Denetim Kayıtları' },
  { to: '/settings', icon: Settings, label: 'Ayarlar' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <ShieldAlert size={28} color="var(--accent-blue)" />
        <div>
          <h1 className="sidebar-title">Veri Koruma</h1>
          <span className="sidebar-subtitle">Unstructured Data</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-footer-status">
          <span className="status-dot active" />
          <span>Sistem Aktif</span>
        </div>
        <small>v1.0.0</small>
      </div>
      <style>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 260px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          z-index: 100;
          overflow-y: auto;
        }
        .sidebar-header {
          padding: 20px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border-color);
        }
        .sidebar-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .sidebar-subtitle {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .sidebar-nav {
          flex: 1;
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.84rem;
          font-weight: 500;
          transition: all 0.15s;
        }
        .nav-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .nav-item.active {
          background: rgba(59,130,246,0.12);
          color: var(--accent-blue);
        }
        .sidebar-footer {
          padding: 14px 18px;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .sidebar-footer-status {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-muted);
        }
        .status-dot.active {
          background: var(--accent-green);
          box-shadow: 0 0 6px rgba(34,197,94,0.5);
        }
        @media (max-width: 768px) {
          .sidebar { display: none; }
        }
      `}</style>
    </aside>
  )
}
