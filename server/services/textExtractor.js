import fs from 'fs/promises'
import path from 'path'

/**
 * Dosya uzantısına göre metin çıkarma.
 * Desteklenen formatlar: PDF, DOCX, XLSX, CSV, TXT
 */

const SUPPORTED_EXTENSIONS = new Set([
  '.pdf', '.docx', '.xlsx', '.xls', '.csv', '.txt', '.msg', '.rtf',
])

export function isSupported(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return SUPPORTED_EXTENSIONS.has(ext)
}

export function getFileExtension(filePath) {
  return path.extname(filePath).toLowerCase()
}

async function extractPdf(filePath) {
  const pdfParse = (await import('pdf-parse')).default
  const buffer = await fs.readFile(filePath)
  const data = await pdfParse(buffer)
  return data.text
}

async function extractDocx(filePath) {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ path: filePath })
  return result.value
}

async function extractXlsx(filePath) {
  const XLSX = await import('xlsx')
  const workbook = XLSX.readFile(filePath)
  const texts = []
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(sheet)
    texts.push(csv)
  }
  return texts.join('\n')
}

async function extractText(filePath) {
  const content = await fs.readFile(filePath, 'utf-8')
  return content
}

/**
 * Verilen dosyadan metin çıkarır.
 * @param {string} filePath - Dosya yolu
 * @returns {Promise<string>} - Çıkarılan metin
 */
export async function extract(filePath) {
  const ext = getFileExtension(filePath)

  switch (ext) {
    case '.pdf':
      return extractPdf(filePath)
    case '.docx':
      return extractDocx(filePath)
    case '.xlsx':
    case '.xls':
      return extractXlsx(filePath)
    case '.csv':
    case '.txt':
    case '.msg':
    case '.rtf':
      return extractText(filePath)
    default:
      throw new Error(`Desteklenmeyen dosya formatı: ${ext}`)
  }
}

/**
 * Dosya boyutunu MB olarak döndürür.
 */
export async function getFileSizeMB(filePath) {
  const stat = await fs.stat(filePath)
  return stat.size / (1024 * 1024)
}
