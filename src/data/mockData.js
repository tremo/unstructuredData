export const dataClassifications = [
  { id: 'critical', label: 'Kritik', color: '#ef4444', description: 'Kişisel veriler, finansal bilgiler, sağlık kayıtları' },
  { id: 'high', label: 'Yüksek', color: '#f97316', description: 'İç stratejik dokümanlar, müşteri listeleri' },
  { id: 'medium', label: 'Orta', color: '#eab308', description: 'İç yazışmalar, proje dokümanları' },
  { id: 'low', label: 'Düşük', color: '#22c55e', description: 'Genel bilgi, halka açık dokümanlar' },
]

export const fileTypes = [
  'PDF', 'DOCX', 'XLSX', 'PPTX', 'TXT', 'CSV', 'JPG', 'PNG', 'MSG', 'EML', 'ZIP', 'JSON', 'XML'
]

export const scanLocations = [
  { id: 1, name: '\\\\fileserver01\\paylaşım', type: 'SMB', status: 'active', lastScan: '2026-02-23 14:30' },
  { id: 2, name: '\\\\fileserver02\\hr-docs', type: 'SMB', status: 'active', lastScan: '2026-02-23 12:15' },
  { id: 3, name: 'SharePoint - İnsan Kaynakları', type: 'SharePoint', status: 'active', lastScan: '2026-02-22 09:00' },
  { id: 4, name: 'OneDrive - Finans Departmanı', type: 'OneDrive', status: 'paused', lastScan: '2026-02-20 16:45' },
  { id: 5, name: '\\\\nas01\\projeler', type: 'NFS', status: 'active', lastScan: '2026-02-23 08:00' },
]

export const detectedFiles = [
  { id: 1, name: 'musteri_listesi_2026.xlsx', path: '\\\\fileserver01\\paylaşım\\satış', classification: 'critical', size: '2.4 MB', owner: 'Ahmet Yılmaz', lastModified: '2026-02-20', detectedData: ['TCKN', 'Telefon', 'E-posta'], status: 'pending', notificationCount: 0 },
  { id: 2, name: 'maas_tablosu.xlsx', path: '\\\\fileserver02\\hr-docs\\bordro', classification: 'critical', size: '1.8 MB', owner: 'Zeynep Demir', lastModified: '2026-02-18', detectedData: ['TCKN', 'IBAN', 'Maaş Bilgisi'], status: 'notified', notificationCount: 2 },
  { id: 3, name: 'proje_plani_v3.docx', path: '\\\\nas01\\projeler\\alpha', classification: 'medium', size: '540 KB', owner: 'Mehmet Kaya', lastModified: '2026-02-21', detectedData: ['İç Strateji'], status: 'resolved', notificationCount: 1 },
  { id: 4, name: 'hasta_kayitlari.pdf', path: 'SharePoint - İnsan Kaynakları\\saglik', classification: 'critical', size: '5.1 MB', owner: 'Fatma Öz', lastModified: '2026-01-15', detectedData: ['Sağlık Verisi', 'TCKN', 'Adres'], status: 'encrypted', notificationCount: 3 },
  { id: 5, name: 'kurumsal_sunum.pptx', path: '\\\\fileserver01\\paylaşım\\pazarlama', classification: 'low', size: '12 MB', owner: 'Can Arslan', lastModified: '2026-02-22', detectedData: ['Genel Bilgi'], status: 'resolved', notificationCount: 0 },
  { id: 6, name: 'butce_raporu_Q1.xlsx', path: 'OneDrive - Finans Departmanı\\raporlar', classification: 'high', size: '3.2 MB', owner: 'Elif Şahin', lastModified: '2026-02-19', detectedData: ['Finansal Veri', 'Bütçe'], status: 'notified', notificationCount: 1 },
  { id: 7, name: 'personel_cv_arsiv.zip', path: '\\\\fileserver02\\hr-docs\\ise-alim', classification: 'critical', size: '45 MB', owner: 'Zeynep Demir', lastModified: '2026-02-10', detectedData: ['TCKN', 'Adres', 'Fotoğraf'], status: 'pending', notificationCount: 0 },
  { id: 8, name: 'tedarikci_sozlesmeleri.pdf', path: '\\\\nas01\\projeler\\hukuk', classification: 'high', size: '8.7 MB', owner: 'Ali Güneş', lastModified: '2026-02-15', detectedData: ['Ticari Sır', 'Fiyat Bilgisi'], status: 'exception', notificationCount: 2 },
]

