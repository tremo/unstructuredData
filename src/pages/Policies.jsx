import { useState } from 'react'
import { ShieldAlert, Plus, Edit2, Trash2, Play, Pause, Eye, Clock, Mail, Lock, FolderLock, Bell, UserSearch } from 'lucide-react'
import { policies as defaultPolicies, dataClassifications } from '../data/mockData'
import StatusBadge from '../components/common/StatusBadge'
import ClassificationBadge from '../components/common/ClassificationBadge'

const stepTypeOptions = [
  { value: 'notify', label: 'E-posta Bildirimi', icon: '📧' },
  { value: 'encrypt', label: 'Dosyayı Şifrele', icon: '🔒' },
  { value: 'move', label: 'Dosyayı Taşı', icon: '📁' },
  { value: 'delete', label: 'Dosyayı Sil', icon: '🗑️' },
  { value: 'notify_final', label: 'Son Bildirim', icon: '🔔' },
  { value: 'notify_manager', label: 'Yöneticiye Bildir', icon: '👤' },
]

const ownerOptions = [
  { value: 'lastEditor', label: 'Son Düzenleyen Kişi' },
  { value: 'creator', label: 'Dosyayı Oluşturan Kişi' },
  { value: 'both', label: 'Her İkisi' },
]

export default function Policies() {
  const [policiesList, setPolicies] = useState(defaultPolicies)
  const [showModal, setShowModal] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [viewPolicy, setViewPolicy] = useState(null)
  const [form, setForm] = useState({
    name: '', classification: 'critical', status: 'draft', ownerDetection: 'lastEditor',
    steps: [{ type: 'notify', delay: 0, message: '' }]
  })

  const openNew = () => {
    setEditingPolicy(null)
    setForm({ name: '', classification: 'critical', status: 'draft', ownerDetection: 'lastEditor', steps: [{ type: 'notify', delay: 0, message: '' }] })
    setShowModal(true)
  }

  const openEdit = (policy) => {
    setEditingPolicy(policy)
    setForm({ name: policy.name, classification: policy.classification, status: policy.status, ownerDetection: policy.ownerDetection, steps: [...policy.steps] })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name) return
    if (editingPolicy) {
      setPolicies(policiesList.map(p => p.id === editingPolicy.id ? { ...p, ...form } : p))
    } else {
      setPolicies([...policiesList, { ...form, id: Date.now(), createdAt: new Date().toISOString().split('T')[0], triggeredCount: 0 }])
    }
    setShowModal(false)
  }

  const addStep = () => {
    const lastDelay = form.steps.length > 0 ? form.steps[form.steps.length - 1].delay + 7 : 0
    setForm({ ...form, steps: [...form.steps, { type: 'notify', delay: lastDelay, message: '' }] })
  }

  const updateStep = (idx, field, value) => {
    const newSteps = [...form.steps]
    newSteps[idx] = { ...newSteps[idx], [field]: value }
    setForm({ ...form, steps: newSteps })
  }

  const removeStep = (idx) => {
    setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx) })
  }

  const toggleStatus = (id) => {
    setPolicies(policiesList.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'paused' : 'active' } : p))
  }

  const getStepIcon = (type) => {
    switch(type) {
      case 'notify': return <Mail size={14} />
      case 'encrypt': return <Lock size={14} />
      case 'move': return <FolderLock size={14} />
      case 'notify_final': return <Bell size={14} />
      case 'notify_manager': return <UserSearch size={14} />
      default: return <Clock size={14} />
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Politika Yönetimi</h1>
        <p>Veri sınıfına göre otomatik aksiyon politikaları tanımlayın</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={openNew}><Plus size={15} /> Yeni Politika</button>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {policiesList.map(policy => (
          <div key={policy.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{policy.name}</h3>
                  <ClassificationBadge classification={policy.classification} />
                  <StatusBadge status={policy.status} />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Oluşturulma: {policy.createdAt} · Sahip tespiti: {ownerOptions.find(o => o.value === policy.ownerDetection)?.label} · {policy.triggeredCount} kez tetiklendi
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm btn-secondary" onClick={() => toggleStatus(policy.id)}>
                  {policy.status === 'active' ? <><Pause size={13} /> Duraklat</> : <><Play size={13} /> Aktifleştir</>}
                </button>
                <button className="btn-icon" onClick={() => setViewPolicy(policy)}><Eye size={14} /></button>
                <button className="btn-icon" onClick={() => openEdit(policy)}><Edit2 size={14} /></button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {policy.steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                    background: 'var(--bg-primary)', borderRadius: 8, fontSize: '0.8rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    {getStepIcon(step.type)}
                    <span>{step.message || stepTypeOptions.find(s => s.value === step.type)?.label}</span>
                    {step.delay > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>({step.delay} gün)</span>}
                  </div>
                  {idx < policy.steps.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2>{editingPolicy ? 'Politikayı Düzenle' : 'Yeni Politika'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <div className="form-group">
              <label className="form-label">Politika Adı *</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Örn: Kritik Veri - 3 Uyarı ve Şifreleme" />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Veri Sınıfı</label>
                <select className="form-select" value={form.classification} onChange={e => setForm({...form, classification: e.target.value})}>
                  {dataClassifications.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Dosya Sahibi Tespiti</label>
                <select className="form-select" value={form.ownerDetection} onChange={e => setForm({...form, ownerDetection: e.target.value})}>
                  {ownerOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Adımlar</label>
                <button className="btn btn-sm btn-secondary" onClick={addStep}><Plus size={13} /> Adım Ekle</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {form.steps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 10, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, width: 20 }}>{idx + 1}</span>
                    <select className="form-select" style={{ width: 'auto', minWidth: 150 }} value={step.type} onChange={e => updateStep(idx, 'type', e.target.value)}>
                      {stepTypeOptions.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} color="var(--text-muted)" />
                      <input className="form-input" type="number" min="0" style={{ width: 60 }} value={step.delay} onChange={e => updateStep(idx, 'delay', parseInt(e.target.value) || 0)} />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>gün</span>
                    </div>
                    <input className="form-input" style={{ flex: 1 }} value={step.message} onChange={e => updateStep(idx, 'message', e.target.value)} placeholder="Açıklama..." />
                    {form.steps.length > 1 && <button className="btn-icon" onClick={() => removeStep(idx)} style={{ color: 'var(--accent-red)' }}><Trash2 size={13} /></button>}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={handleSave}>{editingPolicy ? 'Güncelle' : 'Oluştur'}</button>
            </div>
          </div>
        </div>
      )}

      {viewPolicy && (
        <div className="modal-overlay" onClick={() => setViewPolicy(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Politika Detayı</h2>
              <button className="btn-icon" onClick={() => setViewPolicy(null)}>&times;</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 4 }}>{viewPolicy.name}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <ClassificationBadge classification={viewPolicy.classification} />
                <StatusBadge status={viewPolicy.status} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Dosya Sahibi Tespiti</label>
              <div>{ownerOptions.find(o => o.value === viewPolicy.ownerDetection)?.label}</div>
            </div>
            <label className="form-label">Akış Adımları</label>
            <div style={{ position: 'relative', paddingLeft: 24 }}>
              <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'var(--border-color)' }} />
              {viewPolicy.steps.map((step, idx) => (
                <div key={idx} style={{ position: 'relative', marginBottom: 16, paddingLeft: 16 }}>
                  <div style={{
                    position: 'absolute', left: -20, top: 4, width: 18, height: 18,
                    borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--accent-blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-blue)'
                  }}>{idx + 1}</div>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      {getStepIcon(step.type)}
                      <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{stepTypeOptions.find(s => s.value === step.type)?.label}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {step.message} {step.delay > 0 && `· ${step.delay} gün sonra`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewPolicy(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
