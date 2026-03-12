import { Router } from 'express'
const router = Router()

// GET all settings
router.get('/', async (req, res) => {
  try {
    const settings = await req.prisma.setting.findMany()
    const result = {}
    for (const s of settings) {
      result[s.key] = JSON.parse(s.value)
    }
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single setting by key
router.get('/:key', async (req, res) => {
  try {
    const setting = await req.prisma.setting.findUnique({ where: { key: req.params.key } })
    if (!setting) return res.status(404).json({ error: 'Ayar bulunamadı' })
    res.json({ key: setting.key, value: JSON.parse(setting.value) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT upsert setting
router.put('/:key', async (req, res) => {
  try {
    const { value } = req.body
    const setting = await req.prisma.setting.upsert({
      where: { key: req.params.key },
      update: { value: JSON.stringify(value) },
      create: { key: req.params.key, value: JSON.stringify(value) },
    })
    res.json({ key: setting.key, value: JSON.parse(setting.value) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