export const policies = [
  {
    id: 1,
    name: 'Kritik Veri - 3 Uyarı ve Şifreleme',
    classification: 'critical',
    status: 'active',
    ownerDetection: 'lastEditor',
    steps: [
      { type: 'notify', delay: 0, message: '1. uyarı e-postası gönderildi' },
      { type: 'notify', delay: 7, message: '2. uyarı e-postası gönderildi' },
      { type: 'notify', delay: 14, message: '3. (son) uyarı e-postası gönderildi' },
      { type: 'encrypt', delay: 21, message: 'Dosya şifrelenerek karantinaya alındı' },
      { type: 'notify_final', delay: 21, message: 'Şifreleme bildirimi gönderildi' },
    ],
    createdAt: '2026-01-10',
    triggeredCount: 24,
  },
  {
    id: 2,
    name: 'Yüksek Önem - 2 Uyarı ve Taşıma',
    classification: 'high',
    status: 'active',
    ownerDetection: 'creator',
    steps: [
      { type: 'notify', delay: 0, message: '1. uyarı e-postası gönderildi' },
      { type: 'notify', delay: 14, message: '2. uyarı e-postası gönderildi' },
      { type: 'move', delay: 28, message: 'Dosya güvenli alana taşındı' },
    ],
    createdAt: '2026-01-15',
    triggeredCount: 12,
  },
  {
    id: 3,
    name: 'Orta Önem - Sadece Bildirim',
    classification: 'medium',
    status: 'draft',
    ownerDetection: 'lastEditor',
    steps: [
      { type: 'notify', delay: 0, message: 'Bilgilendirme e-postası gönderildi' },
    ],
    createdAt: '2026-02-01',
    triggeredCount: 0,
  },
]

export const exceptions = [
  { id: 1, fileId: 8, fileName: 'tedarikci_sozlesmeleri.pdf', requestedBy: 'Ali Güneş', department: 'Hukuk', reason: 'Aktif sözleşme dosyası, erişim gerekli', status: 'approved', approvedBy: 'Yönetim', expiresAt: '2026-06-01', createdAt: '2026-02-16' },
  { id: 2, fileId: 2, fileName: 'maas_tablosu.xlsx', requestedBy: 'Zeynep Demir', department: 'İnsan Kaynakları', reason: 'Aylık bordro işlemleri için gerekli', status: 'pending', approvedBy: null, expiresAt: null, createdAt: '2026-02-22' },
]

