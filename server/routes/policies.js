import { Router } from 'express'
const router = Router()

// GET all policies
router.get('/', async (req, res) => {
  try {
    const policies = await req.prisma.policy.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(policies.map(p => ({ ...p, steps: JSON.parse(p.steps) })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create policy
router.post('/', async (req, res) => {
  try {
    const { name, classification, status, ownerDetection, steps } = req.body
    const policy = await req.prisma.policy.create({
      data: { name, classification, status: status || 'draft', ownerDetection: ownerDetection || 'lastEditor', steps: JSON.stringify(steps || []) },
    })
    res.status(201).json({ ...policy, steps: JSON.parse(policy.steps) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT update policy
router.put('/:id', async (req, res) => {
  try {
    const { name, classification, status, ownerDetection, steps } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (classification !== undefined) data.classification = classification
    if (status !== undefined) data.status = status
    if (ownerDetection !== undefined) data.ownerDetection = ownerDetection
    if (steps !== undefined) data.steps = JSON.stringify(steps)
    const policy = await req.prisma.policy.update({ where: { id: parseInt(req.params.id) }, data })
    res.json({ ...policy, steps: JSON.parse(policy.steps) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE policy
router.delete('/:id', async (req, res) => {
  try {
    await req.prisma.policy.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
