import { useState, useEffect, useRef, useCallback } from 'react'
import {
  FileSearch, AlertTriangle, ShieldCheck, Lock, Clock,
  TrendingUp, FolderOpen, Mail, ArrowRight, Play, Pause, Square, Loader
} from 'lucide-react'
import { filesApi, auditApi, policiesApi, scanLocationsApi, scanApi } from '../services/api'
import StatusBadge from '../components/common/StatusBadge'
import ClassificationBadge from '../components/common/ClassificationBadge'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, critical: 0, pending: 0, encrypted: 0, resolved: 0, activeLocations: 0 })
  const [files, setFiles] = useState([])
  const [logs, setLogs] = useState([])
  const [policies, setPolicies] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [scanStatus, setScanStatus] = useState({ running: false, paused: false, progress: {} })
  const eventSourceRef = useRef(null)

  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) eventSourceRef.current.close()
    const es = new EventSource(scanApi.progressUrl)
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.event === 'status' || msg.event === 'progress') {
          setScanStatus(msg.data)
        } else if (msg.event === 'completed' || msg.event === 'cancelled' || msg.event === 'error') {
          setScanStatus({ running: false, paused: false, progress: msg.data })
          // Tarama bitince verileri yenile
          Promise.all([filesApi.getStats(), filesApi.getAll(), auditApi.getAll()])
            .then(([s, f, l]) => { setStats(s); setFiles(f); setLogs(l) })
        }
      } catch { /* ignore */ }
    }
    es.onerror = () => { es.close(); eventSourceRef.current = null }
    eventSourceRef.current = es
  }, [])

  useEffect(() => {
    Promise.all([
      filesApi.getStats(),
      filesApi.getAll(),
      auditApi.getAll(),
      policiesApi.getAll(),
      scanLocationsApi.getAll(),
      scanApi.status(),
    ]).then(([statsData, filesData, logsData, policiesData, locationsData, scanData]) => {
      setStats(statsData)
      setFiles(filesData)
      setLogs(logsData)
      setPolicies(policiesData)
      setLocations(locationsData)
      setScanStatus(scanData)
      if (scanData.running) connectSSE()
    }).catch(err => console.error('Dashboard yükleme hatası:', err))
      .finally(() => setLoading(false))
    return () => { if (eventSourceRef.current) eventSourceRef.current.close() }
  }, [connectSSE])

  const handleStartScan = async () => {
    try {
      await scanApi.start()
      connectSSE()
    } catch (err) {
      console.error('Tarama başlatma hatası:', err)
    }
  }

  const handlePauseScan = async () => {
    try { await scanApi.pause() } catch (err) { console.error(err) }
  }

  const handleResumeScan = async () => {
    try { await scanApi.resume() } catch (err) { console.error(err) }
  }

  const handleCancelScan = async () => {
    try { await scanApi.cancel() } catch (err) { console.error(err) }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Gösterge Paneli</h1>
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const totalLocations = locations.length

  return (
    <div>
      <div className="page-header">
        <h1>Gösterge Paneli</h1>
        <p>Yapılandırılmamış veri yönetimi genel bakış</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon red"><AlertTriangle size={22} /></div>
          <div className="stat-info">
            <h3>{stats.critical}</h3>
            <p>Kritik Bulgu</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Clock size={22} /></div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Bekleyen İşlem</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Lock size={22} /></div>
          <div className="stat-info">
            <h3>{stats.encrypted}</h3>
            <p>Şifrelenen Dosya</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><ShieldCheck size={22} /></div>
          <div className="stat-info">
            <h3>{stats.resolved}</h3>
            <p>Çözülen Dosya</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><FileSearch size={22} /></div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Toplam Tespit</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><FolderOpen size={22} /></div>
          <div className="stat-info">
            <h3>{stats.activeLocations}/{totalLocations}</h3>
            <p>Aktif Tarama Noktası</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">Tarama Kontrolü</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {!scanStatus.running ? (
              <button className="btn btn-primary btn-sm" onClick={handleStartScan}>
                <Play size={13} /> Taramayı Başlat
              </button>
            ) : (
              <>
                {scanStatus.paused ? (
                  <button className="btn btn-primary btn-sm" onClick={handleResumeScan}>
                    <Play size={13} /> Devam Et
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={handlePauseScan}>
                    <Pause size={13} /> Durakla
                  </button>
                )}
                <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }} onClick={handleCancelScan}>
                  <Square size={13} /> İptal
                </button>
              </>
            )}
          </div>
        </div>
        {scanStatus.running && scanStatus.progress && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {scanStatus.paused ? <Pause size={14} color="#f59e0b" /> : <Loader size={14} className="spin" />}
                {scanStatus.paused ? 'Duraklatıldı' : 'Taranıyor...'}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {scanStatus.progress.scannedFiles || 0} / {scanStatus.progress.totalFiles || 0} dosya
              </span>
            </div>
            <div style={{ background: 'var(--bg-primary)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, transition: 'width 0.3s',
                background: scanStatus.paused ? '#f59e0b' : 'var(--accent-blue)',
                width: `${scanStatus.progress.totalFiles ? Math.round((scanStatus.progress.scannedFiles / scanStatus.progress.totalFiles) * 100) : 0}%`,
              }} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Tespit: {scanStatus.progress.detectedFiles || 0}</span>
              <span>Atlanan: {scanStatus.progress.skippedFiles || 0}</span>
              <span>Hata: {scanStatus.progress.errors?.length || 0}</span>
            </div>
            {scanStatus.progress.currentFile && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {scanStatus.progress.currentFile}
              </div>
            )}
          </div>
        )}
        {!scanStatus.running && scanStatus.progress?.scannedFiles > 0 && (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Son tarama: {scanStatus.progress.scannedFiles} dosya tarandı, {scanStatus.progress.detectedFiles} bulgu tespit edildi
          </div>
        )}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Son Tespitler</span>
            <a href="#/detected-files" style={{ color: 'var(--accent-blue)', fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Tümünü Gör <ArrowRight size={14} />
            </a>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Dosya</th>
                  <th>Sınıf</th>
                  <th>Durum</th>
                  <th>Sahip</th>
                </tr>
              </thead>
              <tbody>
                {files.slice(0, 5).map(file => (
                  <tr key={file.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{file.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{file.path}</div>
                    </td>
                    <td><ClassificationBadge classification={file.classification} /></td>
                    <td><StatusBadge status={file.status} /></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{file.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Son Aktiviteler</span>
            <a href="#/audit" style={{ color: 'var(--accent-blue)', fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Tümünü Gör <ArrowRight size={14} />
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {logs.slice(0, 6).map(log => (
              <div key={log.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: log.action.includes('encrypt') || log.action.includes('notification') ? 'rgba(239,68,68,0.12)' :
                    log.action.includes('resolved') || log.action.includes('approved') ? 'rgba(34,197,94,0.12)' :
                    log.action.includes('scan') ? 'rgba(59,130,246,0.12)' : 'rgba(148,163,184,0.12)',
                  color: log.action.includes('encrypt') || log.action.includes('notification') ? '#ef4444' :
                    log.action.includes('resolved') || log.action.includes('approved') ? '#22c55e' :
                    log.action.includes('scan') ? '#3b82f6' : '#94a3b8',
                }}>
                  {log.action.includes('notification') ? <Mail size={15} /> :
                   log.action.includes('encrypt') ? <Lock size={15} /> :
                   log.action.includes('scan') ? <FileSearch size={15} /> :
                   log.action.includes('resolved') ? <ShieldCheck size={15} /> :
                   <Clock size={15} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{log.details}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {log.timestamp} · {log.user}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Aktif Politikalar</span>
          </div>
          {policies.filter(p => p.status === 'active').map(policy => (
            <div key={policy.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{policy.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{policy.steps.length} adım · {policy.triggeredCount} tetiklenme</div>
              </div>
              <ClassificationBadge classification={policy.classification} />
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Tarama Noktaları</span>
          </div>
          {locations.map(loc => (
            <div key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{loc.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Son tarama: {loc.lastScan}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="tag">{loc.type}</span>
                <StatusBadge status={loc.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
