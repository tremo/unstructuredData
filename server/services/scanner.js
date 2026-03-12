import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { extract, isSupported, getFileSizeMB, getFileExtension } from './textExtractor.js'
import { matchAllRules } from './patternMatcher.js'

/**
 * Dosya Tarama Motoru
 *
 * Performans kontrolleri:
 * - concurrentScans: Aynı anda işlenen dosya sayısı
 * - throttleDelay: Her dosya arasında bekleme (ms)
 * - batchSize: Kaç dosyadan sonra mola verilir
 * - batchPauseMs: Batch arası mola süresi (ms)
 * - maxFileSize: Bu MB'den büyük dosyalar atlanır
 * - pauseOnHighLoad: CPU yükü yüksekse otomatik duraklat
 * - cpuThreshold: CPU yük eşiği (%)
 */

const DEFAULT_PERFORMANCE = {
  concurrentScans: 2,
  throttleDelay: 100,
  batchSize: 50,
  batchPauseMs: 2000,
  maxFileSize: 100,
  pauseOnHighLoad: true,
  cpuThreshold: 80,
  scanPriority: 'normal', // low, normal, high
}

const PRIORITY_MULTIPLIERS = {
  low: 3,    // 3x daha yavaş
  normal: 1,
  high: 0.5, // 2x daha hızlı
}

// Aktif tarama durumu
const scanState = {
  running: false,
  paused: false,
  cancelled: false,
  progress: {
    totalFiles: 0,
    scannedFiles: 0,
    skippedFiles: 0,
    detectedFiles: 0,
    currentFile: '',
    startedAt: null,
    errors: [],
  },
  listeners: new Set(), // SSE listeners
}

export function getScanState() {
  return {
    running: scanState.running,
    paused: scanState.paused,
    progress: { ...scanState.progress },
  }
}

// SSE listener yönetimi
export function addProgressListener(listener) {
  scanState.listeners.add(listener)
  return () => scanState.listeners.delete(listener)
}

function notifyListeners(event, data) {
  for (const listener of scanState.listeners) {
    try {
      listener(event, data)
    } catch {
      scanState.listeners.delete(listener)
    }
  }
}

function emitProgress() {
  notifyListeners('progress', getScanState())
}

/**
 * CPU kullanım yüzdesini hesaplar.
 */
function getCpuUsagePercent() {
  const cpus = os.cpus()
  let totalIdle = 0
  let totalTick = 0
  for (const cpu of cpus) {
    for (const type of Object.keys(cpu.times)) {
      totalTick += cpu.times[type]
    }
    totalIdle += cpu.times.idle
  }
  return Math.round(((totalTick - totalIdle) / totalTick) * 100)
}

/**
 * Belirli ms kadar bekler.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Dizin altındaki tüm dosyaları recursive olarak listeler.
 */
async function walkDirectory(dirPath) {
  const files = []
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      if (entry.isDirectory()) {
        const subFiles = await walkDirectory(fullPath)
        files.push(...subFiles)
      } else if (entry.isFile() && isSupported(fullPath)) {
        files.push(fullPath)
      }
    }
  } catch (err) {
    console.warn(`Dizin okunamadı: ${dirPath}`, err.message)
  }
  return files
}

/**
 * Performans ayarlarını CPU yükü ve önceliğe göre throttle uygulayarak bekler.
 */
async function applyThrottle(perfSettings) {
  const multiplier = PRIORITY_MULTIPLIERS[perfSettings.scanPriority] || 1
  const delay = Math.round(perfSettings.throttleDelay * multiplier)

  if (delay > 0) {
    await sleep(delay)
  }

  // CPU yükü kontrolü
  if (perfSettings.pauseOnHighLoad) {
    let cpuUsage = getCpuUsagePercent()
    while (cpuUsage > perfSettings.cpuThreshold) {
      notifyListeners('throttled', { cpuUsage, threshold: perfSettings.cpuThreshold })
      await sleep(3000) // CPU düşene kadar 3sn bekle
      cpuUsage = getCpuUsagePercent()

      if (scanState.cancelled) break
    }
  }
}

/**
 * Tek bir dosyayı tarar.
 */
