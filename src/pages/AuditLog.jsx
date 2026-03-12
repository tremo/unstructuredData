import { useState, useEffect } from 'react'
import { ScrollText, Search, Download, Filter, FileSearch, Mail, Lock, ShieldCheck, Clock, Settings, AlertTriangle } from 'lucide-react'
import { auditApi } from '../services/api'

const actionLabels = {
  scan_complete: { label: 'Tarama Tamamlandı', color: '#3b82f6', icon: FileSearch },
  scan_started: { label: 'Tarama Başlatıldı', color: '#3b82f6', icon: FileSearch },
  notification_sent: { label: 'Bildirim Gönderildi', color: '#f97316', icon: Mail },
  file_encrypted: { label: 'Dosya Şifrelendi', color: '#ef4444', icon: Lock },
  file_resolved: { label: 'Dosya Çözüldü', color: '#22c55e', icon: ShieldCheck },
  exception_requested: { label: 'İstisna Talep Edildi', color: '#eab308', icon: AlertTriangle },
  exception_approved: { label: 'İstisna Onaylandı', color: '#22c55e', icon: ShieldCheck },
  policy_created: { label: 'Politika Oluşturuldu', color: '#a855f7', icon: Settings },
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState('all')

  useEffect(() => {
    auditApi.getAll().then(setLogs).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter(log => {
    const matchSearch = log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase())
    const matchAction = filterAction === 'all' || log.action === filterAction
    return matchSearch && matchAction
  })

  return (
    <div>
      <div className="page-header">
        <h1>Denetim Kayıtları</h1>
        <p>Tüm sistem aktivitelerinin detaylı kaydı</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Detay, hedef veya kullanıcı ara..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
          <select className="form-select" style={{ width: 'auto', minWidth: 180 }} value={filterAction} onChange={e => setFilterAction(e.target.value)}>
            <option value="all">Tüm Aksiyonlar</option>
            {Object.entries(actionLabels).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
          </select>
          <button className="btn btn-secondary"><Download size={15} /> Dışa Aktar</button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Zaman</th>
                <th>Aksiyon</th>
                <th>Hedef</th>
                <th>Detay</th>
                <th>Kullanıcı</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Yükleniyor...</td></tr>
              ) : filtered.map(log => {
                const actionInfo = actionLabels[log.action] || { label: log.action, color: '#94a3b8', icon: Clock }
                const Icon = actionInfo.icon
                return (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{log.timestamp}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `${actionInfo.color}18`, color: actionInfo.color
                        }}>
                          <Icon size={14} />
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{actionInfo.label}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 500 }}>{log.target}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{log.details}</td>
                    <td><span className="tag">{log.user}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
