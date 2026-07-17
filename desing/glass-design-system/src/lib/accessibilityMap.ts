import type { Database } from './database.types'

export type A11yNeed    = Database['public']['Enums']['user_accessibility_need']
export type A11yFeature = Database['public']['Enums']['accessibility_feature']

/**
 * Aproximação inicial entre a necessidade declarada no perfil do usuário e os
 * recursos de acessibilidade cadastrados pelas empresas. Usado para pré-preencher
 * a busca a partir do perfil — o usuário pode sempre ajustar manualmente.
 */
export const NEED_TO_FEATURES: Record<A11yNeed, A11yFeature[]> = {
  motora:           ['rampa', 'elevador', 'banheiro_adaptado', 'vaga_pcd', 'piso_tatil', 'cadeira_rodas', 'entrada_acessivel'],
  visual:           ['braille', 'audiodescricao'],
  auditiva:         ['libras'],
  intelectual:      [],
  tea:              [],
  neurodivergencia: [],
  nenhuma:          [],
}

export function mapNeedsToFeatures(needs: A11yNeed[]): A11yFeature[] {
  const set = new Set<A11yFeature>()
  for (const need of needs) {
    for (const feature of NEED_TO_FEATURES[need] ?? []) set.add(feature)
  }
  return Array.from(set)
}
