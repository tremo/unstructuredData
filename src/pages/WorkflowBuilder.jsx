import { useState, useCallback, useRef, useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Zap, GitBranch, Mail, Clock, Cog, CheckCircle, Plus,
  Save, Play, Trash2, MailWarning, Lock, FolderLock, Bell,
  UserSearch, AlertTriangle, FileX, Download, Upload, GripVertical
} from 'lucide-react'
import { nodeTypes as nodeTypeDefs } from '../data/mockData'
import { workflowsApi } from '../services/api'

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

function CustomNode({ data, type }) {
  const color = nodeColorMap[type] || '#94a3b8'
  const Icon = iconMap[data.icon] || Zap
  const isCondition = type === 'condition'
  const isTrigger = type === 'trigger'
  const isEnd = type === 'end'

  return (
    <div style={{
      background: 'var(--bg-secondary, #1e293b)',
      border: `2px solid ${color}`,
      borderRadius: 12,
      padding: '12px 16px',
      minWidth: 170,
      color: '#f1f5f9',
      fontSize: '0.82rem',
      boxShadow: `0 4px 12px ${color}30`,
      position: 'relative',
    }}>
      {!isTrigger && (
        <Handle type="target" position={Position.Top} style={{ background: color, width: 10, height: 10, border: '2px solid #1e293b' }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color, flexShrink: 0
        }}>
          <Icon size={16} />
        </div>
        <div>
          <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{data.label}</div>
          {data.config?.days && (
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>{data.config.days} gün</div>
          )}
          {data.config?.classification && (
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>Sınıf: {data.config.classification}</div>
          )}
          {data.config?.to && (
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>Alıcı: {data.config.to}</div>
          )}
        </div>
      </div>
      {!isEnd && !isCondition && (
        <Handle type="source" position={Position.Bottom} style={{ background: color, width: 10, height: 10, border: '2px solid #1e293b' }} />
      )}
      {isCondition && (
        <>
          <Handle type="source" position={Position.Left} id="yes" style={{ background: '#22c55e', width: 10, height: 10, border: '2px solid #1e293b', left: -5 }} />
          <Handle type="source" position={Position.Right} id="no" style={{ background: '#ef4444', width: 10, height: 10, border: '2px solid #1e293b', right: -5 }} />
          <div style={{ position: 'absolute', left: -30, top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', color: '#22c55e', fontWeight: 600 }}>Evet</div>
          <div style={{ position: 'absolute', right: -32, top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', color: '#ef4444', fontWeight: 600 }}>Hayır</div>
        </>
      )}
    </div>
  )
}

const customNodeTypes = {
  trigger: (props) => <CustomNode {...props} type="trigger" />,
  condition: (props) => <CustomNode {...props} type="condition" />,
  notification: (props) => <CustomNode {...props} type="notification" />,
  delay: (props) => <CustomNode {...props} type="delay" />,
  action: (props) => <CustomNode {...props} type="action" />,
  end: (props) => <CustomNode {...props} type="end" />,
}

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  style: { stroke: '#475569', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' },
}

export default function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    { id: 'trigger-1', type: 'trigger', position: { x: 300, y: 50 }, data: { label: 'Veri Tespit Edildi', icon: 'AlertTriangle', config: { classification: 'critical' } } },
  ])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [showNodePanel, setShowNodePanel] = useState(false)
  const [workflowName, setWorkflowName] = useState('Yeni İş Akışı')
  const reactFlowWrapper = useRef(null)

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#475569', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' },
    }, eds))
  }, [setEdges])

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node)
  }, [])

  const addNode = (typeDef) => {
    const newNode = {
      id: `${typeDef.type}-${Date.now()}`,
      type: typeDef.type,
      position: { x: 300 + Math.random() * 100, y: 100 + nodes.length * 120 },
      data: {
        label: typeDef.label === 'Tetikleyici' ? 'Yeni Tetikleyici' :
               typeDef.label === 'Koşul' ? 'Koşul Kontrolü' :
               typeDef.label === 'Bildirim' ? 'E-posta Gönder' :
               typeDef.label === 'Bekleme' ? 'Süre Bekle' :
               typeDef.label === 'Aksiyon' ? 'Aksiyon Al' : 'Bitiş',
        icon: typeDef.icon,
        config: typeDef.type === 'delay' ? { days: 7 } :
                typeDef.type === 'notification' ? { to: 'owner', template: 'warning' } :
                typeDef.type === 'condition' ? { check: 'action_taken' } :
                typeDef.type === 'action' ? { action: 'encrypt' } : {}
      }
    }
    setNodes(nds => [...nds, newNode])
    setShowNodePanel(false)
  }

  const deleteSelected = () => {
    if (!selectedNode) return
    setNodes(nds => nds.filter(n => n.id !== selectedNode.id))
    setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id))
    setSelectedNode(null)
  }

  const updateNodeData = (field, value) => {
    if (!selectedNode) return
    setNodes(nds => nds.map(n => {
      if (n.id === selectedNode.id) {
        const updated = { ...n, data: { ...n.data } }
        if (field === 'label') updated.data.label = value
        else updated.data.config = { ...updated.data.config, [field]: value }
        setSelectedNode(updated)
        return updated
      }
      return n
    }))
  }

  const clearAll = () => {
    setNodes([])
    setEdges([])
    setSelectedNode(null)
  }

  const exportWorkflow = () => {
    const data = JSON.stringify({ name: workflowName, nodes, edges }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowName.replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>İş Akışı Tasarımcısı</h1>
            <p>Sürükle-bırak ile otomatik aksiyon akışları oluşturun</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={exportWorkflow}><Download size={15} /> Dışa Aktar</button>
            <button className="btn btn-primary" onClick={async () => {
              try {
                await workflowsApi.create({ name: workflowName, nodes, edges })
                alert('İş akışı kaydedildi!')
              } catch (err) { console.error('Kaydetme hatası:', err) }
            }}><Save size={15} /> Kaydet</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 140px)' }}>
        {/* Left Sidebar - Node Palette */}
        <div style={{
          width: 220, background: 'var(--bg-card)', borderRadius: '12px 0 0 12px',
          border: '1px solid var(--border-color)', padding: 14, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 6
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Düğüm Paleti
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            Tıklayarak akışa ekleyin
          </div>

          {nodeTypeDefs.map(nt => {
            const Icon = iconMap[nt.icon] || Zap
            return (
              <button
                key={nt.type}
                onClick={() => addNode(nt)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: 'var(--bg-primary)', border: `1px solid ${nt.color}40`,
                  borderRadius: 8, cursor: 'pointer', color: 'var(--text-primary)',
                  fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.15s',
                  textAlign: 'left', width: '100%', fontFamily: 'inherit'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = nt.color; e.currentTarget.style.background = `${nt.color}10` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${nt.color}40`; e.currentTarget.style.background = 'var(--bg-primary)' }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: `${nt.color}20`, color: nt.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Icon size={14} />
                </div>
                <div>
                  <div>{nt.label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>{nt.description}</div>
                </div>
              </button>
            )
          })}

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10, marginTop: 6 }}>
            <button className="btn btn-sm btn-danger" style={{ width: '100%' }} onClick={clearAll}>
              <Trash2 size={13} /> Tümünü Temizle
            </button>
          </div>
        </div>

        {/* Main Canvas */}
        <div style={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={customNodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            style={{ background: '#0c1222' }}
            proOptions={{ hideAttribution: true }}
            deleteKeyCode="Delete"
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls style={{ background: '#1e293b', borderColor: '#334155', borderRadius: 8 }} />
            <MiniMap
              style={{ background: '#0f172a', borderColor: '#334155', borderRadius: 8 }}
              nodeColor={(node) => nodeColorMap[node.type] || '#475569'}
              maskColor="rgba(15,23,42,0.8)"
            />
            <Panel position="top-left">
              <div style={{
                background: 'var(--bg-secondary)', padding: '8px 14px', borderRadius: 8,
                border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8
              }}>
                <input
                  value={workflowName}
                  onChange={e => setWorkflowName(e.target.value)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text-primary)',
                    fontSize: '0.9rem', fontWeight: 600, outline: 'none', width: 200, fontFamily: 'inherit'
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{nodes.length} düğüm · {edges.length} bağlantı</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Right Sidebar - Properties */}
        <div style={{
          width: 260, background: 'var(--bg-card)', borderRadius: '0 12px 12px 0',
          border: '1px solid var(--border-color)', padding: 14, overflowY: 'auto'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
            Özellikler
          </div>

          {selectedNode ? (
            <div>
              <div className="form-group">
                <label className="form-label">Etiket</label>
                <input className="form-input" value={selectedNode.data.label} onChange={e => updateNodeData('label', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Tür</label>
                <div style={{ padding: '6px 10px', background: 'var(--bg-primary)', borderRadius: 6, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: nodeColorMap[selectedNode.type] }} />
                  {nodeTypeDefs.find(n => n.type === selectedNode.type)?.label || selectedNode.type}
                </div>
              </div>

              {selectedNode.type === 'delay' && (
                <div className="form-group">
                  <label className="form-label">Bekleme Süresi (gün)</label>
                  <input className="form-input" type="number" min="1" value={selectedNode.data.config?.days || 7} onChange={e => updateNodeData('days', parseInt(e.target.value))} />
                </div>
              )}

              {selectedNode.type === 'notification' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Alıcı</label>
                    <select className="form-select" value={selectedNode.data.config?.to || 'owner'} onChange={e => updateNodeData('to', e.target.value)}>
                      <option value="owner">Dosya Sahibi</option>
                      <option value="manager">Yönetici</option>
                      <option value="owner+manager">Sahip + Yönetici</option>
                      <option value="dpo">DPO</option>
                      <option value="custom">Özel</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Şablon</label>
                    <select className="form-select" value={selectedNode.data.config?.template || 'warning'} onChange={e => updateNodeData('template', e.target.value)}>
                      <option value="warning_1">1. Uyarı</option>
                      <option value="warning_2">2. Uyarı</option>
                      <option value="warning_final">Son Uyarı</option>
                      <option value="encrypted_notice">Şifreleme Bildirimi</option>
                      <option value="moved_notice">Taşıma Bildirimi</option>
                      <option value="custom">Özel Şablon</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNode.type === 'action' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Aksiyon</label>
                    <select className="form-select" value={selectedNode.data.config?.action || 'encrypt'} onChange={e => updateNodeData('action', e.target.value)}>
                      <option value="encrypt">Şifrele</option>
                      <option value="move">Taşı</option>
                      <option value="delete">Sil</option>
                      <option value="quarantine">Karantinaya Al</option>
                      <option value="tag">Etiketle</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hedef Konum</label>
                    <input className="form-input" value={selectedNode.data.config?.destination || ''} onChange={e => updateNodeData('destination', e.target.value)} placeholder="\\\\quarantine\\encrypted" />
                  </div>
                </>
              )}

              {selectedNode.type === 'condition' && (
                <div className="form-group">
                  <label className="form-label">Kontrol</label>
                  <select className="form-select" value={selectedNode.data.config?.check || 'action_taken'} onChange={e => updateNodeData('check', e.target.value)}>
                    <option value="action_taken">Aksiyon Alındı mı?</option>
                    <option value="file_exists">Dosya Mevcut mu?</option>
                    <option value="exception_requested">İstisna Talep Edildi mi?</option>
                    <option value="owner_responded">Sahip Yanıt Verdi mi?</option>
                    <option value="file_modified">Dosya Değiştirildi mi?</option>
                  </select>
                </div>
              )}

              {selectedNode.type === 'trigger' && (
                <div className="form-group">
                  <label className="form-label">Veri Sınıfı</label>
                  <select className="form-select" value={selectedNode.data.config?.classification || 'critical'} onChange={e => updateNodeData('classification', e.target.value)}>
                    <option value="critical">Kritik</option>
                    <option value="high">Yüksek</option>
                    <option value="medium">Orta</option>
                    <option value="low">Düşük</option>
                    <option value="any">Tümü</option>
                  </select>
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <button className="btn btn-sm btn-danger" style={{ width: '100%' }} onClick={deleteSelected}>
                  <Trash2 size={13} /> Düğümü Sil
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '24px 8px' }}>
              <Cog size={32} />
              <h3 style={{ marginTop: 8 }}>Düğüm Seçin</h3>
              <p>Özelliklerini düzenlemek için bir düğüme tıklayın</p>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, marginTop: 16 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>İpuçları</div>
            <ul style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Soldaki paletten düğüm ekleyin</li>
              <li>Düğümleri sürükleyerek konumlandırın</li>
              <li>Bağlantı noktalarından çekerek bağlayın</li>
              <li>Koşul düğümleri Evet/Hayır dallanır</li>
              <li>Delete tuşu ile seçili düğümü silin</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .react-flow__node {
          cursor: grab;
        }
        .react-flow__node:active {
          cursor: grabbing;
        }
        .react-flow__edge-path {
          stroke-width: 2;
        }
        .react-flow__controls button {
          background: #1e293b !important;
          color: #94a3b8 !important;
          border-color: #334155 !important;
        }
        .react-flow__controls button:hover {
          background: #334155 !important;
          color: #f1f5f9 !important;
        }
      `}</style>
    </div>
  )
}
