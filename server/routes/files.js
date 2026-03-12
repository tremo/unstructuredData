import { Router } from 'express'
const router = Router()

// GET all detected files
router.get('/', async (req, res) => {
  try {
    const { classification, status, search } = req.query
    const where = {}
    if (classification) where.classification = classification
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { path: { contains: search } },
        { owner: { contains: search } },
      ]
    }
    const files = await req.prisma.detectedFile.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.json(files.map(f => ({ ...f, detectedData: JSON.parse(f.detectedData) })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single file
router.get('/:id', async (req, res) => {
  try {
    const file = await req.prisma.detectedFile.findUnique({ where: { id: parseInt(req.params.id) } })
    if (!file) return res.status(404).json({ error: 'Dosya bulunamadı' })
    res.json({ ...file, detectedData: JSON.parse(file.detectedData) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT update file status
router.put('/:id', async (req, res) => {
  try {
    const { status, notificationCount } = req.body
    const data = {}
    if (status !== undefined) data.status = status
    if (notificationCount !== undefined) data.notificationCount = notificationCount
    const file = await req.prisma.detectedFile.update({
      where: { id: parseInt(req.params.id) },
      data,
    })
    res.json({ ...file, detectedData: JSON.parse(file.detectedData) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE file
router.delete('/:id', async (req, res) => {
  try {
    await req.prisma.detectedFile.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET dashboard stats
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await req.prisma.detectedFile.count()
    const critical = await req.prisma.detectedFile.count({ where: { classification: 'critical' } })
    const pending = await req.prisma.detectedFile.count({ where: { status: 'pending' } })
    const encrypted = await req.prisma.detectedFile.count({ where: { status: 'encrypted' } })
    const resolved = await req.prisma.detectedFile.count({ where: { status: 'resolved' } })
    const locations = await req.prisma.scanLocation.count({ where: { status: 'active' } })
    res.json({ total, critical, pending, encrypted, resolved, activeLocations: locations })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
