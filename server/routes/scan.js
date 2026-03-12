import { Router } from 'express'
import { startScan, pauseScan, resumeScan, cancelScan, getScanState, addProgressListener } from '../services/scanner.js'

const router = Router()

// POST /api/scan/start - Tarama başlat
router.post('/start', async (req, res) => {
  try {
    const { locationIds } = req.body || {}
    // Taramayı arka planda başlat
    startScan(req.prisma, { locationIds }).catch(err => {
      console.error('Tarama hatası:', err.message)
    })
    res.json({ success: true, message: 'Tarama başlatıldı', state: getScanState() })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/scan/pause - Tarama durakla
router.post('/pause', (req, res) => {
  try {
    pauseScan()
    res.json({ success: true, message: 'Tarama duraklatıldı', state: getScanState() })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/scan/resume - Tarama devam ettir
router.post('/resume', (req, res) => {
  try {
    resumeScan()
    res.json({ success: true, message: 'Tarama devam ediyor', state: getScanState() })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/scan/cancel - Tarama iptal et
router.post('/cancel', (req, res) => {
  try {
    cancelScan()
    res.json({ success: true, message: 'Tarama iptal edildi', state: getScanState() })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// GET /api/scan/status - Tarama durumu
router.get('/status', (req, res) => {
  res.json(getScanState())
})

// GET /api/scan/progress - SSE ile gerçek zamanlı ilerleme
router.get('/progress', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  // Mevcut durumu hemen gönder
  res.write(`data: ${JSON.stringify({ event: 'status', data: getScanState() })}\n\n`)

  // Listener kaydet
  const listener = (event, data) => {
    try {
      res.write(`data: ${JSON.stringify({ event, data })}\n\n`)
    } catch {
      // Bağlantı kopmuş
    }
  }

  const removeListener = addProgressListener(listener)

  // Bağlantı kapandığında listener'ı kaldır
  req.on('close', () => {
    removeListener()
  })
})

export default router
