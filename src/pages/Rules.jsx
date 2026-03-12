import { useState, useEffect } from 'react'
import { Shield, Plus, Edit2, Trash2, Search, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { dataClassifications, fileTypes } from '../data/mockData'
import { rulesApi } from '../services/api'

export default function Rules() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', pattern: '', dataType: '', classification: 'critical', fileTypes: [], enabled: true, description: '' })

  useEffect(() => {
    rulesApi.getAll().then(setRules).catch(console.error).finally(() => setLoading(false))
  }, [])

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
    setForm({ name: rule.name, pattern: rule.pattern, dataType: rule.dataType, classification: rule.classification, fileTypes: [...rule.fileTypes], enabled: rule.enabled, description: rule.description })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.pattern) return
    try {
      if (editingRule) {
        const updated = await rulesApi.update(editingRule.id, form)
        setRules(rules.map(r => r.id === editingRule.id ? updated : r))
      } else {
        const created = await rulesApi.create(form)
        setRules([...rules, created])
      }
      setShowModal(false)
    } catch (err) {
      console.error('Kural kaydetme hatası:', err)
    }
  }

  const toggleRule = async (id) => {
    const rule = rules.find(r => r.id === id)
    try {
      const updated = await rulesApi.update(id, { enabled: !rule.enabled })
      setRules(rules.map(r => r.id === id ? updated : r))
    } catch (err) {
      console.error('Kural güncelleme hatası:', err)
    }
  }

  const deleteRule = async (id) => {
    try {
      await rulesApi.delete(id)
      setRules(rules.filter(r => r.id !== id))
    } catch (err) {
      console.error('Kural silme hatası:', err)
    }
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
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Yükleniyor...</td></tr>
              ) : filtered.map(rule => (
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
