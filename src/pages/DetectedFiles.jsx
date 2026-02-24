import { useState } from 'react'
import { FileSearch, Filter, Download, Eye, Trash2, ShieldAlert, Search } from 'lucide-react'
import { detectedFiles, dataClassifications } from '../data/mockData'
import StatusBadge from '../components/common/StatusBadge'
import ClassificationBadge from '../components/common/ClassificationBadge'

export default function DetectedFiles() {
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedFile, setSelectedFile] = useState(null)

  const filtered = detectedFiles.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.path.toLowerCase().includes(search.toLowerCase()) ||
      f.owner.toLowerCase().includes(search.toLowerCase())
    const matchClass = filterClass === 'all' || f.classification === filterClass
    const matchStatus = filterStatus === 'all' || f.status === filterStatus
    return matchSearch && matchClass && matchStatus
  })

  return (
    <div>
      <div className="page-header">
        <h1>Tespit Edilen Dosyalar</h1>
        <p>Kurum paylaşımlarında tespit edilen hassas veriler</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              placeholder="Dosya adı, yol veya sahip ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>
          <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="all">Tüm Sınıflar</option>
            {dataClassifications.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Bekliyor</option>
            <option value="notified">Bildirildi</option>
            <option value="resolved">Çözüldü</option>
            <option value="encrypted">Şifrelendi</option>
            <option value="exception">İstisna</option>
          </select>
          <button className="btn btn-secondary"><Download size={15} /> Dışa Aktar</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">{filtered.length} dosya bulundu</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Dosya Adı</th>
                <th>Konum</th>
                <th>Sınıf</th>
                <th>Tespit Edilen Veri</th>
                <th>Sahip</th>
                <th>Boyut</th>
                <th>Bildirim</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(file => (
                <tr key={file.id}>
                  <td style={{ fontWeight: 500 }}>{file.name}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.path}</td>
                  <td><ClassificationBadge classification={file.classification} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {file.detectedData.map(d => <span key={d} className="tag">{d}</span>)}
                    </div>
                  </td>
                  <td>{file.owner}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{file.size}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24, borderRadius: '50%',
                      background: file.notificationCount > 0 ? 'rgba(59,130,246,0.15)' : 'var(--bg-tertiary)',
                      color: file.notificationCount > 0 ? 'var(--accent-blue)' : 'var(--text-muted)',
                      fontSize: '0.75rem', fontWeight: 600
                    }}>
                      {file.notificationCount}
                    </span>
                  </td>
                  <td><StatusBadge status={file.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon" title="Detay" onClick={() => setSelectedFile(file)}><Eye size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedFile && (
        <div className="modal-overlay" onClick={() => setSelectedFile(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <div className="modal-header">
              <h2>Dosya Detayı</h2>
              <button className="btn-icon" onClick={() => setSelectedFile(null)}>&times;</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Dosya Adı</label>
                <div style={{ fontWeight: 500 }}>{selectedFile.name}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Boyut</label>
                <div>{selectedFile.size}</div>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Konum</label>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{selectedFile.path}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Sınıflandırma</label>
                <ClassificationBadge classification={selectedFile.classification} />
              </div>
              <div className="form-group">
                <label className="form-label">Durum</label>
                <StatusBadge status={selectedFile.status} />
              </div>
              <div className="form-group">
                <label className="form-label">Dosya Sahibi</label>
                <div>{selectedFile.owner}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Son Değişiklik</label>
                <div>{selectedFile.lastModified}</div>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Tespit Edilen Veri Türleri</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selectedFile.detectedData.map(d => <span key={d} className="tag">{d}</span>)}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Gönderilen Bildirim</label>
                <div>{selectedFile.notificationCount} adet</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedFile(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
