/**
 * 09 — Component Composition · Styles
 *
 * Plain object — class names map to themselves.
 */
export const styles = {
  // ── Card shell ──────────────────────────────────────
  card: 'card',
  header: 'header',
  body: 'body',

  // ── Section labels ──────────────────────────────────
  sectionLabel: 'sectionLabel',
  sectionIcon: 'sectionIcon',
  sectionTitle: 'sectionTitle',
  sectionCode: 'sectionCode',

  // ── Section boxes ───────────────────────────────────
  sectionBox: 'sectionBox',
  desc: 'desc',
  demoArea: 'demoArea',
  demoText: 'demoText',

  // ── Fragment demo ───────────────────────────────────
  fragmentPreview: 'fragmentPreview',
  fragmentLabel: 'fragmentLabel',
  fragmentNodes: 'fragmentNodes',
  fragmentNode: 'fragmentNode',
  fragmentNodeNew: 'fragmentNodeNew',
  fragmentNote: 'fragmentNote',
  nodeTag: 'nodeTag',

  // ── Two column layout ───────────────────────────────
  twoCol: 'twoCol',

  // ── Inner Card (layout component demo) ──────────────
  innerCard: 'innerCard',
  innerCardHeader: 'innerCardHeader',
  innerCardBody: 'innerCardBody',
  cardAccentPurple: 'cardAccentPurple',
  cardAccentGreen: 'cardAccentGreen',
  cardAccentPink: 'cardAccentPink',
  cardAccentAmber: 'cardAccentAmber',

  // ── Custom header demo ──────────────────────────────
  customHeaderDemo: 'customHeaderDemo',
  customHeaderIcon: 'customHeaderIcon',

  // ── Slot showcase ───────────────────────────────────
  slotShowcase: 'slotShowcase',
  slotItem: 'slotItem',
  slotName: 'slotName',
  slotArrow: 'slotArrow',
  slotDesc: 'slotDesc',

  // ── Badge row ───────────────────────────────────────
  badgeRow: 'badgeRow',

  // ── User grid & profiles ────────────────────────────
  userGrid: 'userGrid',
  profileHeader: 'profileHeader',
  profileInfo: 'profileInfo',
  profileName: 'profileName',
  profileBody: 'profileBody',
  profileRole: 'profileRole',
  profileId: 'profileId',

  // ── Primitives showcase ─────────────────────────────
  primitivesRow: 'primitivesRow',
  primitiveCard: 'primitiveCard',
  primitivePreview: 'primitivePreview',
  primitiveName: 'primitiveName',
  primitiveDesc: 'primitiveDesc',
  miniCard: 'miniCard',
  miniCardHdr: 'miniCardHdr',
  miniCardBody: 'miniCardBody',

  // ── Buttons ─────────────────────────────────────────
  btnPrimary: 'btnPrimary',
  btnHint: 'btnHint',

  // ── Badge variants ──────────────────────────────────
  badge: 'badge',
  badgeInfo: 'badgeInfo',
  badgeSuccess: 'badgeSuccess',
  badgeWarning: 'badgeWarning',
  badgeAccent: 'badgeAccent',

  // ── Avatar ──────────────────────────────────────────
  avatar: 'avatar',
  avGrad0: 'avGrad0',
  avGrad1: 'avGrad1',
  avGrad2: 'avGrad2',
  avGrad3: 'avGrad3',
} as const;
