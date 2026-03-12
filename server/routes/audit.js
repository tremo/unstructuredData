import { Router } from 'express'
const router = Router()

// GET all audit logs
router.get('/', async (req, res) => {
  try {
    const { action, search } = req.query
    const where = {}
    if (action) where.action = action
    if (search) {
      where.OR = [
        { target: { contains: search } },
        { details: { contains: search } },
        { user: { contains: search } },
      ]
    }
    const logs = await req.prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.json(logs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create audit log entry
router.post('/', async (req, res) => {
  try {
    const { action, target, details, user } = req.body
    const timestamp = new Date().toLocaleString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')
    const log = await req.prisma.auditLog.create({
      data: { timestamp, action, target, details, user: user || 'Sistem' },
    })
    res.status(201).json(log)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
