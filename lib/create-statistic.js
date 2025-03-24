const { defaultCounty } = require('../config')

const requiredFields = {
  // Spørsmålstegn betyr optional
  system: 'avsendersystem',
  engine: 'navnet på den tekniske løsningen',
  company: 'Hvilken sektor tilhører statistikkelementet',
  '?county': 'Hvilket fylke tilhører oppføringen',
  '?department': 'Hvilken underenhet tilhører statistikkelementet',
  description: 'Beskrivelse av jobben som er gjort for dette elementet',
  type: 'typenavn som skal entydig skille ulike statistikkgrupperinger, slik at den kan søkes på for å få opp like elementer',
  '?externalId': 'Id fra avgivende system, for å kunne finne igjen tilsvarende element i avgivende system',
  '?projectId': 'Prosjekt id fra innovasjonsløypa'
}

const createStatistic = (data) => {
  // Går gjennom det som er sendt inn - sjekker at alle required er med, og riktig type. Feilmelding hvis ikke
  const missingFields = []
  const errorTypes = []
  for (const [prop, value] of Object.entries(requiredFields)) {
    const propName = prop.replace('?', '')
    if (data[propName] && typeof data[propName] !== typeof value) errorTypes.push(`${propName} must be "${typeof value}"`)
    if (!prop.startsWith('?') && !data[propName]) missingFields.push(`"${propName}"`)
  }
  if (missingFields.length > 0 || errorTypes.length > 0) throw new Error(`Missing required fields or type in body. Missing fields: [${missingFields.join(', ')}]. Error types: [${errorTypes.join(', ')}]`)

  // Check that structure is flat
  const notFlat = []
  for (const [prop, value] of Object.entries(data)) {
    if ((value !== null && (typeof value === 'object')) || (typeof value === 'undefined')) notFlat.push(`Illegal type "${typeof value}" found in property "${prop}"`)
  }
  if (notFlat.length > 0) throw new Error(notFlat.join(', '))

  // All required fields are here - continue
  let stat = {
    system: data.system,
    engine: data.engine,
    createdTimestamp: new Date().toISOString(),
    county: data.county || defaultCounty,
    company: data.company,
    department: data.department || data.company,
    description: data.description,
    projectId: data.projectId || 'ingen prosjekttilknytning',
    externalId: data.externalId || 'ukjent'
  }
  // Make sure no one overrides standard fields
  for (const prop of Object.keys(stat)) {
    delete data[prop]
  }
  stat = { ...stat, ...data }
  return stat
}

module.exports = { createStatistic }
