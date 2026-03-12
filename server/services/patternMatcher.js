/**
 * Metin içinde Rules tablosundaki regex pattern'leri arar.
 * Her eşleşme için veri tipi ve sınıflandırma bilgisi döndürür.
 */

/**
 * Tek bir pattern'i metin üzerinde çalıştırır.
 * @param {string} text - Taranan dosyanın metni
 * @param {object} rule - { id, name, pattern, dataType, classification, fileTypes, enabled }
 * @param {string} fileExtension - Dosya uzantısı (örn. '.xlsx')
 * @returns {object|null} - Eşleşme varsa { dataType, classification, matchCount, ruleName, ruleId }
 */
export function matchRule(text, rule, fileExtension) {
  if (!rule.enabled) return null

  // Dosya tipi kontrolü
  const ext = fileExtension.replace('.', '').toUpperCase()
  const allowedTypes = Array.isArray(rule.fileTypes)
    ? rule.fileTypes
    : JSON.parse(rule.fileTypes || '[]')

  if (allowedTypes.length > 0 && !allowedTypes.includes(ext)) {
    return null
  }

  try {
    const regex = new RegExp(rule.pattern, 'gi')
    const matches = text.match(regex)
    if (matches && matches.length > 0) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        dataType: rule.dataType,
        classification: rule.classification,
        matchCount: matches.length,
      }
    }
  } catch (err) {
    // Geçersiz regex — sessizce atla
    console.warn(`Geçersiz regex pattern (rule: ${rule.name}):`, err.message)
  }

  return null
}

/**
 * Tüm aktif kuralları metin üzerinde çalıştırır.
 * @param {string} text - Dosya metni
 * @param {Array} rules - Kural listesi
 * @param {string} fileExtension - Dosya uzantısı
 * @returns {{ detectedData: string[], classification: string, matches: Array }}
 */
export function matchAllRules(text, rules, fileExtension) {
  const matches = []
  const detectedDataSet = new Set()
  let highestClassification = 'low'

  const classificationOrder = { low: 0, medium: 1, high: 2, critical: 3 }

  for (const rule of rules) {
    const result = matchRule(text, rule, fileExtension)
    if (result) {
      matches.push(result)
      detectedDataSet.add(result.dataType)
      if (classificationOrder[result.classification] > classificationOrder[highestClassification]) {
        highestClassification = result.classification
      }
    }
  }

  return {
    detectedData: Array.from(detectedDataSet),
    classification: highestClassification,
    matches,
  }
}
