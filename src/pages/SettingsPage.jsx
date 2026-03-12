import { useState, useEffect } from 'react'
import { Settings, Plus, Trash2, Save, FolderOpen, Mail, Clock, Shield, Server, Bell } from 'lucide-react'
import { scanLocationsApi, settingsApi } from '../services/api'
import StatusBadge from '../components/common/StatusBadge'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('scan')
  const [locations, setLocations] = useState([])
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [newLoc, setNewLoc] = useState({ name: '', type: 'SMB' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.kurum.com.tr', smtpPort: '587',
    fromAddress: 'veri-koruma@kurum.com.tr', fromName: 'Veri Koruma Sistemi', useTLS: true,
  })

  const [scheduleSettings, setScheduleSettings] = useState({
    scanFrequency: 'daily', scanTime: '02:00',
    retentionDays: 90, maxFileSize: 100, concurrentScans: 4,
  })

  const [notifSettings, setNotifSettings] = useState({
    enableEmail: true, enableSlack: false, enableTeams: true,
    digestFrequency: 'daily', escalateAfterDays: 7, ccManager: true, ccDPO: true,
  })

  useEffect(() => {
    Promise.all([
      scanLocationsApi.getAll(),
      settingsApi.getAll(),
    ]).then(([locs, settings]) => {
      setLocations(locs)
      if (settings.email) setEmailSettings(settings.email)
      if (settings.schedule) setScheduleSettings(settings.schedule)
      if (settings.notifications) setNotifSettings(settings.notifications)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const addLocation = async () => {
    if (!newLoc.name) return
    try {
      const created = await scanLocationsApi.create(newLoc)
      setLocations([...locations, created])
      setShowAddLocation(false)
      setNewLoc({ name: '', type: 'SMB' })
    } catch (err) {
      console.error('Konum ekleme hatası:', err)
    }
  }

  const removeLocation = async (id) => {
    try {
      await scanLocationsApi.delete(id)
      setLocations(locations.filter(l => l.id !== id))
    } catch (err) {
      console.error('Konum silme hatası:', err)
    }
  }

  const toggleLocationStatus = async (id) => {
    const loc = locations.find(l => l.id === id)
    try {
      const updated = await scanLocationsApi.update(id, { status: loc.status === 'active' ? 'paused' : 'active' })
      setLocations(locations.map(l => l.id === id ? updated : l))
    } catch (err) {
      console.error('Konum güncelleme hatası:', err)
    }
  }

  const saveSettings = async (key, value) => {
    setSaving(true)
    try {
      await settingsApi.set(key, value)
    } catch (err) {
      console.error('Ayar kaydetme hatası:', err)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'scan', label: 'Tarama Noktaları', icon: FolderOpen },
    { id: 'email', label: 'E-posta', icon: Mail },
    { id: 'schedule', label: 'Zamanlama', icon: Clock },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
  ]

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>Ayarlar</h1><p>Yükleniyor...</p></div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Ayarlar</h1>
        <p>Sistem yapılandırması ve tarama ayarları</p>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><tab.icon size={14} /> {tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'scan' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tarama Noktaları</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddLocation(true)}><Plus size={13} /> Ekle</button>
          </div>

          {showAddLocation && (
            <div style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Yol / Adres</label>
                  <input className="form-input" value={newLoc.name} onChange={e => setNewLoc({...newLoc, name: e.target.value})} placeholder="\\\\fileserver\\paylaşım veya SharePoint URL" />
                </div>
                <div>
                  <label className="form-label">Tür</label>
                  <select className="form-select" value={newLoc.type} onChange={e => setNewLoc({...newLoc, type: e.target.value})}>
                    <option value="SMB">SMB</option>
                    <option value="NFS">NFS</option>
                    <option value="SharePoint">SharePoint</option>
                    <option value="OneDrive">OneDrive</option>
                    <option value="S3">S3</option>
                  </select>
                </div>
                <button className="btn btn-primary btn-sm" onClick={addLocation}>Ekle</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddLocation(false)}>İptal</button>
              </div>
            </div>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr><th>Konum</th><th>Tür</th><th>Durum</th><th>Son Tarama</th><th>İşlem</th></tr>
              </thead>
              <tbody>
                {locations.map(loc => (
                  <tr key={loc.id}>
                    <td style={{ fontWeight: 500 }}>{loc.name}</td>
                    <td><span className="tag">{loc.type}</span></td>
                    <td>
                      <button className="btn-icon" onClick={() => toggleLocationStatus(loc.id)} style={{ border: 'none' }}>
                        <StatusBadge status={loc.status} />
                      </button>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{loc.lastScan}</td>
                    <td><button className="btn-icon" onClick={() => removeLocation(loc.id)} style={{ color: 'var(--accent-red)' }}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'email' && (
        <div className="card">
          <div className="card-header"><span className="card-title">E-posta Ayarları (SMTP)</span></div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">SMTP Sunucusu</label>
              <input className="form-input" value={emailSettings.smtpServer} onChange={e => setEmailSettings({...emailSettings, smtpServer: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Port</label>
              <input className="form-input" value={emailSettings.smtpPort} onChange={e => setEmailSettings({...emailSettings, smtpPort: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Gönderen Adres</label>
              <input className="form-input" value={emailSettings.fromAddress} onChange={e => setEmailSettings({...emailSettings, fromAddress: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Gönderen Ad</label>
              <input className="form-input" value={emailSettings.fromName} onChange={e => setEmailSettings({...emailSettings, fromName: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <label className="toggle-switch">
              <input type="checkbox" checked={emailSettings.useTLS} onChange={e => setEmailSettings({...emailSettings, useTLS: e.target.checked})} />
              <span className="toggle-slider" />
            </label>
            <span style={{ fontSize: '0.85rem' }}>TLS Şifreleme Kullan</span>
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" disabled={saving} onClick={() => saveSettings('email', emailSettings)}>
              <Save size={15} /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Zamanlama Ayarları</span></div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Tarama Sıklığı</label>
              <select className="form-select" value={scheduleSettings.scanFrequency} onChange={e => setScheduleSettings({...scheduleSettings, scanFrequency: e.target.value})}>
                <option value="hourly">Saatlik</option>
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tarama Saati</label>
              <input className="form-input" type="time" value={scheduleSettings.scanTime} onChange={e => setScheduleSettings({...scheduleSettings, scanTime: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Log Saklama Süresi (gün)</label>
              <input className="form-input" type="number" value={scheduleSettings.retentionDays} onChange={e => setScheduleSettings({...scheduleSettings, retentionDays: parseInt(e.target.value)})} />
            </div>
            <div className="form-group">
              <label className="form-label">Max. Dosya Boyutu (MB)</label>
              <input className="form-input" type="number" value={scheduleSettings.maxFileSize} onChange={e => setScheduleSettings({...scheduleSettings, maxFileSize: parseInt(e.target.value)})} />
            </div>
            <div className="form-group">
              <label className="form-label">Paralel Tarama Sayısı</label>
              <input className="form-input" type="number" min="1" max="16" value={scheduleSettings.concurrentScans} onChange={e => setScheduleSettings({...scheduleSettings, concurrentScans: parseInt(e.target.value)})} />
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" disabled={saving} onClick={() => saveSettings('schedule', scheduleSettings)}>
              <Save size={15} /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Bildirim Ayarları</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'enableEmail', label: 'E-posta Bildirimleri' },
              { key: 'enableTeams', label: 'Microsoft Teams Bildirimleri' },
              { key: 'enableSlack', label: 'Slack Bildirimleri' },
              { key: 'ccManager', label: 'Yöneticiyi CC\'ye Ekle' },
              { key: 'ccDPO', label: 'DPO\'yu CC\'ye Ekle (Kritik Veriler)' },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem' }}>{item.label}</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifSettings[item.key]} onChange={e => setNotifSettings({...notifSettings, [item.key]: e.target.checked})} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
          <div className="grid-2" style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Özet Rapor Sıklığı</label>
              <select className="form-select" value={notifSettings.digestFrequency} onChange={e => setNotifSettings({...notifSettings, digestFrequency: e.target.value})}>
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Eskalasyon Süresi (gün)</label>
              <input className="form-input" type="number" value={notifSettings.escalateAfterDays} onChange={e => setNotifSettings({...notifSettings, escalateAfterDays: parseInt(e.target.value)})} />
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" disabled={saving} onClick={() => saveSettings('notifications', notifSettings)}>
              <Save size={15} /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
