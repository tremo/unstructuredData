import { Router } from 'express'
const router = Router()

// GET all rules
router.get('/', async (req, res) => {
  try {
    const rules = await req.prisma.rule.findMany({ orderBy: { createdAt: 'asc' } })
    res.json(rules.map(r => ({ ...r, fileTypes: JSON.parse(r.fileTypes) })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create rule
router.post('/', async (req, res) => {
  try {
    const { name, pattern, dataType, classification, fileTypes, enabled, description } = req.body
    const rule = await req.prisma.rule.create({
      data: { name, pattern, dataType, classification, fileTypes: JSON.stringify(fileTypes || []), enabled: enabled !== false, description: description || '' },
    })
    res.status(201).json({ ...rule, fileTypes: JSON.parse(rule.fileTypes) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT update rule
router.put('/:id', async (req, res) => {
  try {
    const { name, pattern, dataType, classification, fileTypes, enabled, description } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (pattern !== undefined) data.pattern = pattern
    if (dataType !== undefined) data.dataType = dataType
    if (classification !== undefined) data.classification = classification
    if (fileTypes !== undefined) data.fileTypes = JSON.stringify(fileTypes)
    if (enabled !== undefined) data.enabled = enabled
    if (description !== undefined) data.description = description
    const rule = await req.prisma.rule.update({ where: { id: parseInt(req.params.id) }, data })
    res.json({ ...rule, fileTypes: JSON.parse(rule.fileTypes) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE rule
router.delete('/:id', async (req, res) => {
  try {
    await req.prisma.rule.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