async function scanSingleFile(filePath, rules, perfSettings) {
  try {
    // Boyut kontrolü
    const sizeMB = await getFileSizeMB(filePath)
    if (sizeMB > perfSettings.maxFileSize) {
      return { skipped: true, reason: 'size', sizeMB }
    }

    const ext = getFileExtension(filePath)
    const text = await extract(filePath)

    if (!text || text.trim().length === 0) {
      return { skipped: true, reason: 'empty' }
    }

    const result = matchAllRules(text, rules, ext)

    if (result.matches.length > 0) {
      return {
        detected: true,
        filePath,
        fileName: path.basename(filePath),
        sizeMB: sizeMB.toFixed(2),
        ...result,
      }
    }

    return { detected: false }
  } catch (err) {
    return { error: true, message: err.message, filePath }
  }
}

/**
 * Concurrency-limited parallel processing.
 * Aynı anda en fazla `limit` dosya işlenir.
 */
async function processWithConcurrency(files, handler, limit) {
  const results = []
  let index = 0

  async function worker() {
    while (index < files.length) {
      if (scanState.cancelled) break

      // Pause kontrolü
      while (scanState.paused && !scanState.cancelled) {
        await sleep(500)
      }

      const currentIndex = index++
      if (currentIndex >= files.length) break

      const result = await handler(files[currentIndex], currentIndex)
      results.push(result)
    }
  }

  const workers = Array.from({ length: Math.min(limit, files.length) }, () => worker())
  await Promise.all(workers)
  return results
}

/**
 * Ana tarama fonksiyonu.
 *
 * @param {object} prisma - Prisma client
 * @param {object} options - { locationIds?: number[] } — boşsa tüm aktif lokasyonlar
 * @returns {Promise<object>} - Tarama sonuç özeti
 */
