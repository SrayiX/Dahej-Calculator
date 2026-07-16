/* ============================================================
   CONTENT BANK
   Processing messages, ranks, badges, roasts, confidence copy.
   Kept separate from logic so tone can be tuned without
   touching scoring.js or any UI module.
   ============================================================ */

export const PROCESSING_MESSAGES = [
  'Initializing Bureau systems…',
  'Verifying applicant identity…',
  'Checking educational records…',
  'Reviewing professional credentials…',
  'Evaluating monthly income…',
  'Inspecting vehicle ownership…',
  'Cross-referencing bike specifications…',
  'Cross-referencing car specifications…',
  'Reviewing asset portfolio…',
  'Assessing skills & certifications…',
  'Scanning lifestyle indicators…',
  'Consulting the Random Uncle Database…',
  'Cross-checking family WhatsApp groups…',
  'Negotiating with imaginary relatives…',
  'Calculating official market value…',
  'Generating certificate of evaluation…',
  'Assessment complete.',
];

/* Ranks ordered low → high. `min` is the inclusive lower bound
   on the normalized 0–100 composite score. */
export const RANKS = [
  { min: 0,  title: 'Provisional Candidate' },
  { min: 20, title: 'Registered Applicant' },
  { min: 35, title: 'Verified Prospect' },
  { min: 50, title: 'Neighbourhood Favourite' },
  { min: 65, title: 'Premium Candidate' },
  { min: 80, title: 'Certified Negotiation Expert' },
  { min: 92, title: 'Legendary Prospect' },
];

export const BADGES = [
  { min: 0,  title: 'Under Review' },
  { min: 20, title: 'Ready for Introductions' },
  { min: 35, title: 'Aunty-Approved (Tentatively)' },
  { min: 50, title: 'Group Chat Sensation' },
  { min: 65, title: 'Prime Rishta Material' },
  { min: 80, title: 'Biodata Blue-Chip' },
  { min: 92, title: 'National Treasure' },
];

/* Roasts are light, wholesome teasing — never about appearance,
   family, religion, or anything personal/sensitive. Grouped by
   score band so the tone escalates from gently humbling to
   affectionately smug. */
export const ROASTS = {
  low: [
    "The Bureau has seen potential in worse files. Barely.",
    "Your file is less 'rishta ready' and more 'work in progress'.",
    "Even your side hustle filed for a transfer request.",
    "The committee needs a moment. And some tea. And a miracle.",
    "Your spreadsheet of assets fits in the margin notes.",
  ],
  mid: [
    "Solid file. Nothing scandalous, nothing spectacular — very marriageable.",
    "You're the reliable Wi-Fi of candidates: decent, occasionally impressive.",
    "The aunties are cautiously optimistic about your prospects.",
    "Your bike brand is doing more talking than your bank statement.",
    "Respectable numbers. The Bureau nods slowly, unimpressed but not upset.",
  ],
  high: [
    "Your Royal Enfield alone could carry this negotiation.",
    "The neighbourhood aunties have already begun negotiations.",
    "Your imaginary market value has appreciated overnight.",
    "The Bureau's committee just sat up a little straighter.",
    "Multiple biodatas are being drafted about you as we speak.",
  ],
  top: [
    "The Bureau requests you slow down — you're breaking the curve.",
    "Certificate printed in gold ink. This never happens.",
    "Somewhere, a matchmaking group chat just went silent in awe.",
    "You didn't take the assessment. The assessment took notes from you.",
    "The committee has unanimously requested your autograph, not your biodata.",
  ],
};

export function pickRoast(normalizedScore, seedIndex) {
  let band;
  if (normalizedScore < 35) band = ROASTS.low;
  else if (normalizedScore < 65) band = ROASTS.mid;
  else if (normalizedScore < 88) band = ROASTS.high;
  else band = ROASTS.top;
  return band[seedIndex % band.length];
}

export function pickFromLadder(ladder, normalizedScore) {
  let picked = ladder[0];
  for (const entry of ladder) {
    if (normalizedScore >= entry.min) picked = entry;
  }
  return picked.title;
}
