import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { PrismaClient } from '@prisma/client'

import filesRouter from './routes/files.js'
import rulesRouter from './routes/rules.js'
import policiesRouter from './routes/policies.js'
import exceptionsRouter from './routes/exceptions.js'
import auditRouter from './routes/audit.js'
import workflowsRouter from './routes/workflows.js'
import settingsRouter from './routes/settings.js'
import scanLocationsRouter from './routes/scanLocations.js'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Make prisma available to routes
app.use((req, res, next) => {
  req.prisma = prisma
  next()
})

// API routes
app.use('/api/files', filesRouter)
app.use('/api/rules', rulesRouter)
app.use('/api/policies', policiesRouter)
app.use('/api/exceptions', exceptionsRouter)
app.use('/api/audit', auditRouter)
app.use('/api/workflows', workflowsRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/scan-locations', scanLocationsRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Sunucu hatası', message: err.message })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