export async function startScan(prisma, options = {}) {
  if (scanState.running) {
    throw new Error('Bir tarama zaten devam ediyor')
  }

  // Durumu sıfırla
  scanState.running = true
  scanState.paused = false
  scanState.cancelled = false
  scanState.progress = {
    totalFiles: 0,
    scannedFiles: 0,
    skippedFiles: 0,
    detectedFiles: 0,
    currentFile: '',
    startedAt: new Date().toISOString(),
    errors: [],
  }

  try {
    // Performans ayarlarını oku
    const perfSetting = await prisma.setting.findUnique({ where: { key: 'performance' } })
    const perfSettings = perfSetting
      ? { ...DEFAULT_PERFORMANCE, ...JSON.parse(perfSetting.value) }
      : { ...DEFAULT_PERFORMANCE }

    // Schedule ayarlarından maxFileSize ve concurrentScans'i al (geri uyumluluk)
    const scheduleSetting = await prisma.setting.findUnique({ where: { key: 'schedule' } })
    if (scheduleSetting) {
      const schedule = JSON.parse(scheduleSetting.value)
      if (schedule.maxFileSize) perfSettings.maxFileSize = schedule.maxFileSize
      if (schedule.concurrentScans) perfSettings.concurrentScans = schedule.concurrentScans
    }

    // Aktif kuralları al
    const rules = await prisma.rule.findMany({ where: { enabled: true } })
    if (rules.length === 0) {
      throw new Error('Aktif kural bulunamadı. Lütfen en az bir kural tanımlayın.')
    }

    // Taranacak lokasyonları al
    const whereLocation = { status: 'active' }
    if (options.locationIds && options.locationIds.length > 0) {
      whereLocation.id = { in: options.locationIds }
    }
    const locations = await prisma.scanLocation.findMany({ where: whereLocation })

    if (locations.length === 0) {
      throw new Error('Aktif tarama noktası bulunamadı.')
    }

    notifyListeners('started', { locations: locations.length, rules: rules.length, settings: perfSettings })

    // Tüm lokasyonlardan dosyaları topla
    let allFiles = []
    for (const location of locations) {
      const files = await walkDirectory(location.name)
      allFiles.push(...files.map(f => ({ filePath: f, locationId: location.id, locationName: location.name })))
    }

    scanState.progress.totalFiles = allFiles.length
    emitProgress()

    if (allFiles.length === 0) {
      scanState.running = false
      notifyListeners('completed', scanState.progress)
      return scanState.progress
    }

    // Batch + concurrency ile tara
    let batchCount = 0

    await processWithConcurrency(
      allFiles,
      async (fileInfo, idx) => {
        if (scanState.cancelled) return

        scanState.progress.currentFile = fileInfo.filePath
        emitProgress()

        // Throttle uygula
        await applyThrottle(perfSettings)

        const result = await scanSingleFile(fileInfo.filePath, rules, perfSettings)

        if (result.skipped) {
          scanState.progress.skippedFiles++
        } else if (result.error) {
          scanState.progress.errors.push({ file: fileInfo.filePath, message: result.message })
        } else if (result.detected) {
          scanState.progress.detectedFiles++

          // Veritabanına kaydet
          const stat = await fs.stat(fileInfo.filePath)
          await prisma.detectedFile.upsert({
            where: { id: undefined },
            create: {
              name: result.fileName,
              path: path.dirname(fileInfo.filePath),
              classification: result.classification,
              size: `${result.sizeMB} MB`,
              owner: stat.uid !== undefined ? `UID:${stat.uid}` : 'Bilinmiyor',
              lastModified: stat.mtime.toISOString().split('T')[0],
              detectedData: JSON.stringify(result.detectedData),
              status: 'pending',
              notificationCount: 0,
            },
            update: {},
          }).catch(async () => {
            // upsert olmuyorsa, aynı path+name varsa güncelle yoksa oluştur
            const existing = await prisma.detectedFile.findFirst({
              where: { name: result.fileName, path: path.dirname(fileInfo.filePath) },
            })
            if (existing) {
              await prisma.detectedFile.update({
                where: { id: existing.id },
                data: {
                  classification: result.classification,
                  detectedData: JSON.stringify(result.detectedData),
                  lastModified: stat.mtime.toISOString().split('T')[0],
                  size: `${result.sizeMB} MB`,
                },
              })
            } else {
              await prisma.detectedFile.create({
                data: {
                  name: result.fileName,
                  path: path.dirname(fileInfo.filePath),
                  classification: result.classification,
                  size: `${result.sizeMB} MB`,
                  owner: stat.uid !== undefined ? `UID:${stat.uid}` : 'Bilinmiyor',
                  lastModified: stat.mtime.toISOString().split('T')[0],
                  detectedData: JSON.stringify(result.detectedData),
                  status: 'pending',
                  notificationCount: 0,
                },
              })
            }
          })
        }

        scanState.progress.scannedFiles++
        emitProgress()

        // Batch mola kontrolü
        batchCount++
        if (batchCount >= perfSettings.batchSize) {
          batchCount = 0
          notifyListeners('batch_pause', { pauseMs: perfSettings.batchPauseMs })
          await sleep(perfSettings.batchPauseMs)
        }
      },
      perfSettings.concurrentScans,
    )

    // Lokasyonların son tarama zamanını güncelle
    const now = new Date().toLocaleString('tr-TR', { hour12: false }).replace(',', '')
    for (const location of locations) {
      await prisma.scanLocation.update({
        where: { id: location.id },
        data: { lastScan: now },
      })
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        timestamp: now,
        action: 'scan_complete',
        target: locations.map(l => l.name).join(', '),
        details: `${scanState.progress.scannedFiles} dosya tarandı, ${scanState.progress.detectedFiles} bulgu tespit edildi`,
        user: 'Sistem',
      },
    })

    scanState.running = false
    const finalProgress = { ...scanState.progress }
    notifyListeners('completed', finalProgress)
    return finalProgress
  } catch (err) {
    scanState.running = false
    scanState.progress.errors.push({ message: err.message })
    notifyListeners('error', { message: err.message })
    throw err
  }
}

/**
 * Taramayı duraklatır.
 */
export function pauseScan() {
  if (!scanState.running) throw new Error('Aktif tarama yok')
  scanState.paused = true
  notifyListeners('paused', scanState.progress)
}

/**
 * Duraklatılmış taramayı devam ettirir.
 */
export function resumeScan() {
  if (!scanState.running) throw new Error('Aktif tarama yok')
  scanState.paused = false
  notifyListeners('resumed', scanState.progress)
}

/**
 * Taramayı iptal eder.
 */
export function cancelScan() {
  if (!scanState.running) throw new Error('Aktif tarama yok')
  scanState.cancelled = true
  scanState.paused = false
  notifyListeners('cancelled', scanState.progress)
}
