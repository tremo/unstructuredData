import { useState } from 'react'
import { ClipboardList, Plus, Check, X, Eye, Clock, AlertTriangle } from 'lucide-react'
import { exceptions as defaultExceptions } from '../data/mockData'
import StatusBadge from '../components/common/StatusBadge'

export default function Exceptions() {
  const [exceptionList, setExceptions] = useState(defaultExceptions)
  const [showModal, setShowModal] = useState(false)
  const [viewEx, setViewEx] = useState(null)
  const [form, setForm] = useState({ fileName: '', requestedBy: '', department: '', reason: '', expiresAt: '' })

  const handleApprove = (id) => {
    setExceptions(exceptionList.map(e => e.id === id ? { ...e, status: 'approved', approvedBy: 'Admin', expiresAt: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0] } : e))
  }

  const handleReject = (id) => {
    setExceptions(exceptionList.filter(e => e.id !== id))
  }

  const handleCreate = () => {
    if (!form.fileName || !form.reason) return
    setExceptions([...exceptionList, {
      id: Date.now(),
      fileId: null,
      fileName: form.fileName,
      requestedBy: form.requestedBy || 'Kullanıcı',
      department: form.department,
      reason: form.reason,
      status: 'pending',
      approvedBy: null,
      expiresAt: form.expiresAt || null,
      createdAt: new Date().toISOString().split('T')[0]
    }])
    setShowModal(false)
    setForm({ fileName: '', requestedBy: '', department: '', reason: '', expiresAt: '' })
  }

  const pendingCount = exceptionList.filter(e => e.status === 'pending').length
  const approvedCount = exceptionList.filter(e => e.status === 'approved').length

  return (
    <div>
      <div className="page-header">
        <h1>İstisna Yönetimi</h1>
        <p>Dosya sahiplerinin politika istisna talepleri</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon yellow"><Clock size={22} /></div>
          <div className="stat-info"><h3>{pendingCount}</h3><p>Bekleyen Talep</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Check size={22} /></div>
          <div className="stat-info"><h3>{approvedCount}</h3><p>Onaylanan İstisna</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><ClipboardList size={22} /></div>
          <div className="stat-info"><h3>{exceptionList.length}</h3><p>Toplam Talep</p></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Yeni İstisna Talebi</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Dosya</th>
                <th>Talep Eden</th>
                <th>Departman</th>
                <th>Sebep</th>
                <th>Durum</th>
                <th>Onaylayan</th>
                <th>Bitiş Tarihi</th>
                <th>Talep Tarihi</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {exceptionList.map(ex => (
                <tr key={ex.id}>
                  <td style={{ fontWeight: 500 }}>{ex.fileName}</td>
                  <td>{ex.requestedBy}</td>
                  <td><span className="tag">{ex.department}</span></td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{ex.reason}</td>
                  <td><StatusBadge status={ex.status} /></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{ex.approvedBy || '-'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{ex.expiresAt || '-'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{ex.createdAt}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon" title="Detay" onClick={() => setViewEx(ex)}><Eye size={14} /></button>
                      {ex.status === 'pending' && (
                        <>
                          <button className="btn-icon" title="Onayla" onClick={() => handleApprove(ex.id)} style={{ color: 'var(--accent-green)' }}><Check size={14} /></button>
                          <button className="btn-icon" title="Reddet" onClick={() => handleReject(ex.id)} style={{ color: 'var(--accent-red)' }}><X size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Yeni İstisna Talebi</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="form-group">
              <label className="form-label">Dosya Adı *</label>
              <input className="form-input" value={form.fileName} onChange={e => setForm({...form, fileName: e.target.value})} placeholder="Dosya adı girin" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Talep Eden</label>
                <input className="form-input" value={form.requestedBy} onChange={e => setForm({...form, requestedBy: e.target.value})} placeholder="Ad Soyad" />
              </div>
              <div className="form-group">
                <label className="form-label">Departman</label>
                <input className="form-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="Departman" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">İstisna Sebebi *</label>
              <textarea className="form-textarea" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Neden istisna talep ediyorsunuz?" />
            </div>
            <div className="form-group">
              <label className="form-label">İstisna Bitiş Tarihi</label>
              <input className="form-input" type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={handleCreate}>Talep Oluştur</button>
            </div>
          </div>
        </div>
      )}

      {viewEx && (
        <div className="modal-overlay" onClick={() => setViewEx(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>İstisna Detayı</h2>
              <button className="btn-icon" onClick={() => setViewEx(null)}>&times;</button>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Dosya</label><div style={{ fontWeight: 500 }}>{viewEx.fileName}</div></div>
              <div className="form-group"><label className="form-label">Durum</label><StatusBadge status={viewEx.status} /></div>
              <div className="form-group"><label className="form-label">Talep Eden</label><div>{viewEx.requestedBy}</div></div>
              <div className="form-group"><label className="form-label">Departman</label><div>{viewEx.department}</div></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Sebep</label><div style={{ color: 'var(--text-secondary)' }}>{viewEx.reason}</div></div>
              <div className="form-group"><label className="form-label">Onaylayan</label><div>{viewEx.approvedBy || 'Bekliyor'}</div></div>
              <div className="form-group"><label className="form-label">Bitiş Tarihi</label><div>{viewEx.expiresAt || 'Belirlenmedi'}</div></div>
              <div className="form-group"><label className="form-label">Talep Tarihi</label><div>{viewEx.createdAt}</div></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewEx(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
