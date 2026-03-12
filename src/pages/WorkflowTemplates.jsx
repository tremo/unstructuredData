import { useState, useEffect, useCallback } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  BookTemplate, Eye, Copy, ArrowRight, Zap, GitBranch, Mail,
  Clock, Cog, CheckCircle, MailWarning, Lock, FolderLock,
  Bell, UserSearch, AlertTriangle, FileX
} from 'lucide-react'
import { workflowsApi } from '../services/api'
import { nodeTypes as nodeTypeDefs } from '../data/mockData'
import ClassificationBadge from '../components/common/ClassificationBadge'

const iconMap = {
  Zap, GitBranch, Mail, Clock, Cog, CheckCircle, MailWarning,
  Lock, FolderLock, Bell, UserSearch, AlertTriangle, FileX,
  CheckCircle2: CheckCircle,
}

const nodeColorMap = {
  trigger: '#a855f7',
  condition: '#3b82f6',
  notification: '#06b6d4',
  delay: '#eab308',
  action: '#f97316',
  end: '#22c55e',
}

function TemplateNode({ data, type }) {
  const color = nodeColorMap[type] || '#94a3b8'
  const Icon = iconMap[data.icon] || Zap
  const isCondition = type === 'condition'
  const isTrigger = type === 'trigger'
  const isEnd = type === 'end'

  return (
    <div style={{
      background: '#1e293b', border: `2px solid ${color}`,
      borderRadius: 10, padding: '10px 14px', minWidth: 150,
      color: '#f1f5f9', fontSize: '0.78rem',
      boxShadow: `0 2px 8px ${color}25`,
    }}>
      {!isTrigger && <Handle type="target" position={Position.Top} style={{ background: color, width: 8, height: 8, border: '2px solid #1e293b' }} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 6,
          background: `${color}20`, color: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Icon size={13} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.76rem' }}>{data.label}</div>
          {data.config?.days && <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{data.config.days} gün</div>}
        </div>
      </div>
      {!isEnd && !isCondition && <Handle type="source" position={Position.Bottom} style={{ background: color, width: 8, height: 8, border: '2px solid #1e293b' }} />}
      {isCondition && (
        <>
          <Handle type="source" position={Position.Left} id="yes" style={{ background: '#22c55e', width: 8, height: 8, border: '2px solid #1e293b' }} />
          <Handle type="source" position={Position.Right} id="no" style={{ background: '#ef4444', width: 8, height: 8, border: '2px solid #1e293b' }} />
        </>
      )}
    </div>
  )
}

const templateNodeTypes = {
  trigger: (props) => <TemplateNode {...props} type="trigger" />,
  condition: (props) => <TemplateNode {...props} type="condition" />,
  notification: (props) => <TemplateNode {...props} type="notification" />,
  delay: (props) => <TemplateNode {...props} type="delay" />,
  action: (props) => <TemplateNode {...props} type="action" />,
  end: (props) => <TemplateNode {...props} type="end" />,
}

function TemplatePreview({ template, onClose }) {
  const [nodes] = useNodesState(template.nodes)
  const [edges] = useEdgesState(template.edges.map(e => ({
    ...e,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: e.style?.stroke || '#475569' },
    style: { ...e.style, strokeWidth: 2 },
  })))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 900, height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div>
            <h2>{template.name}</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>{template.description}</p>
          </div>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>
        <div style={{ flex: 1, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={templateNodeTypes}
            fitView
            style={{ background: '#0c1222' }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={true}
            zoomOnScroll={true}
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls style={{ background: '#1e293b', borderColor: '#334155', borderRadius: 8 }} />
          </ReactFlow>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Kapat</button>
          <a href="#/workflows" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Copy size={15} /> Şablonu Kullan
          </a>
        </div>
      </div>
    </div>
  )
}

export default function WorkflowTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewTemplate, setPreviewTemplate] = useState(null)

  useEffect(() => {
    workflowsApi.getAll({ templates: 'true' })
      .then(setTemplates)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>Akış Şablonları</h1><p>Yükleniyor...</p></div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Akış Şablonları</h1>
        <p>Hazır iş akışı şablonları ile hızlıca başlayın</p>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {templates.map(template => (
          <div key={template.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <BookTemplate size={20} color="var(--accent-blue)" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{template.name}</h3>
                  <ClassificationBadge classification={template.classification} />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{template.description}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setPreviewTemplate(template)}>
                  <Eye size={14} /> Önizle
                </button>
                <a href="#/workflows" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                  <Copy size={14} /> Kullan
                </a>
              </div>
            </div>

            <div style={{ height: 300, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <ReactFlow
                nodes={template.nodes}
                edges={template.edges.map(e => ({
                  ...e,
                  type: 'smoothstep',
                  markerEnd: { type: MarkerType.ArrowClosed, color: e.style?.stroke || '#475569' },
                  style: { ...e.style, strokeWidth: 2 },
                }))}
                nodeTypes={templateNodeTypes}
                fitView
                style={{ background: '#0c1222' }}
                proOptions={{ hideAttribution: true }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={false}
                zoomOnScroll={false}
                preventScrolling={false}
              >
                <Background color="#1e293b" gap={20} size={1} />
              </ReactFlow>
            </div>

            <div style={{ marginTop: 14, display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>{template.nodes.length} düğüm</span>
              <span>{template.edges.length} bağlantı</span>
              <span>{template.nodes.filter(n => n.type === 'condition').length} karar noktası</span>
              <span>{template.nodes.filter(n => n.type === 'notification').length} bildirim adımı</span>
            </div>
          </div>
        ))}
      </div>

      {previewTemplate && (
        <TemplatePreview template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
      )}

      <style>{`
        .react-flow__controls button {
          background: #1e293b !important;
          color: #94a3b8 !important;
          border-color: #334155 !important;
        }
      `}</style>
    </div>
  )
}
