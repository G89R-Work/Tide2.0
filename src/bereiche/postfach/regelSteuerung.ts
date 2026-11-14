import type { Classnames, Combinator, ControlElementsProp, FullField, RuleGroupType, Translations } from 'react-querybuilder'
import { formatQuery } from 'react-querybuilder/formatQuery'
import { parseJsonLogic } from 'react-querybuilder/parseJsonLogic'
import { regelFelder, regelVergleiche } from '../../logik/regeln'
import { regelSchema, type Regel } from '../../vertrag/postfach'
import { Dazu, Wahl, Weg, Wert } from './RegelTeile'

// Einstellungen des Regel-Editors (react-querybuilder) im Tide-Aussehen; auf Modulebene, damit der Editor nicht bei jedem Zeichnen neu baut.

export const steuerung: ControlElementsProp<FullField, string> = {
  combinatorSelector: Wahl,
  fieldSelector: Wahl,
  operatorSelector: Wahl,
  valueEditor: Wert,
  addRuleAction: Dazu,
  removeRuleAction: Weg,
  addGroupAction: null,
}

export const felder = regelFelder.map((f) => ({ ...f }))
export const vergleiche = regelVergleiche.map((v) => ({ ...v }))
export const verknuepfungen: Combinator[] = [
  { name: 'and', label: 'alle Bedingungen' },
  { name: 'or', label: 'eine der Bedingungen' },
]

export const texte: Partial<Translations> = {
  addRule: { label: 'Bedingung', title: 'Bedingung hinzufügen' },
  removeRule: { label: '', title: 'Bedingung entfernen' },
  fields: { title: 'Feld' },
  operators: { title: 'Vergleich' },
  value: { title: 'Wert' },
  combinators: { title: 'Wenn' },
}

/** Lage der Teile: Kopf mit „Wenn … zutreffen“, darunter je Bedingung eine Zeile, am Handy umbrechend. */
export const klassen: Partial<Classnames> = {
  ruleGroup: 'flex flex-col gap-2',
  header: 'flex flex-wrap items-center gap-2',
  body: 'flex flex-col gap-2',
  rule: 'flex flex-wrap items-center gap-2',
}

/** Bedingung aus dem Vertrag → Editor; nur bekannte Felder (der Editor nimmt JsonLogic auch als Text). */
export const zuAbfrage = (b: Regel['bedingung']): RuleGroupType => parseJsonLogic(JSON.stringify(b), { fields: felder })

/** Editor → Bedingung im Vertrag; geprüft mit dem Schema des Vertrags, eine leere Abfrage trifft nichts. */
export const zuBedingung = (q: RuleGroupType): Regel['bedingung'] => regelSchema.shape.bedingung.safeParse(formatQuery(q, 'jsonlogic')).data ?? false
