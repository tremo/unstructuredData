const classMap = {
  critical: { label: 'Kritik', className: 'badge-critical' },
  high: { label: 'Yüksek', className: 'badge-high' },
  medium: { label: 'Orta', className: 'badge-medium' },
  low: { label: 'Düşük', className: 'badge-low' },
}

export default function ClassificationBadge({ classification }) {
  const info = classMap[classification] || { label: classification, className: 'badge-draft' }
  return <span className={`badge ${info.className}`}>{info.label}</span>
}
