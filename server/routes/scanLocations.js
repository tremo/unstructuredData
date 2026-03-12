import { Router } from 'express'
const router = Router()

// GET all scan locations
router.get('/', async (req, res) => {
  try {
    const locations = await req.prisma.scanLocation.findMany({ orderBy: { id: 'asc' } })
    res.json(locations)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create scan location
router.post('/', async (req, res) => {
  try {
    const { name, type } = req.body
    const location = await req.prisma.scanLocation.create({
      data: { name, type, status: 'active' },
    })
    res.status(201).json(location)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT update scan location
router.put('/:id', async (req, res) => {
  try {
    const { status, lastScan } = req.body
    const data = {}
    if (status !== undefined) data.status = status
    if (lastScan !== undefined) data.lastScan = lastScan
    const location = await req.prisma.scanLocation.update({ where: { id: parseInt(req.params.id) }, data })
    res.json(location)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE scan location
router.delete('/:id', async (req, res) => {
  try {
    await req.prisma.scanLocation.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
