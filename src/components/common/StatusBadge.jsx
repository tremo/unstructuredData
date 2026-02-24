const statusMap = {
  pending: { label: 'Bekliyor', className: 'badge-medium' },
  notified: { label: 'Bildirildi', className: 'badge-info' },
  resolved: { label: 'Çözüldü', className: 'badge-low' },
  encrypted: { label: 'Şifrelendi', className: 'badge-critical' },
  exception: { label: 'İstisna', className: 'badge-high' },
  active: { label: 'Aktif', className: 'badge-active' },
  draft: { label: 'Taslak', className: 'badge-draft' },
  paused: { label: 'Duraklatıldı', className: 'badge-paused' },
  approved: { label: 'Onaylandı', className: 'badge-active' },
}

export default function StatusBadge({ status }) {
  const info = statusMap[status] || { label: status, className: 'badge-draft' }
  return <span className={`badge ${info.className}`}>{info.label}</span>
}
