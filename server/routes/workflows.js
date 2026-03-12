import { Router } from 'express'
const router = Router()

// GET all workflows (optionally filter by isTemplate)
router.get('/', async (req, res) => {
  try {
    const where = {}
    if (req.query.templates === 'true') where.isTemplate = true
    if (req.query.templates === 'false') where.isTemplate = false
    const workflows = await req.prisma.workflow.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.json(workflows.map(w => ({
      ...w,
      nodes: JSON.parse(w.nodes),
      edges: JSON.parse(w.edges),
    })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single workflow
router.get('/:id', async (req, res) => {
  try {
    const workflow = await req.prisma.workflow.findUnique({ where: { id: parseInt(req.params.id) } })
    if (!workflow) return res.status(404).json({ error: 'İş akışı bulunamadı' })
    res.json({ ...workflow, nodes: JSON.parse(workflow.nodes), edges: JSON.parse(workflow.edges) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create workflow
router.post('/', async (req, res) => {
  try {
    const { name, description, classification, nodes, edges, isTemplate } = req.body
    const workflow = await req.prisma.workflow.create({
      data: {
        name, description: description || '', classification: classification || '',
        nodes: JSON.stringify(nodes || []), edges: JSON.stringify(edges || []),
        isTemplate: isTemplate || false,
      },
    })
    res.status(201).json({ ...workflow, nodes: JSON.parse(workflow.nodes), edges: JSON.parse(workflow.edges) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT update workflow
router.put('/:id', async (req, res) => {
  try {
    const { name, description, classification, nodes, edges } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (classification !== undefined) data.classification = classification
    if (nodes !== undefined) data.nodes = JSON.stringify(nodes)
    if (edges !== undefined) data.edges = JSON.stringify(edges)
    const workflow = await req.prisma.workflow.update({ where: { id: parseInt(req.params.id) }, data })
    res.json({ ...workflow, nodes: JSON.parse(workflow.nodes), edges: JSON.parse(workflow.edges) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE workflow
router.delete('/:id', async (req, res) => {
  try {
    await req.prisma.workflow.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
