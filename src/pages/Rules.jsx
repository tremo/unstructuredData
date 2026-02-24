import { useState } from 'react'
import { Shield, Plus, Edit2, Trash2, Search, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { dataClassifications, fileTypes } from '../data/mockData'

const defaultRules = [
  { id: 1, name: 'TCKN Tespiti', pattern: '\\b[1-9]\\d{10}\\b', dataType: 'TCKN', classification: 'critical', fileTypes: ['XLSX', 'DOCX', 'PDF', 'CSV', 'TXT'], enabled: true, description: 'TC Kimlik Numarası deseni' },
  { id: 2, name: 'IBAN Tespiti', pattern: 'TR\\d{2}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{2}', dataType: 'IBAN', classification: 'critical', fileTypes: ['XLSX', 'DOCX', 'PDF', 'CSV'], enabled: true, description: 'Türk IBAN formatı' },
  { id: 3, name: 'E-posta Adresi', pattern: '[\\w.-]+@[\\w.-]+\\.\\w{2,}', dataType: 'E-posta', classification: 'high', fileTypes: ['XLSX', 'DOCX', 'TXT', 'CSV', 'MSG'], enabled: true, description: 'E-posta adresi deseni' },
  { id: 4, name: 'Telefon Numarası', pattern: '(\\+90|0)\\s?[5]\\d{2}\\s?\\d{3}\\s?\\d{2}\\s?\\d{2}', dataType: 'Telefon', classification: 'high', fileTypes: ['XLSX', 'DOCX', 'PDF', 'CSV', 'TXT'], enabled: true, description: 'Türk cep telefonu formatı' },
  { id: 5, name: 'Kredi Kartı', pattern: '\\b(?:\\d[ -]*?){13,16}\\b', dataType: 'Kredi Kartı', classification: 'critical', fileTypes: ['XLSX', 'CSV', 'TXT', 'PDF'], enabled: true, description: 'Kredi kartı numarası deseni' },
  { id: 6, name: 'Sağlık Verisi Anahtar Kelime', pattern: '(tanı|teşhis|tedavi|ilaç|reçete|ameliyat|hasta)', dataType: 'Sağlık Verisi', classification: 'critical', fileTypes: ['DOCX', 'PDF', 'TXT', 'XLSX'], enabled: false, description: 'Sağlık ile ilgili anahtar kelimeler' },
  { id: 7, name: 'Maaş/Ücret Bilgisi', pattern: '(maaş|ücret|bordro|brüt|net|AGİ)', dataType: 'Maaş Bilgisi', classification: 'critical', fileTypes: ['XLSX', 'PDF', 'DOCX'], enabled: true, description: 'Maaş ve ücret ile ilgili anahtar kelimeler' },
]

export default function Rules() {
  const [rules, setRules] = useState(defaultRules)
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', pattern: '', dataType: '', classification: 'critical', fileTypes: [], enabled: true, description: '' })

  const filtered = rules.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.dataType.toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => {
    setEditingRule(null)
    setForm({ name: '', pattern: '', dataType: '', classification: 'critical', fileTypes: [], enabled: true, description: '' })
    setShowModal(true)
  }

  const openEdit = (rule) => {
    setEditingRule(rule)
    setForm({ ...rule })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name || !form.pattern) return
    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? { ...form, id: r.id } : r))
    } else {
      setRules([...rules, { ...form, id: Date.now() }])
    }
    setShowModal(false)
  }

  const toggleRule = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  const deleteRule = (id) => {
    setRules(rules.filter(r => r.id !== id))
  }

  const toggleFileType = (ft) => {
    setForm(prev => ({
      ...prev,
      fileTypes: prev.fileTypes.includes(ft)
        ? prev.fileTypes.filter(f => f !== ft)
        : [...prev.fileTypes, ft]
    }))
  }

  return (
    <div>
      <div className="page-header">
        <h1>Sınıflandırma Kuralları</h1>
        <p>Hassas veri tespiti için regex ve anahtar kelime kuralları</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Kural ara..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
          <button className="btn btn-primary" onClick={openNew}><Plus size={15} /> Yeni Kural</button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Durum</th>
                <th>Kural Adı</th>
                <th>Veri Türü</th>
                <th>Regex / Desen</th>
                <th>Sınıf</th>
                <th>Dosya Türleri</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(rule => (
                <tr key={rule.id} style={{ opacity: rule.enabled ? 1 : 0.5 }}>
                  <td>
                    <button className="btn-icon" onClick={() => toggleRule(rule.id)} style={{ border: 'none', color: rule.enabled ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                      {rule.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{rule.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{rule.description}</div>
                  </td>
                  <td><span className="tag">{rule.dataType}</span></td>
                  <td><code style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: 4 }}>{rule.pattern.length > 40 ? rule.pattern.substring(0,40) + '...' : rule.pattern}</code></td>
                  <td>
                    <span className={`badge badge-${rule.classification}`}>
                      {dataClassifications.find(c => c.id === rule.classification)?.label}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {rule.fileTypes.slice(0,3).map(ft => <span key={ft} className="tag">{ft}</span>)}
                      {rule.fileTypes.length > 3 && <span className="tag">+{rule.fileTypes.length - 3}</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon" title="Düzenle" onClick={() => openEdit(rule)}><Edit2 size={14} /></button>
                      <button className="btn-icon" title="Sil" onClick={() => deleteRule(rule.id)} style={{ color: 'var(--accent-red)' }}><Trash2 size={14} /></button>
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
              <h2>{editingRule ? 'Kuralı Düzenle' : 'Yeni Kural Ekle'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="form-group">
              <label className="form-label">Kural Adı *</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Örn: TCKN Tespiti" />
            </div>
            <div className="form-group">
              <label className="form-label">Regex / Desen *</label>
              <input className="form-input" value={form.pattern} onChange={e => setForm({...form, pattern: e.target.value})} placeholder="Regex deseni girin" style={{ fontFamily: 'monospace' }} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Veri Türü</label>
                <input className="form-input" value={form.dataType} onChange={e => setForm({...form, dataType: e.target.value})} placeholder="Örn: TCKN, E-posta" />
              </div>
              <div className="form-group">
                <label className="form-label">Sınıflandırma</label>
                <select className="form-select" value={form.classification} onChange={e => setForm({...form, classification: e.target.value})}>
                  {dataClassifications.map(c => <option key={c.id} value={c.id}>{c.label} - {c.description}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Uygulanacak Dosya Türleri</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {fileTypes.map(ft => (
                  <button key={ft} className={`tag`} onClick={() => toggleFileType(ft)}
                    style={{ cursor: 'pointer', background: form.fileTypes.includes(ft) ? 'rgba(59,130,246,0.2)' : undefined, color: form.fileTypes.includes(ft) ? 'var(--accent-blue)' : undefined, border: form.fileTypes.includes(ft) ? '1px solid var(--accent-blue)' : '1px solid transparent' }}>
                    {ft}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Açıklama</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Kural hakkında açıklama..." />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={handleSave}>{editingRule ? 'Güncelle' : 'Kaydet'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
