import { Router } from 'express'
const router = Router()

// GET all exceptions
router.get('/', async (req, res) => {
  try {
    const exceptions = await req.prisma.exception.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(exceptions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create exception
router.post('/', async (req, res) => {
  try {
    const { fileId, fileName, requestedBy, department, reason, expiresAt } = req.body
    const exception = await req.prisma.exception.create({
      data: { fileId, fileName, requestedBy, department, reason, expiresAt },
    })
    // Update file status
    await req.prisma.detectedFile.update({ where: { id: fileId }, data: { status: 'exception' } })
    res.status(201).json(exception)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT update exception (approve/reject)
router.put('/:id', async (req, res) => {
  try {
    const { status, approvedBy, expiresAt } = req.body
    const data = {}
    if (status !== undefined) data.status = status
    if (approvedBy !== undefined) data.approvedBy = approvedBy
    if (expiresAt !== undefined) data.expiresAt = expiresAt
    const exception = await req.prisma.exception.update({ where: { id: parseInt(req.params.id) }, data })
    res.json(exception)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE exception
router.delete('/:id', async (req, res) => {
  try {
    await req.prisma.exception.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