export const auditLogs = [
  { id: 1, timestamp: '2026-02-23 14:32', action: 'scan_complete', target: '\\\\fileserver01\\paylaşım', details: '1,247 dosya tarandı, 3 kritik bulgu', user: 'Sistem' },
  { id: 2, timestamp: '2026-02-23 14:30', action: 'notification_sent', target: 'musteri_listesi_2026.xlsx', details: '1. uyarı e-postası gönderildi → Ahmet Yılmaz', user: 'Sistem' },
  { id: 3, timestamp: '2026-02-22 09:15', action: 'exception_requested', target: 'tedarikci_sozlesmeleri.pdf', details: 'İstisna talebi oluşturuldu', user: 'Ali Güneş' },
  { id: 4, timestamp: '2026-02-22 09:00', action: 'scan_complete', target: 'SharePoint - İnsan Kaynakları', details: '432 dosya tarandı, 1 kritik bulgu', user: 'Sistem' },
  { id: 5, timestamp: '2026-02-21 16:00', action: 'file_encrypted', target: 'hasta_kayitlari.pdf', details: 'Dosya şifrelenerek karantinaya alındı', user: 'Sistem' },
  { id: 6, timestamp: '2026-02-21 15:58', action: 'notification_sent', target: 'hasta_kayitlari.pdf', details: '3. (son) uyarı e-postası gönderildi → Fatma Öz', user: 'Sistem' },
  { id: 7, timestamp: '2026-02-20 10:00', action: 'policy_created', target: 'Orta Önem - Sadece Bildirim', details: 'Yeni politika oluşturuldu', user: 'Admin' },
  { id: 8, timestamp: '2026-02-19 14:00', action: 'file_resolved', target: 'proje_plani_v3.docx', details: 'Dosya sahibi tarafından silindi', user: 'Mehmet Kaya' },
  { id: 9, timestamp: '2026-02-18 11:30', action: 'exception_approved', target: 'tedarikci_sozlesmeleri.pdf', details: 'İstisna talebi onaylandı (son: 2026-06-01)', user: 'Yönetim' },
  { id: 10, timestamp: '2026-02-17 09:00', action: 'scan_started', target: 'Tüm lokasyonlar', details: 'Haftalık tarama başlatıldı', user: 'Sistem' },
]

