import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Scan Locations
  await prisma.scanLocation.createMany({
    data: [
      { name: '\\\\fileserver01\\paylaşım', type: 'SMB', status: 'active', lastScan: '2026-02-23 14:30' },
      { name: '\\\\fileserver02\\hr-docs', type: 'SMB', status: 'active', lastScan: '2026-02-23 12:15' },
      { name: 'SharePoint - İnsan Kaynakları', type: 'SharePoint', status: 'active', lastScan: '2026-02-22 09:00' },
      { name: 'OneDrive - Finans Departmanı', type: 'OneDrive', status: 'paused', lastScan: '2026-02-20 16:45' },
      { name: '\\\\nas01\\projeler', type: 'NFS', status: 'active', lastScan: '2026-02-23 08:00' },
    ],
  })

  // Detected Files
  await prisma.detectedFile.createMany({
    data: [
      { name: 'musteri_listesi_2026.xlsx', path: '\\\\fileserver01\\paylaşım\\satış', classification: 'critical', size: '2.4 MB', owner: 'Ahmet Yılmaz', lastModified: '2026-02-20', detectedData: JSON.stringify(['TCKN', 'Telefon', 'E-posta']), status: 'pending', notificationCount: 0 },
      { name: 'maas_tablosu.xlsx', path: '\\\\fileserver02\\hr-docs\\bordro', classification: 'critical', size: '1.8 MB', owner: 'Zeynep Demir', lastModified: '2026-02-18', detectedData: JSON.stringify(['TCKN', 'IBAN', 'Maaş Bilgisi']), status: 'notified', notificationCount: 2 },
      { name: 'proje_plani_v3.docx', path: '\\\\nas01\\projeler\\alpha', classification: 'medium', size: '540 KB', owner: 'Mehmet Kaya', lastModified: '2026-02-21', detectedData: JSON.stringify(['İç Strateji']), status: 'resolved', notificationCount: 1 },
      { name: 'hasta_kayitlari.pdf', path: 'SharePoint - İnsan Kaynakları\\saglik', classification: 'critical', size: '5.1 MB', owner: 'Fatma Öz', lastModified: '2026-01-15', detectedData: JSON.stringify(['Sağlık Verisi', 'TCKN', 'Adres']), status: 'encrypted', notificationCount: 3 },
      { name: 'kurumsal_sunum.pptx', path: '\\\\fileserver01\\paylaşım\\pazarlama', classification: 'low', size: '12 MB', owner: 'Can Arslan', lastModified: '2026-02-22', detectedData: JSON.stringify(['Genel Bilgi']), status: 'resolved', notificationCount: 0 },
      { name: 'butce_raporu_Q1.xlsx', path: 'OneDrive - Finans Departmanı\\raporlar', classification: 'high', size: '3.2 MB', owner: 'Elif Şahin', lastModified: '2026-02-19', detectedData: JSON.stringify(['Finansal Veri', 'Bütçe']), status: 'notified', notificationCount: 1 },
      { name: 'personel_cv_arsiv.zip', path: '\\\\fileserver02\\hr-docs\\ise-alim', classification: 'critical', size: '45 MB', owner: 'Zeynep Demir', lastModified: '2026-02-10', detectedData: JSON.stringify(['TCKN', 'Adres', 'Fotoğraf']), status: 'pending', notificationCount: 0 },
      { name: 'tedarikci_sozlesmeleri.pdf', path: '\\\\nas01\\projeler\\hukuk', classification: 'high', size: '8.7 MB', owner: 'Ali Güneş', lastModified: '2026-02-15', detectedData: JSON.stringify(['Ticari Sır', 'Fiyat Bilgisi']), status: 'exception', notificationCount: 2 },
    ],
  })

  // Rules
  await prisma.rule.createMany({
    data: [
      { name: 'TCKN Tespiti', pattern: '\\b[1-9]\\d{10}\\b', dataType: 'TCKN', classification: 'critical', fileTypes: JSON.stringify(['XLSX', 'DOCX', 'PDF', 'CSV', 'TXT']), enabled: true, description: 'TC Kimlik Numarası deseni' },
      { name: 'IBAN Tespiti', pattern: 'TR\\d{2}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{2}', dataType: 'IBAN', classification: 'critical', fileTypes: JSON.stringify(['XLSX', 'DOCX', 'PDF', 'CSV']), enabled: true, description: 'Türk IBAN formatı' },
      { name: 'E-posta Adresi', pattern: '[\\w.-]+@[\\w.-]+\\.\\w{2,}', dataType: 'E-posta', classification: 'high', fileTypes: JSON.stringify(['XLSX', 'DOCX', 'TXT', 'CSV', 'MSG']), enabled: true, description: 'E-posta adresi deseni' },
      { name: 'Telefon Numarası', pattern: '(\\+90|0)\\s?[5]\\d{2}\\s?\\d{3}\\s?\\d{2}\\s?\\d{2}', dataType: 'Telefon', classification: 'high', fileTypes: JSON.stringify(['XLSX', 'DOCX', 'PDF', 'CSV', 'TXT']), enabled: true, description: 'Türk cep telefonu formatı' },
      { name: 'Kredi Kartı', pattern: '\\b(?:\\d[ -]*?){13,16}\\b', dataType: 'Kredi Kartı', classification: 'critical', fileTypes: JSON.stringify(['XLSX', 'CSV', 'TXT', 'PDF']), enabled: true, description: 'Kredi kartı numarası deseni' },
      { name: 'Sağlık Verisi Anahtar Kelime', pattern: '(tanı|teşhis|tedavi|ilaç|reçete|ameliyat|hasta)', dataType: 'Sağlık Verisi', classification: 'critical', fileTypes: JSON.stringify(['DOCX', 'PDF', 'TXT', 'XLSX']), enabled: false, description: 'Sağlık ile ilgili anahtar kelimeler' },
      { name: 'Maaş/Ücret Bilgisi', pattern: '(maaş|ücret|bordro|brüt|net|AGİ)', dataType: 'Maaş Bilgisi', classification: 'critical', fileTypes: JSON.stringify(['XLSX', 'PDF', 'DOCX']), enabled: true, description: 'Maaş ve ücret ile ilgili anahtar kelimeler' },
    ],
  })

  // Policies
  await prisma.policy.createMany({
    data: [
      {
        name: 'Kritik Veri - 3 Uyarı ve Şifreleme',
        classification: 'critical',
        status: 'active',
        ownerDetection: 'lastEditor',
        steps: JSON.stringify([
          { type: 'notify', delay: 0, message: '1. uyarı e-postası gönderildi' },
          { type: 'notify', delay: 7, message: '2. uyarı e-postası gönderildi' },
          { type: 'notify', delay: 14, message: '3. (son) uyarı e-postası gönderildi' },
          { type: 'encrypt', delay: 21, message: 'Dosya şifrelenerek karantinaya alındı' },
          { type: 'notify_final', delay: 21, message: 'Şifreleme bildirimi gönderildi' },
        ]),
        triggeredCount: 24,
      },
      {
        name: 'Yüksek Önem - 2 Uyarı ve Taşıma',
        classification: 'high',
        status: 'active',
        ownerDetection: 'creator',
        steps: JSON.stringify([
          { type: 'notify', delay: 0, message: '1. uyarı e-postası gönderildi' },
          { type: 'notify', delay: 14, message: '2. uyarı e-postası gönderildi' },
          { type: 'move', delay: 28, message: 'Dosya güvenli alana taşındı' },
        ]),
        triggeredCount: 12,
      },
      {
        name: 'Orta Önem - Sadece Bildirim',
        classification: 'medium',
        status: 'draft',
        ownerDetection: 'lastEditor',
        steps: JSON.stringify([
          { type: 'notify', delay: 0, message: 'Bilgilendirme e-postası gönderildi' },
        ]),
        triggeredCount: 0,
      },
    ],
  })

  // Exceptions
  await prisma.exception.createMany({
    data: [
      { fileId: 8, fileName: 'tedarikci_sozlesmeleri.pdf', requestedBy: 'Ali Güneş', department: 'Hukuk', reason: 'Aktif sözleşme dosyası, erişim gerekli', status: 'approved', approvedBy: 'Yönetim', expiresAt: '2026-06-01' },
      { fileId: 2, fileName: 'maas_tablosu.xlsx', requestedBy: 'Zeynep Demir', department: 'İnsan Kaynakları', reason: 'Aylık bordro işlemleri için gerekli', status: 'pending', approvedBy: null, expiresAt: null },
    ],
  })

  // Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { timestamp: '2026-02-23 14:32', action: 'scan_complete', target: '\\\\fileserver01\\paylaşım', details: '1,247 dosya tarandı, 3 kritik bulgu', user: 'Sistem' },
      { timestamp: '2026-02-23 14:30', action: 'notification_sent', target: 'musteri_listesi_2026.xlsx', details: '1. uyarı e-postası gönderildi → Ahmet Yılmaz', user: 'Sistem' },
      { timestamp: '2026-02-22 09:15', action: 'exception_requested', target: 'tedarikci_sozlesmeleri.pdf', details: 'İstisna talebi oluşturuldu', user: 'Ali Güneş' },
      { timestamp: '2026-02-22 09:00', action: 'scan_complete', target: 'SharePoint - İnsan Kaynakları', details: '432 dosya tarandı, 1 kritik bulgu', user: 'Sistem' },
      { timestamp: '2026-02-21 16:00', action: 'file_encrypted', target: 'hasta_kayitlari.pdf', details: 'Dosya şifrelenerek karantinaya alındı', user: 'Sistem' },
      { timestamp: '2026-02-21 15:58', action: 'notification_sent', target: 'hasta_kayitlari.pdf', details: '3. (son) uyarı e-postası gönderildi → Fatma Öz', user: 'Sistem' },
      { timestamp: '2026-02-20 10:00', action: 'policy_created', target: 'Orta Önem - Sadece Bildirim', details: 'Yeni politika oluşturuldu', user: 'Admin' },
      { timestamp: '2026-02-19 14:00', action: 'file_resolved', target: 'proje_plani_v3.docx', details: 'Dosya sahibi tarafından silindi', user: 'Mehmet Kaya' },
      { timestamp: '2026-02-18 11:30', action: 'exception_approved', target: 'tedarikci_sozlesmeleri.pdf', details: 'İstisna talebi onaylandı (son: 2026-06-01)', user: 'Yönetim' },
      { timestamp: '2026-02-17 09:00', action: 'scan_started', target: 'Tüm lokasyonlar', details: 'Haftalık tarama başlatıldı', user: 'Sistem' },
    ],
  })

  // Workflow Templates
  const criticalTemplate = {
    name: 'Kritik Veri - 3 Uyarı + Şifreleme',
    description: 'Kritik veri tespit edildiğinde 3 defa 1 hafta arayla uyarı gönder, aksiyon alınmazsa şifrele',
    classification: 'critical',
    isTemplate: true,
    nodes: JSON.stringify([
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
    ]),
    edges: JSON.stringify([
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
    ]),
  }

  const highTemplate = {
    name: 'Yüksek Önem - 2 Uyarı + Taşıma',
    description: 'Yüksek önemli veri tespit edildiğinde 2 hafta arayla uyarı gönder, sonra güvenli alana taşı',
    classification: 'high',
    isTemplate: true,
    nodes: JSON.stringify([
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
    ]),
    edges: JSON.stringify([
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
    ]),
  }

  await prisma.workflow.create({ data: criticalTemplate })
  await prisma.workflow.create({ data: highTemplate })

  // Default Settings
  await prisma.setting.createMany({
    data: [
      { key: 'email', value: JSON.stringify({ smtpServer: 'smtp.kurum.com.tr', smtpPort: '587', fromAddress: 'veri-koruma@kurum.com.tr', fromName: 'Veri Koruma Sistemi', useTLS: true }) },
      { key: 'schedule', value: JSON.stringify({ scanFrequency: 'daily', scanTime: '02:00', retentionDays: 90, maxFileSize: 100, concurrentScans: 4 }) },
      { key: 'notifications', value: JSON.stringify({ enableEmail: true, enableSlack: false, enableTeams: true, digestFrequency: 'daily', escalateAfterDays: 7, ccManager: true, ccDPO: true }) },
    ],
  })

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