export const workflowTemplates = [
  {
    id: 'critical-3-warn',
    name: 'Kritik Veri - 3 Uyarı + Şifreleme',
    description: 'Kritik veri tespit edildiğinde 3 defa 1 hafta arayla uyarı gönder, aksiyon alınmazsa şifrele',
    classification: 'critical',
    nodes: [
      { id: 'trigger-1', type: 'trigger', position: { x: 250, y: 0 }, data: { label: 'Kritik Veri Tespit Edildi', icon: 'AlertTriangle', config: { classification: 'critical' } } },
      { id: 'detect-owner-1', type: 'action', position: { x: 250, y: 100 }, data: { label: 'Dosya Sahibini Belirle', icon: 'UserSearch', config: { method: 'lastEditor' } } },
      { id: 'notify-1', type: 'notification', position: { x: 250, y: 200 }, data: { label: '1. Uyarı E-postası', icon: 'Mail', config: { template: 'warning_1', to: 'owner' } } },
      { id: 'wait-1', type: 'delay', position: { x: 250, y: 300 }, data: { label: '7 Gün Bekle', icon: 'Clock', config: { days: 7 } } },
      { id: 'check-1', type: 'condition', position: { x: 250, y: 400 }, data: { label: 'Aksiyon Alındı mı?', icon: 'GitBranch', config: { check: 'action_taken' } } },
      { id: 'notify-2', type: 'notification', position: { x: 400, y: 500 }, data: { label: '2. Uyarı E-postası', icon: 'Mail', config: { template: 'warning_2', to: 'owner' } } },
      { id: 'resolved-1', type: 'end', position: { x: 80, y: 500 }, data: { label: 'Çözüldü', icon: 'CheckCircle', config: {} } },
      { id: 'wait-2', type: 'delay', position: { x: 400, y: 600 }, data: { label: '7 Gün Bekle', icon: 'Clock', config: { days: 7 } } },
      { id: 'check-2', type: 'condition', position: { x: 400, y: 700 }, data: { label: 'Aksiyon Alındı mı?', icon: 'GitBranch', config: { check: 'action_taken' } } },
      { id: 'notify-3', type: 'notification', position: { x: 550, y: 800 }, data: { label: '3. (Son) Uyarı', icon: 'MailWarning', config: { template: 'warning_final', to: 'owner' } } },
      { id: 'resolved-2', type: 'end', position: { x: 230, y: 800 }, data: { label: 'Çözüldü', icon: 'CheckCircle', config: {} } },
      { id: 'wait-3', type: 'delay', position: { x: 550, y: 900 }, data: { label: '7 Gün Bekle', icon: 'Clock', config: { days: 7 } } },
      { id: 'check-3', type: 'condition', position: { x: 550, y: 1000 }, data: { label: 'Aksiyon Alındı mı?', icon: 'GitBranch', config: { check: 'action_taken' } } },
      { id: 'encrypt-1', type: 'action', position: { x: 700, y: 1100 }, data: { label: 'Dosyayı Şifrele', icon: 'Lock', config: { action: 'encrypt', destination: 'quarantine' } } },
      { id: 'resolved-3', type: 'end', position: { x: 380, y: 1100 }, data: { label: 'Çözüldü', icon: 'CheckCircle', config: {} } },
      { id: 'move-1', type: 'action', position: { x: 700, y: 1200 }, data: { label: 'Karantinaya Taşı', icon: 'FolderLock', config: { action: 'move', destination: '\\\\quarantine\\encrypted' } } },
      { id: 'notify-final', type: 'notification', position: { x: 700, y: 1300 }, data: { label: 'Şifreleme Bildirimi', icon: 'Bell', config: { template: 'encrypted_notice', to: 'owner+manager' } } },
      { id: 'end-1', type: 'end', position: { x: 700, y: 1400 }, data: { label: 'Tamamlandı', icon: 'CheckCircle2', config: {} } },
    ],
    edges: [
      { id: 'e-t1-do1', source: 'trigger-1', target: 'detect-owner-1', animated: true },
      { id: 'e-do1-n1', source: 'detect-owner-1', target: 'notify-1' },
      { id: 'e-n1-w1', source: 'notify-1', target: 'wait-1' },
      { id: 'e-w1-c1', source: 'wait-1', target: 'check-1' },
      { id: 'e-c1-n2', source: 'check-1', target: 'notify-2', label: 'Hayır', style: { stroke: '#ef4444' } },
      { id: 'e-c1-r1', source: 'check-1', target: 'resolved-1', label: 'Evet', style: { stroke: '#22c55e' } },
      { id: 'e-n2-w2', source: 'notify-2', target: 'wait-2' },
      { id: 'e-w2-c2', source: 'wait-2', target: 'check-2' },
      { id: 'e-c2-n3', source: 'check-2', target: 'notify-3', label: 'Hayır', style: { stroke: '#ef4444' } },
      { id: 'e-c2-r2', source: 'check-2', target: 'resolved-2', label: 'Evet', style: { stroke: '#22c55e' } },
      { id: 'e-n3-w3', source: 'notify-3', target: 'wait-3' },
      { id: 'e-w3-c3', source: 'wait-3', target: 'check-3' },
      { id: 'e-c3-enc', source: 'check-3', target: 'encrypt-1', label: 'Hayır', style: { stroke: '#ef4444' } },
      { id: 'e-c3-r3', source: 'check-3', target: 'resolved-3', label: 'Evet', style: { stroke: '#22c55e' } },
      { id: 'e-enc-mv', source: 'encrypt-1', target: 'move-1' },
      { id: 'e-mv-nf', source: 'move-1', target: 'notify-final' },
      { id: 'e-nf-end', source: 'notify-final', target: 'end-1' },
    ],
  },
  {
    id: 'high-2-warn',
    name: 'Yüksek Önem - 2 Uyarı + Taşıma',
    description: 'Yüksek önemli veri tespit edildiğinde 2 hafta arayla uyarı gönder, sonra güvenli alana taşı',
    classification: 'high',
    nodes: [
      { id: 'trigger-1', type: 'trigger', position: { x: 250, y: 0 }, data: { label: 'Yüksek Önemli Veri Tespit', icon: 'AlertTriangle', config: { classification: 'high' } } },
      { id: 'detect-owner-1', type: 'action', position: { x: 250, y: 100 }, data: { label: 'Dosya Sahibini Belirle', icon: 'UserSearch', config: { method: 'creator' } } },
      { id: 'notify-1', type: 'notification', position: { x: 250, y: 200 }, data: { label: '1. Uyarı E-postası', icon: 'Mail', config: { template: 'warning_1', to: 'owner' } } },
      { id: 'wait-1', type: 'delay', position: { x: 250, y: 300 }, data: { label: '14 Gün Bekle', icon: 'Clock', config: { days: 14 } } },
      { id: 'check-1', type: 'condition', position: { x: 250, y: 400 }, data: { label: 'Aksiyon Alındı mı?', icon: 'GitBranch', config: { check: 'action_taken' } } },
      { id: 'notify-2', type: 'notification', position: { x: 400, y: 500 }, data: { label: '2. Uyarı E-postası', icon: 'Mail', config: { template: 'warning_2', to: 'owner' } } },
      { id: 'resolved-1', type: 'end', position: { x: 80, y: 500 }, data: { label: 'Çözüldü', icon: 'CheckCircle', config: {} } },
      { id: 'wait-2', type: 'delay', position: { x: 400, y: 600 }, data: { label: '14 Gün Bekle', icon: 'Clock', config: { days: 14 } } },
      { id: 'check-2', type: 'condition', position: { x: 400, y: 700 }, data: { label: 'Aksiyon Alındı mı?', icon: 'GitBranch', config: { check: 'action_taken' } } },
      { id: 'move-1', type: 'action', position: { x: 550, y: 800 }, data: { label: 'Güvenli Alana Taşı', icon: 'FolderLock', config: { action: 'move', destination: '\\\\secure\\archive' } } },
      { id: 'resolved-2', type: 'end', position: { x: 230, y: 800 }, data: { label: 'Çözüldü', icon: 'CheckCircle', config: {} } },
      { id: 'notify-final', type: 'notification', position: { x: 550, y: 900 }, data: { label: 'Taşıma Bildirimi', icon: 'Bell', config: { template: 'moved_notice', to: 'owner+manager' } } },
      { id: 'end-1', type: 'end', position: { x: 550, y: 1000 }, data: { label: 'Tamamlandı', icon: 'CheckCircle2', config: {} } },
    ],
    edges: [
      { id: 'e-t1-do1', source: 'trigger-1', target: 'detect-owner-1', animated: true },
      { id: 'e-do1-n1', source: 'detect-owner-1', target: 'notify-1' },
      { id: 'e-n1-w1', source: 'notify-1', target: 'wait-1' },
      { id: 'e-w1-c1', source: 'wait-1', target: 'check-1' },
      { id: 'e-c1-n2', source: 'check-1', target: 'notify-2', label: 'Hayır', style: { stroke: '#ef4444' } },
      { id: 'e-c1-r1', source: 'check-1', target: 'resolved-1', label: 'Evet', style: { stroke: '#22c55e' } },
      { id: 'e-n2-w2', source: 'notify-2', target: 'wait-2' },
      { id: 'e-w2-c2', source: 'wait-2', target: 'check-2' },
      { id: 'e-c2-mv', source: 'check-2', target: 'move-1', label: 'Hayır', style: { stroke: '#ef4444' } },
      { id: 'e-c2-r2', source: 'check-2', target: 'resolved-2', label: 'Evet', style: { stroke: '#22c55e' } },
      { id: 'e-mv-nf', source: 'move-1', target: 'notify-final' },
      { id: 'e-nf-end', source: 'notify-final', target: 'end-1' },
    ],
  },
]

export const nodeTypes = [
  { type: 'trigger', label: 'Tetikleyici', icon: 'Zap', color: '#a855f7', description: 'Akışı başlatan olay' },
  { type: 'condition', label: 'Koşul', icon: 'GitBranch', color: '#3b82f6', description: 'Karar noktası (Evet/Hayır)' },
  { type: 'notification', label: 'Bildirim', icon: 'Mail', color: '#06b6d4', description: 'E-posta veya bildirim gönder' },
  { type: 'delay', label: 'Bekleme', icon: 'Clock', color: '#eab308', description: 'Belirli süre bekle' },
  { type: 'action', label: 'Aksiyon', icon: 'Cog', color: '#f97316', description: 'Şifrele, taşı, sil vb.' },
  { type: 'end', label: 'Bitiş', icon: 'CheckCircle', color: '#22c55e', description: 'Akış sonu' },
]
