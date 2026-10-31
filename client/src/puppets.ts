import type { Background, Kind, Prop, PuppetColor } from '../../shared/puppets';

/* Pattachitra palette: bold ink outlines, flat vermilion, ochre, indigo, leaf green and conch white. */
const INK = '#1e1611';
const GOLD = '#e8b437';
const CREAM = '#f2ead8';
const SKIN = '#c98b5b';
const HAIR = '#1e1611';

export const COLOR_HEX: Record<PuppetColor, string> = {
  red: '#c8341f',
  yellow: '#e8b437',
  green: '#3e7b3a',
  blue: '#2e5aa8',
  orange: '#e07b24',
  white: '#f2ead8',
  purple: '#6b3a8c',
  pink: '#d9648a',
  black: '#3a302a',
  brown: '#8a5a3a',
};

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => {
    const c = (n >> shift) & 255;
    const v = amount < 0 ? c * (1 + amount) : c + (255 - c) * amount;
    return Math.round(Math.max(0, Math.min(255, v)));
  };
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

const line = `stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;

/* Props, drawn around the hand at (0, 0) */
export function propSvg(prop: Prop): string {
  switch (prop) {
    case 'coin':
      return `<circle r="6" fill="${GOLD}" ${line}/><circle r="2.5" fill="none" stroke="${INK}" stroke-width="1.2"/>`;
    case 'treasure':
      return `<rect x="-11" y="-4" width="22" height="14" rx="2" fill="#8a5a3a" ${line}/><path d="M-11 0 Q0 -12 11 0" fill="${GOLD}" ${line}/><circle cx="0" cy="3" r="2" fill="${GOLD}"/>`;
    case 'sword':
      return `<path d="M0 0 L0 -40" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M0 0 L0 -40" stroke="#c9d3d6" stroke-width="3.4" stroke-linecap="round"/><path d="M-6 -2 L6 -2" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/>`;
    case 'flute':
      return `<path d="M-14 4 L22 -10" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M-14 4 L22 -10" stroke="#d9a15a" stroke-width="3.6" stroke-linecap="round"/><circle cx="6" cy="-4" r=".9" fill="${INK}"/><circle cx="12" cy="-6" r=".9" fill="${INK}"/>`;
    case 'lamp':
      return `<path d="M-8 2 Q0 10 8 2 Z" fill="#a0603a" ${line}/><path class="pc-flame" d="M0 -9 C3 -4 3 -1 0 1 C-3 -1 -3 -4 0 -9 Z" fill="#f2913d"/>`;
    case 'book':
      return `<rect x="-12" y="-5" width="24" height="9" rx="2" fill="#e1c79a" ${line}/><path d="M-8 -1 H8 M-8 2 H5" stroke="${INK}" stroke-width="1"/>`;
    case 'pot':
      return `<path d="M-8 -6 H8 L6 -2 Q12 6 0 12 Q-12 6 -6 -2 Z" fill="#b5532c" ${line}/><path d="M-6 2 H6" stroke="${CREAM}" stroke-width="1.6"/>`;
    case 'flower':
      return `<path d="M0 6 L0 -4" stroke="#3e7b3a" stroke-width="2.4"/><path d="M0 -6 C-6 -14 -2 -18 0 -20 C2 -18 6 -14 0 -6 Z M0 -6 C-10 -10 -12 -4 -12 -2 C-8 -2 -4 -2 0 -6 Z M0 -6 C10 -10 12 -4 12 -2 C8 -2 4 -2 0 -6 Z" fill="#d9648a" ${line}/>`;
    case 'fruit':
      return `<path d="M0 -8 C8 -8 9 4 2 8 C-6 10 -9 0 -5 -5 C-3 -7 -2 -8 0 -8 Z" fill="${GOLD}" ${line}/><path d="M0 -8 L3 -13" stroke="#3e7b3a" stroke-width="2"/>`;
    case 'basket':
      return `<path d="M-12 -4 H12 L9 8 H-9 Z" fill="#b8862e" ${line}/><path d="M-10 0 H10 M-9 4 H9" stroke="${INK}" stroke-width="1"/><path d="M-10 -4 Q0 -18 10 -4" fill="none" ${line}/>`;
    case 'staff':
      return `<path d="M0 -26 L2 62" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M0 -26 L2 62" stroke="#8a5a3a" stroke-width="3.6" stroke-linecap="round"/>`;
    case 'crown':
      return `<path d="M-10 4 L-10 -6 L-5 -1 L0 -10 L5 -1 L10 -6 L10 4 Z" fill="${GOLD}" ${line}/>`;
    case 'ring':
      return `<circle r="5" fill="none" stroke="${INK}" stroke-width="4.4"/><circle r="5" fill="none" stroke="${GOLD}" stroke-width="2.4"/><circle cy="-5" r="2.4" fill="#c8341f"/>`;
    case 'net':
      return `<path d="M-14 -8 L14 -8 L10 12 L-10 12 Z" fill="none" ${line}/><path d="M-12 -2 H12 M-11 4 H11 M-6 -8 L-4 12 M0 -8 V12 M6 -8 L4 12" stroke="${INK}" stroke-width="1"/>`;
    case 'shuttle':
      return `<path d="M-14 0 Q0 -7 14 0 Q0 7 -14 0 Z" fill="#d9a15a" ${line}/><path d="M-4 0 H4" stroke="${COLOR_HEX.red}" stroke-width="2.4"/>`;
    default:
      return '';
  }
}

/* People */

type HumanKind = Extract<Kind, 'king' | 'queen' | 'prince' | 'princess' | 'man' | 'woman' | 'boy' | 'girl' | 'old-man' | 'old-woman' | 'sage' | 'merchant' | 'soldier' | 'thief' | 'priest' | 'god'>;

interface Look {
  fem: boolean;
  skin: string;
  head: 'crown' | 'tiara' | 'turban' | 'topknot' | 'helmet' | 'shaved' | 'hair' | 'veil';
  hair: string;
  beard?: boolean;
  mustache?: boolean;
  mask?: boolean;
  halo?: boolean;
  tilak?: boolean;
  jewels?: boolean;
  bent?: boolean;
}

const LOOKS: Record<HumanKind, Look> = {
  king: { fem: false, skin: SKIN, head: 'crown', hair: HAIR, mustache: true, jewels: true, tilak: true },
  queen: { fem: true, skin: SKIN, head: 'tiara', hair: HAIR, jewels: true },
  prince: { fem: false, skin: SKIN, head: 'crown', hair: HAIR, jewels: true },
  princess: { fem: true, skin: SKIN, head: 'tiara', hair: HAIR, jewels: true },
  man: { fem: false, skin: SKIN, head: 'hair', hair: HAIR, mustache: true },
  woman: { fem: true, skin: SKIN, head: 'hair', hair: HAIR },
  boy: { fem: false, skin: SKIN, head: 'hair', hair: HAIR },
  girl: { fem: true, skin: SKIN, head: 'hair', hair: HAIR },
  'old-man': { fem: false, skin: '#b98258', head: 'turban', hair: '#ddd6c8', beard: true, bent: true },
  'old-woman': { fem: true, skin: '#b98258', head: 'veil', hair: '#ddd6c8', bent: true },
  sage: { fem: false, skin: SKIN, head: 'topknot', hair: '#5a4636', beard: true, tilak: true },
  merchant: { fem: false, skin: SKIN, head: 'turban', hair: HAIR, mustache: true, jewels: true },
  soldier: { fem: false, skin: SKIN, head: 'helmet', hair: HAIR, mustache: true },
  thief: { fem: false, skin: SKIN, head: 'hair', hair: HAIR, mask: true },
  priest: { fem: false, skin: SKIN, head: 'shaved', hair: HAIR, tilak: true },
  god: { fem: false, skin: '#3e74c9', head: 'crown', hair: HAIR, halo: true, jewels: true, tilak: true },
};

function headwear(l: Look, accent: string): string {
  switch (l.head) {
    case 'crown':
      return `<path d="M35 31 L35 17 L41 23 L45 9 L50 18 L55 9 L59 23 L65 17 L65 31 Z" fill="${GOLD}" ${line}/><circle cx="50" cy="25" r="2.6" fill="${COLOR_HEX.red}"/><path d="M50 9 L50 4" ${line}/>`;
    case 'tiara':
      return `<path d="M37 30 L39 22 L44 26 L50 18 L56 26 L61 22 L63 30 Q50 26 37 30 Z" fill="${GOLD}" ${line}/><circle cx="50" cy="25" r="2" fill="${COLOR_HEX.red}"/>`;
    case 'turban':
      return `<path d="M32 37 Q32 19 50 18 Q68 19 68 37 Q50 29 32 37 Z" fill="${accent}" ${line}/><path d="M36 30 Q50 22 64 30" fill="none" stroke="${INK}" stroke-width="1.2"/><circle cx="50" cy="24" r="2.6" fill="${GOLD}" stroke="${INK}" stroke-width="1"/>`;
    case 'topknot':
      return `<path d="M34 40 Q36 24 50 24 Q64 24 66 40 Q60 32 50 32 Q40 32 34 40 Z" fill="${l.hair}"/><ellipse cx="50" cy="21" rx="8" ry="7" fill="${l.hair}" ${line}/><path d="M44 21 H56" stroke="${GOLD}" stroke-width="2"/>`;
    case 'helmet':
      return `<path d="M33 37 Q33 18 50 16 Q67 18 67 37 Z" fill="#9aa3a8" ${line}/><path d="M50 16 L50 7" ${line}/><path d="M33 34 H67" stroke="${GOLD}" stroke-width="3"/>`;
    case 'shaved':
      return `<path d="M50 26 Q55 18 49 13" fill="none" ${line}/>`;
    case 'veil':
      return '';
    default:
      return l.fem ? '' : `<path d="M34 40 Q36 24 50 24 Q64 24 66 40 Q60 32 50 32 Q40 32 34 40 Z" fill="${l.hair}"/>`;
  }
}

function humanSvg(kind: HumanKind, color: string): string {
  const l = LOOKS[kind];
  const top = color;
  const bottom = l.fem ? shade(color, -0.25) : kind === 'king' || kind === 'prince' || kind === 'god' ? GOLD : CREAM;
  const accent = kind === 'old-man' ? CREAM : shade(color, 0.25);
  const veil = l.fem && (l.head === 'veil' || l.head === 'tiara') ? `<path d="M31 36 Q50 12 69 36 L74 76 L26 76 Z" fill="${shade(color, 0.35)}" opacity=".92" ${line}/>` : '';
  const longHair = l.fem && l.head !== 'veil' ? `<circle cx="50" cy="40" r="19" fill="${l.hair}"/><circle cx="64" cy="27" r="7.5" fill="${l.hair}" ${line}/><circle cx="67" cy="23" r="3.2" fill="${CREAM}"/>` : '';
  const halo = l.halo ? `<circle cx="50" cy="38" r="27" fill="none" stroke="${GOLD}" stroke-width="3.4" opacity=".9"/>` : '';

  const legs = l.fem
    ? `<ellipse cx="42" cy="165" rx="6" ry="3" fill="${l.skin}" ${line}/><ellipse cx="58" cy="165" rx="6" ry="3" fill="${l.skin}" ${line}/>`
    : `<g class="p-leg p-leg-l" style="transform-origin:43px 128px"><path d="M40 126 L38 162 L47 162 L48 126 Z" fill="${l.skin}" ${line}/><ellipse cx="41" cy="164" rx="7" ry="3.2" fill="${l.skin}" ${line}/></g>
       <g class="p-leg p-leg-r" style="transform-origin:57px 128px"><path d="M52 126 L53 162 L62 162 L60 126 Z" fill="${l.skin}" ${line}/><ellipse cx="59" cy="164" rx="7" ry="3.2" fill="${l.skin}" ${line}/></g>`;
  const lower = l.fem
    ? `<path d="M34 100 L66 100 L73 164 L27 164 Z" fill="${bottom}" ${line}/><path d="M29 155 L71 155" stroke="${GOLD}" stroke-width="4"/>`
    : `<path d="M34 100 L66 100 L64 134 L52 137 L50 122 L48 137 L36 134 Z" fill="${bottom}" ${line}/><path d="M35 104 H65" stroke="${shade(bottom, -0.3)}" stroke-width="2"/>`;
  const drape = l.fem ? `<path d="M62 62 L37 101 L46 102 L66 70 Z" fill="${CREAM}" ${line}/>` : '';
  const jewels = l.jewels ? `<path d="M41 66 Q50 76 59 66" fill="none" stroke="${GOLD}" stroke-width="3"/><circle cx="50" cy="73" r="2.4" fill="${COLOR_HEX.red}"/>` : '';
  const beard = l.beard ? `<path d="M35 46 Q37 68 50 73 Q63 68 65 46 Q58 57 50 57 Q42 57 35 46 Z" fill="${l.hair}" ${line}/>` : '';
  const mustache = l.mustache ? `<path d="M43 50 Q50 46 57 50 Q50 49 43 50 Z" fill="${INK}" stroke="${INK}" stroke-width="1.6"/>` : '';
  const mask = l.mask ? `<rect x="35" y="37" width="30" height="9" rx="3" fill="${INK}"/>` : '';
  const tilak = l.tilak ? `<path d="M50 30 L50 36" stroke="${COLOR_HEX.red}" stroke-width="2.4" stroke-linecap="round"/>` : '';

  return `<svg class="puppet human" viewBox="0 0 100 170" aria-hidden="true"><g class="p-whole"${l.bent ? ' data-bent' : ''}>
    ${legs}
    <g class="p-upper" style="transform-origin:50px 110px">
      ${lower}
      <path d="M36 64 Q50 58 64 64 L66 102 L34 102 Z" fill="${top}" ${line}/>
      ${drape}${jewels}
      <g class="p-arm p-arm-l" style="transform-origin:37px 67px"><path d="M37 66 Q31 84 31 100" fill="none" stroke="${INK}" stroke-width="9.4" stroke-linecap="round"/><path d="M37 66 Q31 84 31 100" fill="none" stroke="${l.skin}" stroke-width="6.4" stroke-linecap="round"/><circle cx="31" cy="102" r="4.2" fill="${l.skin}" ${line}/></g>
      <g class="p-arm p-arm-r" style="transform-origin:63px 67px"><path d="M63 66 Q69 84 69 100" fill="none" stroke="${INK}" stroke-width="9.4" stroke-linecap="round"/><path d="M63 66 Q69 84 69 100" fill="none" stroke="${l.skin}" stroke-width="6.4" stroke-linecap="round"/><circle cx="69" cy="102" r="4.2" fill="${l.skin}" ${line}/><g class="p-prop" transform="translate(69 102)"></g></g>
      <rect x="46" y="52" width="8" height="10" fill="${l.skin}"/>
      <g class="p-head" style="transform-origin:50px 58px">
        ${halo}${veil}${longHair}
        <ellipse cx="34" cy="44" rx="3" ry="4.5" fill="${l.skin}" ${line}/><ellipse cx="66" cy="44" rx="3" ry="4.5" fill="${l.skin}" ${line}/>
        <circle cx="50" cy="42" r="16" fill="${l.skin}" ${line}/>
        ${headwear(l, accent)}${beard}${mask}${tilak}
        <g class="p-eyes" style="transform-origin:50px 41px">
          <path d="M38.5 42 Q44 36.5 49 42 Q44 45.5 38.5 42 Z" fill="#fff" stroke="${INK}" stroke-width="1.5"/><circle cx="44.6" cy="41.4" r="2.1" fill="${INK}"/>
          <path d="M51 42 Q56 36.5 61.5 42 Q56 45.5 51 42 Z" fill="#fff" stroke="${INK}" stroke-width="1.5"/><circle cx="55.6" cy="41.4" r="2.1" fill="${INK}"/>
        </g>
        <path class="p-eyes-shut" d="M39 42 Q44 45 49 42 M51 42 Q56 45 61 42" fill="none" stroke="${INK}" stroke-width="1.6"/>
        <path class="p-brows" d="M38.5 36.5 Q44 33.5 49 36.5 M51 36.5 Q56 33.5 61.5 36.5" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M50 43 L48.4 48 L51.2 48" fill="none" stroke="${INK}" stroke-width="1.2"/>
        ${mustache}
        <path class="p-mouth-shut" d="M45 52.5 Q50 55.5 55 52.5" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
        <ellipse class="p-mouth-open" cx="50" cy="53" rx="3.6" ry="2.8" fill="#7a1f17" stroke="${INK}" stroke-width="1.4" style="transform-origin:50px 53px"/>
        <g class="p-tears"><path d="M42 46 q-1.5 4 0 6 q1.5 -2 0 -6 Z" fill="#7fc4ff"/><path d="M58 46 q-1.5 4 0 6 q1.5 -2 0 -6 Z" fill="#7fc4ff"/></g>
      </g>
    </g>
  </g></svg>`;
}

function ghostSvg(): string {
  return `<svg class="puppet ghost" viewBox="0 0 100 170" aria-hidden="true"><g class="p-whole">
    <g class="p-upper" style="transform-origin:50px 110px">
      <path d="M28 60 Q26 120 34 150 Q40 160 44 150 Q48 164 54 150 Q60 162 64 148 Q72 120 72 60 Z" fill="#e9e6f2" opacity=".92" ${line}/>
      <g class="p-arm p-arm-l" style="transform-origin:32px 70px"><path d="M32 70 Q20 84 22 98" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M32 70 Q20 84 22 98" fill="none" stroke="#e9e6f2" stroke-width="5" stroke-linecap="round"/></g>
      <g class="p-arm p-arm-r" style="transform-origin:68px 70px"><path d="M68 70 Q80 84 78 98" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M68 70 Q80 84 78 98" fill="none" stroke="#e9e6f2" stroke-width="5" stroke-linecap="round"/><g class="p-prop" transform="translate(78 100)"></g></g>
      <g class="p-head" style="transform-origin:50px 58px">
        <circle cx="50" cy="44" r="20" fill="#f4f1fa" ${line}/>
        <g class="p-eyes" style="transform-origin:50px 42px"><ellipse cx="43" cy="42" rx="5" ry="6.5" fill="${INK}"/><ellipse cx="57" cy="42" rx="5" ry="6.5" fill="${INK}"/><circle cx="43" cy="42" r="1.8" fill="#f2913d"/><circle cx="57" cy="42" r="1.8" fill="#f2913d"/></g>
        <path class="p-eyes-shut" d="M38 42 Q43 45 48 42 M52 42 Q57 45 62 42" fill="none" stroke="${INK}" stroke-width="1.6"/>
        <path class="p-brows" d="M37 34 Q43 31 48 34 M52 34 Q57 31 63 34" fill="none" stroke="${INK}" stroke-width="1.6"/>
        <path class="p-mouth-shut" d="M44 54 Q50 58 56 54" fill="none" stroke="${INK}" stroke-width="1.6"/>
        <ellipse class="p-mouth-open" cx="50" cy="55" rx="4" ry="3.6" fill="${INK}" style="transform-origin:50px 55px"/>
        <g class="p-tears"></g>
      </g>
    </g>
  </g></svg>`;
}

/* Animals: one four-legged template covers most of them; the elephant, birds and snake are drawn on their own. */

interface Beast {
  body: string;
  belly?: string;
  ears: 'point' | 'flop' | 'round';
  tail: 'bushy' | 'thin' | 'curl' | 'tuft';
  leg: number;
  snout: number;
  stripes?: boolean;
  spots?: boolean;
  horns?: boolean;
  hump?: boolean;
  mane?: boolean;
  antlers?: boolean;
  cloth?: boolean;
}

function quadrupedSvg(b: Beast): string {
  const cy = 104 - b.leg - 16;
  const legs = [44, 60, 92, 108]
    .map((x, i) => `<g class="a-leg a-leg-${i % 2 ? 'b' : 'a'}" style="transform-origin:${x + 5}px ${cy + 8}px"><rect x="${x}" y="${cy + 6}" width="11" height="${104 - cy - 6}" rx="5" fill="${shade(b.body, i < 2 ? -0.12 : 0)}" ${line}/></g>`)
    .join('');
  const tail = {
    bushy: `<path d="M34 ${cy - 4} Q10 ${cy - 4} 8 ${cy + 18} Q22 ${cy + 10} 34 ${cy + 6} Z" fill="${b.body}" ${line}/><path d="M10 ${cy + 14} Q12 ${cy + 8} 16 ${cy + 8}" stroke="${CREAM}" stroke-width="3" fill="none"/>`,
    thin: `<path d="M34 ${cy - 4} Q14 ${cy + 4} 18 ${cy + 30}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M34 ${cy - 4} Q14 ${cy + 4} 18 ${cy + 30}" fill="none" stroke="${b.body}" stroke-width="2.6" stroke-linecap="round"/>`,
    curl: `<path d="M34 ${cy - 6} Q16 ${cy - 26} 26 ${cy - 30} Q34 ${cy - 30} 30 ${cy - 20}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M34 ${cy - 6} Q16 ${cy - 26} 26 ${cy - 30} Q34 ${cy - 30} 30 ${cy - 20}" fill="none" stroke="${b.body}" stroke-width="3.4" stroke-linecap="round"/>`,
    tuft: `<path d="M34 ${cy - 4} Q22 ${cy + 8} 22 ${cy + 28}" fill="none" stroke="${INK}" stroke-width="4"/><path d="M18 ${cy + 26} Q22 ${cy + 40} 26 ${cy + 26} Z" fill="${INK}"/>`,
  }[b.tail];
  const hx = 124;
  const hy = cy - 16;
  const ears = {
    point: `<path d="M${hx - 12} ${hy - 8} L${hx - 10} ${hy - 26} L${hx - 2} ${hy - 12} Z M${hx + 2} ${hy - 12} L${hx + 8} ${hy - 28} L${hx + 12} ${hy - 8} Z" fill="${b.body}" ${line}/>`,
    flop: `<path d="M${hx - 12} ${hy - 10} Q${hx - 22} ${hy} ${hx - 16} ${hy + 14} Q${hx - 8} ${hy + 4} ${hx - 6} ${hy - 12} Z" fill="${shade(b.body, -0.3)}" ${line}/>`,
    round: `<circle cx="${hx - 11}" cy="${hy - 13}" r="6" fill="${b.body}" ${line}/><circle cx="${hx + 9}" cy="${hy - 14}" r="6" fill="${b.body}" ${line}/>`,
  }[b.ears];
  const extras = [
    b.stripes ? `<path d="M58 ${cy - 18} L64 ${cy - 2} M72 ${cy - 20} L76 ${cy - 4} M86 ${cy - 20} L88 ${cy - 4} M100 ${cy - 18} L98 ${cy - 2} M66 ${cy + 20} L70 ${cy + 8} M84 ${cy + 21} L86 ${cy + 9}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` : '',
    b.spots ? `<g fill="${CREAM}"><circle cx="62" cy="${cy - 6}" r="3"/><circle cx="76" cy="${cy - 12}" r="3"/><circle cx="90" cy="${cy - 4}" r="3"/><circle cx="102" cy="${cy - 12}" r="3"/></g>` : '',
    b.hump ? `<path d="M96 ${cy - 16} Q104 ${cy - 34} 114 ${cy - 16} Z" fill="${b.body}" ${line}/>` : '',
    b.cloth ? `<path d="M60 ${cy - 18} H98 L96 ${cy + 8} Q79 ${cy + 14} 62 ${cy + 8} Z" fill="${COLOR_HEX.red}" ${line}/><path d="M62 ${cy + 4} Q79 ${cy + 10} 96 ${cy + 4}" stroke="${GOLD}" stroke-width="3" fill="none"/>` : '',
    b.mane ? `<path d="M${hx - 18} ${hy - 6} Q${hx - 30} ${cy} ${hx - 34} ${cy + 6} L${hx - 24} ${cy - 2} Q${hx - 18} ${hy + 10} ${hx - 10} ${hy - 4} Z" fill="${INK}"/>` : '',
  ].join('');
  const head = `
    ${b.horns ? `<path d="M${hx - 10} ${hy - 12} Q${hx - 20} ${hy - 30} ${hx - 6} ${hy - 32} M${hx + 8} ${hy - 13} Q${hx + 16} ${hy - 30} ${hx + 4} ${hy - 33}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>` : ''}
    ${b.antlers ? `<path d="M${hx - 6} ${hy - 14} L${hx - 12} ${hy - 34} M${hx - 10} ${hy - 26} L${hx - 20} ${hy - 30} M${hx + 6} ${hy - 14} L${hx + 12} ${hy - 34} M${hx + 10} ${hy - 26} L${hx + 20} ${hy - 30}" stroke="#8a5a3a" stroke-width="3.6" stroke-linecap="round"/>` : ''}
    ${b.ears !== 'flop' ? ears : ''}
    <circle cx="${hx}" cy="${hy}" r="16" fill="${b.body}" ${line}/>
    ${b.ears === 'flop' ? ears : ''}
    <ellipse cx="${hx + 10 + b.snout / 2}" cy="${hy + 6}" rx="${8 + b.snout}" ry="7.5" fill="${b.belly ?? shade(b.body, 0.25)}" ${line}/>
    <ellipse cx="${hx + 15 + b.snout}" cy="${hy + 2}" rx="3" ry="2.4" fill="${INK}"/>
    ${b.stripes ? `<path d="M${hx - 6} ${hy - 14} L${hx - 2} ${hy - 6} M${hx + 4} ${hy - 15} L${hx + 4} ${hy - 7}" stroke="${INK}" stroke-width="2.6"/>` : ''}
    <g class="p-eyes" style="transform-origin:${hx}px ${hy - 3}px"><path d="M${hx - 3} ${hy - 3} Q${hx + 2} ${hy - 8} ${hx + 7} ${hy - 3} Q${hx + 2} ${hy} ${hx - 3} ${hy - 3} Z" fill="#fff" stroke="${INK}" stroke-width="1.4"/><circle cx="${hx + 3}" cy="${hy - 3.4}" r="1.9" fill="${INK}"/></g>
    <path class="p-eyes-shut" d="M${hx - 3} ${hy - 3} Q${hx + 2} ${hy} ${hx + 7} ${hy - 3}" fill="none" stroke="${INK}" stroke-width="1.6"/>
    <path class="p-mouth-shut" d="M${hx + 8} ${hy + 11} Q${hx + 12 + b.snout / 2} ${hy + 14} ${hx + 16 + b.snout} ${hy + 10}" fill="none" stroke="${INK}" stroke-width="1.6"/>
    <path class="p-mouth-open" d="M${hx + 8} ${hy + 10} Q${hx + 12 + b.snout / 2} ${hy + 20} ${hx + 17 + b.snout} ${hy + 10} Z" fill="#7a1f17" stroke="${INK}" stroke-width="1.4" style="transform-origin:${hx + 12}px ${hy + 10}px"/>`;
  return `<svg class="puppet beast" viewBox="0 0 160 110" aria-hidden="true"><g class="p-whole">
    ${tail}${legs}
    <g class="p-upper" style="transform-origin:80px ${cy}px">
      <ellipse cx="76" cy="${cy}" rx="46" ry="21" fill="${b.body}" ${line}/>
      ${b.belly ? `<path d="M46 ${cy + 10} Q76 ${cy + 26} 106 ${cy + 10}" fill="${b.belly}"/>` : ''}
      ${extras}
      <g class="p-head" style="transform-origin:${hx - 10}px ${hy + 8}px">${head}</g>
    </g>
  </g></svg>`;
}

function elephantSvg(color: string): string {
  return `<svg class="puppet beast" viewBox="0 0 160 110" aria-hidden="true"><g class="p-whole">
    <path d="M24 46 Q10 58 14 72" fill="none" ${line} stroke-width="3"/>
    ${[34, 50, 86, 102].map((x, i) => `<g class="a-leg a-leg-${i % 2 ? 'b' : 'a'}" style="transform-origin:${x + 7}px 70px"><rect x="${x}" y="64" width="15" height="42" rx="6" fill="${i < 2 ? '#7c7c88' : '#8e8e9a'}" ${line}/><path d="M${x + 2} 103 H${x + 13}" stroke="${CREAM}" stroke-width="2"/></g>`).join('')}
    <g class="p-upper" style="transform-origin:70px 60px">
      <path d="M24 70 Q20 26 66 22 Q112 20 120 48 L120 76 Q70 84 24 78 Z" fill="#8e8e9a" ${line}/>
      <path d="M48 26 Q74 20 100 26 L102 60 Q74 70 48 60 Z" fill="${color}" ${line}/>
      <path d="M50 54 Q74 64 100 54" stroke="${GOLD}" stroke-width="3.4" fill="none"/>
      <g fill="${GOLD}"><circle cx="58" cy="36" r="2.4"/><circle cx="74" cy="33" r="2.4"/><circle cx="90" cy="36" r="2.4"/></g>
      <g class="p-head" style="transform-origin:116px 50px">
        <circle cx="124" cy="46" r="23" fill="#8e8e9a" ${line}/>
        <path d="M108 30 Q90 44 100 70 Q116 62 114 40 Z" fill="#7c7c88" ${line}/>
        <path d="M112 26 Q124 18 136 26 L132 34 Q124 30 116 34 Z" fill="${GOLD}" ${line}/>
        <g class="a-trunk" style="transform-origin:138px 58px"><path d="M138 54 Q152 76 144 96 Q142 102 134 100" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M138 54 Q152 76 144 96 Q142 102 134 100" fill="none" stroke="#8e8e9a" stroke-width="9" stroke-linecap="round"/></g>
        <path d="M132 64 Q140 74 152 70" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M132 64 Q140 74 152 70" fill="none" stroke="${CREAM}" stroke-width="3.4" stroke-linecap="round"/>
        <g class="p-eyes" style="transform-origin:128px 42px"><path d="M122 42 Q127 37 132 42 Q127 45 122 42 Z" fill="#fff" stroke="${INK}" stroke-width="1.4"/><circle cx="128" cy="41.5" r="1.8" fill="${INK}"/></g>
        <path class="p-eyes-shut" d="M122 42 Q127 45 132 42" fill="none" stroke="${INK}" stroke-width="1.6"/>
        <path class="p-mouth-shut" d="M128 62 Q131 64 134 62" fill="none" stroke="${INK}" stroke-width="1.4"/>
        <path class="p-mouth-open" d="M126 61 Q130 70 135 61 Z" fill="#7a1f17" stroke="${INK}" stroke-width="1.2" style="transform-origin:130px 62px"/>
      </g>
    </g>
  </g></svg>`;
}

function horseSvg(color: string): string {
  const dark = shade(color, -0.25);
  return `<svg class="puppet beast" viewBox="0 0 160 110" aria-hidden="true"><g class="p-whole">
    <path d="M30 48 Q12 56 16 84 Q24 70 32 58 Z" fill="${INK}"/>
    ${[38, 54, 88, 102].map((x, i) => `<g class="a-leg a-leg-${i % 2 ? 'b' : 'a'}" style="transform-origin:${x + 4}px 62px"><rect x="${x}" y="58" width="9" height="46" rx="4" fill="${i < 2 ? dark : color}" ${line}/><rect x="${x - 1}" y="99" width="11" height="6" rx="2" fill="${INK}"/></g>`).join('')}
    <g class="p-upper" style="transform-origin:70px 52px">
      <ellipse cx="70" cy="52" rx="44" ry="18" fill="${color}" ${line}/>
      <path d="M52 36 H86 L84 62 Q69 68 54 62 Z" fill="${COLOR_HEX.red}" ${line}/><path d="M55 58 Q69 64 83 58" stroke="${GOLD}" stroke-width="3" fill="none"/>
      <g class="p-head" style="transform-origin:104px 44px">
        <path d="M98 50 L104 24 Q110 10 122 10 L128 20 L114 52 Z" fill="${color}" ${line}/>
        <path d="M104 24 Q108 12 120 9 L116 16 Q110 20 108 30 L104 46 Z" fill="${INK}"/>
        <path d="M114 8 L118 -2 L122 9 Z" fill="${color}" ${line}/>
        <path d="M118 12 Q140 14 146 30 Q146 38 138 38 Q128 36 120 26 Z" fill="${color}" ${line}/>
        <ellipse cx="143" cy="33" rx="2" ry="1.6" fill="${INK}"/>
        <g class="p-eyes" style="transform-origin:126px 19px"><path d="M122 19 Q126 15 130 19 Q126 22 122 19 Z" fill="#fff" stroke="${INK}" stroke-width="1.3"/><circle cx="126.5" cy="18.6" r="1.6" fill="${INK}"/></g>
        <path class="p-eyes-shut" d="M122 19 Q126 22 130 19" fill="none" stroke="${INK}" stroke-width="1.5"/>
        <path class="p-mouth-shut" d="M134 36 Q139 39 144 37" fill="none" stroke="${INK}" stroke-width="1.4"/>
        <path class="p-mouth-open" d="M133 35 Q139 44 145 36 Z" fill="#7a1f17" stroke="${INK}" stroke-width="1.2" style="transform-origin:139px 37px"/>
      </g>
    </g>
  </g></svg>`;
}

function monkeySvg(): string {
  const fur = '#8a5a3a';
  const face = '#e1c79a';
  return `<svg class="puppet human" viewBox="0 0 100 110" aria-hidden="true"><g class="p-whole">
    <path d="M32 96 Q6 96 8 70 Q10 50 24 52 Q32 54 26 62" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
    <path d="M32 96 Q6 96 8 70 Q10 50 24 52 Q32 54 26 62" fill="none" stroke="${fur}" stroke-width="4" stroke-linecap="round"/>
    <g class="p-upper" style="transform-origin:50px 96px">
      <ellipse cx="38" cy="100" rx="11" ry="7" fill="${fur}" ${line}/><ellipse cx="62" cy="100" rx="11" ry="7" fill="${fur}" ${line}/>
      <ellipse cx="50" cy="78" rx="21" ry="24" fill="${fur}" ${line}/>
      <ellipse cx="50" cy="82" rx="12" ry="15" fill="${face}"/>
      <g class="p-arm p-arm-l" style="transform-origin:34px 64px"><path d="M34 64 Q26 80 30 94" fill="none" stroke="${INK}" stroke-width="8.4" stroke-linecap="round"/><path d="M34 64 Q26 80 30 94" fill="none" stroke="${fur}" stroke-width="5.4" stroke-linecap="round"/><circle cx="30" cy="95" r="4" fill="${face}" ${line}/></g>
      <g class="p-arm p-arm-r" style="transform-origin:66px 64px"><path d="M66 64 Q74 80 70 94" fill="none" stroke="${INK}" stroke-width="8.4" stroke-linecap="round"/><path d="M66 64 Q74 80 70 94" fill="none" stroke="${fur}" stroke-width="5.4" stroke-linecap="round"/><circle cx="70" cy="95" r="4" fill="${face}" ${line}/><g class="p-prop" transform="translate(70 95)"></g></g>
      <g class="p-head" style="transform-origin:50px 54px">
        <circle cx="30" cy="38" r="7" fill="${fur}" ${line}/><circle cx="30" cy="38" r="3.6" fill="${face}"/>
        <circle cx="70" cy="38" r="7" fill="${fur}" ${line}/><circle cx="70" cy="38" r="3.6" fill="${face}"/>
        <circle cx="50" cy="38" r="18" fill="${fur}" ${line}/>
        <path d="M37 36 Q37 26 46 30 Q50 32 54 30 Q63 26 63 36 Q64 52 50 54 Q36 52 37 36 Z" fill="${face}" ${line}/>
        <g class="p-eyes" style="transform-origin:50px 36px"><circle cx="44" cy="36" r="3.4" fill="#fff" stroke="${INK}" stroke-width="1.2"/><circle cx="56" cy="36" r="3.4" fill="#fff" stroke="${INK}" stroke-width="1.2"/><circle cx="44.6" cy="36" r="1.7" fill="${INK}"/><circle cx="56.6" cy="36" r="1.7" fill="${INK}"/></g>
        <path class="p-eyes-shut" d="M41 36 Q44 38 47 36 M53 36 Q56 38 59 36" fill="none" stroke="${INK}" stroke-width="1.4"/>
        <path class="p-brows" d="M40 31 Q44 29 48 31 M52 31 Q56 29 60 31" fill="none" stroke="${INK}" stroke-width="1.4"/>
        <circle cx="48" cy="43" r="1" fill="${INK}"/><circle cx="52" cy="43" r="1" fill="${INK}"/>
        <path class="p-mouth-shut" d="M44 47 Q50 51 56 47" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>
        <ellipse class="p-mouth-open" cx="50" cy="48" rx="4.4" ry="3.2" fill="#7a1f17" stroke="${INK}" stroke-width="1.3" style="transform-origin:50px 48px"/>
        <g class="p-tears"><path d="M43 40 q-1.5 4 0 6 q1.5 -2 0 -6 Z" fill="#7fc4ff"/><path d="M57 40 q-1.5 4 0 6 q1.5 -2 0 -6 Z" fill="#7fc4ff"/></g>
      </g>
    </g>
  </g></svg>`;
}

function birdSvg(body: string, beak: string): string {
  return `<svg class="puppet bird" viewBox="0 0 70 60" aria-hidden="true"><g class="p-whole">
    <path d="M14 34 L2 46 L10 46 L4 54 L20 42 Z" fill="${shade(body, -0.25)}" ${line}/>
    <g class="p-upper" style="transform-origin:35px 40px">
      <ellipse cx="32" cy="36" rx="18" ry="13" fill="${body}" ${line}/>
      <g class="a-wing" style="transform-origin:30px 32px"><path d="M22 30 Q34 20 44 32 Q34 44 22 30 Z" fill="${shade(body, -0.2)}" ${line}/></g>
      <g class="p-head" style="transform-origin:46px 26px">
        <circle cx="48" cy="22" r="10" fill="${body}" ${line}/>
        <path d="M56 20 Q66 22 58 30 Z" fill="${beak}" ${line}/>
        <g class="p-eyes" style="transform-origin:50px 20px"><circle cx="50" cy="20" r="3" fill="#fff" stroke="${INK}" stroke-width="1.2"/><circle cx="51" cy="20" r="1.4" fill="${INK}"/></g>
        <path class="p-eyes-shut" d="M47 20 Q50 22 53 20" fill="none" stroke="${INK}" stroke-width="1.4"/>
        <path class="p-mouth-shut" d="M0 0" /><path class="p-mouth-open" d="M57 26 L62 28 L57 29 Z" fill="#7a1f17" style="transform-origin:57px 27px"/>
      </g>
    </g>
    <path d="M28 48 L28 56 M36 48 L36 56" stroke="${INK}" stroke-width="2.4"/>
  </g></svg>`;
}

function snakeSvg(color: string): string {
  return `<svg class="puppet snake" viewBox="0 0 100 90" aria-hidden="true"><g class="p-whole">
    <path d="M14 82 Q14 70 40 70 Q72 70 74 80 Q76 88 46 88 Q18 88 14 82 Z" fill="${shade(color, -0.15)}" ${line}/>
    <g class="p-upper" style="transform-origin:56px 76px">
      <path d="M58 74 Q46 54 58 40 Q68 28 60 18" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
      <path d="M58 74 Q46 54 58 40 Q68 28 60 18" fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round"/>
      <g class="p-head" style="transform-origin:60px 24px">
        <path d="M60 6 Q78 12 74 28 Q66 36 60 30 Q54 36 46 28 Q42 12 60 6 Z" fill="${color}" ${line}/>
        <path d="M54 22 Q60 28 66 22" fill="none" stroke="${CREAM}" stroke-width="2.4"/>
        <g class="p-eyes" style="transform-origin:60px 14px"><circle cx="55" cy="14" r="2.6" fill="#fff" stroke="${INK}" stroke-width="1"/><circle cx="65" cy="14" r="2.6" fill="#fff" stroke="${INK}" stroke-width="1"/><circle cx="55.6" cy="14" r="1.2" fill="${INK}"/><circle cx="65.6" cy="14" r="1.2" fill="${INK}"/></g>
        <path class="p-eyes-shut" d="M52 14 H58 M62 14 H68" stroke="${INK}" stroke-width="1.4"/>
        <path class="p-mouth-shut a-tongue" d="M60 10 L60 4 M60 4 L57 1 M60 4 L63 1" stroke="${COLOR_HEX.red}" stroke-width="1.6" fill="none"/>
        <path class="p-mouth-open" d="M56 9 Q60 4 64 9 Z" fill="#7a1f17" style="transform-origin:60px 8px"/>
      </g>
    </g>
  </g></svg>`;
}

const BEASTS: Partial<Record<Kind, (c: string) => Beast>> = {
  tiger: () => ({ body: '#e07b24', belly: CREAM, ears: 'round', tail: 'thin', leg: 26, snout: 2, stripes: true }),
  jackal: () => ({ body: '#c98b5b', belly: CREAM, ears: 'point', tail: 'bushy', leg: 26, snout: 6 }),
  dog: (c) => ({ body: c, belly: CREAM, ears: 'flop', tail: 'curl', leg: 22, snout: 4 }),
  cow: () => ({ body: CREAM, belly: '#e5d9bf', ears: 'flop', tail: 'tuft', leg: 28, snout: 3, horns: true, hump: true, cloth: true }),
  deer: () => ({ body: '#c98b5b', belly: CREAM, ears: 'point', tail: 'thin', leg: 36, snout: 4, spots: true, antlers: true }),
};

// Animals keep natural colours whatever colour the story asks for.
function natural(color: PuppetColor, allowed: PuppetColor[], fallback: PuppetColor): string {
  const pick = allowed.includes(color) ? color : fallback;
  return pick === 'yellow' ? '#c98b5b' : COLOR_HEX[pick];
}

/** The full SVG for a cast member, plus its native viewBox size and height on stage (% of stage height). */
export function puppet(kind: Kind, color: PuppetColor): { svg: string; w: number; h: number; height: number; flying?: boolean } {
  const c = COLOR_HEX[color];
  if (kind === 'elephant') return { svg: elephantSvg(c), w: 160, h: 110, height: 46 };
  if (kind === 'horse') return { svg: horseSvg(natural(color, ['brown', 'white', 'black'], 'brown')), w: 160, h: 110, height: 44 };
  if (kind === 'monkey') return { svg: monkeySvg(), w: 100, h: 110, height: 26 };
  if (kind === 'parrot') return { svg: birdSvg('#3e9b4a', '#c8341f'), w: 70, h: 60, height: 15, flying: true };
  if (kind === 'crow') return { svg: birdSvg('#3a302a', '#5a4a3a'), w: 70, h: 60, height: 14, flying: true };
  if (kind === 'snake') return { svg: snakeSvg(natural(color, ['green', 'black', 'brown', 'yellow'], 'green')), w: 100, h: 90, height: 22 };
  if (kind === 'ghost') return { svg: ghostSvg(), w: 100, h: 170, height: 54 };
  const beast = BEASTS[kind];
  if (beast) {
    const heights: Partial<Record<Kind, number>> = { tiger: 32, jackal: 26, dog: 24, cow: 34, deer: 36 };
    const fur = kind === 'dog' ? natural(color, ['brown', 'white', 'black', 'yellow'], 'brown') : c;
    return { svg: quadrupedSvg(beast(fur)), w: 160, h: 110, height: heights[kind] ?? 30 };
  }
  const human = kind as HumanKind;
  const height = human === 'boy' || human === 'girl' ? 42 : human === 'god' ? 62 : 58;
  return { svg: humanSvg(human, c), w: 100, h: 170, height };
}

/* Painted backgrounds, 400 x 300, ground from y = 240 */

function dots(color: string, x0: number, y0: number, x1: number, y1: number, step: number, r = 1.6): string {
  let out = '';
  for (let y = y0; y < y1; y += step) for (let x = x0 + ((y / step) % 2) * (step / 2); x < x1; x += step) out += `<circle cx="${x}" cy="${y}" r="${r}"/>`;
  return `<g fill="${color}">${out}</g>`;
}

function tree(x: number, base: number, s: number, leaf: string): string {
  return `<g transform="translate(${x} ${base}) scale(${s})">
    <path d="M-7 0 Q-5 -40 -3 -70 L3 -70 Q5 -40 7 0 Z" fill="#6b4226" ${line}/>
    <path d="M-2 -60 Q-20 -70 -26 -86 M2 -62 Q20 -72 26 -88" stroke="#6b4226" stroke-width="5" fill="none"/>
    <circle cx="-22" cy="-96" r="24" fill="${leaf}" ${line}/><circle cx="22" cy="-98" r="24" fill="${leaf}" ${line}/><circle cx="0" cy="-118" r="28" fill="${shade(leaf, 0.12)}" ${line}/>
    <g fill="${CREAM}" opacity=".8"><circle cx="-22" cy="-96" r="2"/><circle cx="-12" cy="-86" r="2"/><circle cx="22" cy="-98" r="2"/><circle cx="12" cy="-88" r="2"/><circle cx="0" cy="-118" r="2"/><circle cx="-10" cy="-126" r="2"/><circle cx="10" cy="-110" r="2"/></g>
  </g>`;
}

function hut(x: number, base: number): string {
  return `<g transform="translate(${x} ${base})">
    <rect x="-34" y="-46" width="68" height="46" fill="#c98b5b" ${line}/>
    <path d="M-44 -44 L0 -84 L44 -44 Z" fill="#b8862e" ${line}/>
    <path d="M-30 -52 L0 -78 M-14 -48 L4 -74 M14 -48 L-2 -74 M30 -52 L0 -78" stroke="${INK}" stroke-width="1" opacity=".5"/>
    <rect x="-10" y="-28" width="20" height="28" rx="9" fill="#5a3a2a" ${line}/>
    ${dots(CREAM, -30, -40, 30, -34, 7, 1.6)}
    <path d="M-30 -8 Q-24 -16 -18 -8 M18 -8 Q24 -16 30 -8" stroke="${CREAM}" stroke-width="2" fill="none"/>
  </g>`;
}

function deula(x: number, base: number, h: number, w: number, fill: string): string {
  const top = base - h;
  return `<path d="M${x - w / 2} ${base} C${x - w / 2} ${base - h * 0.62} ${x - w * 0.2} ${top + h * 0.06} ${x} ${top} C${x + w * 0.2} ${top + h * 0.06} ${x + w / 2} ${base - h * 0.62} ${x + w / 2} ${base} Z" fill="${fill}" ${line}/>
    ${[0.2, 0.4, 0.6, 0.8].map((f) => `<path d="M${x - w / 2 + w * 0.06 * f} ${base - h * f * 0.85} H${x + w / 2 - w * 0.06 * f}" stroke="${INK}" stroke-width="1" opacity=".45"/>`).join('')}
    <ellipse cx="${x}" cy="${top + 3}" rx="${w * 0.22}" ry="${w * 0.07}" fill="${CREAM}" ${line}/>
    <path d="M${x} ${top - 2} V${top - w * 0.5}" ${line}/><path d="M${x} ${top - w * 0.5} L${x + w * 0.3} ${top - w * 0.42} L${x} ${top - w * 0.34} Z" fill="${COLOR_HEX.red}" ${line}/>`;
}

const SKY = '#f1d59a';

export function backgroundSvg(bg: Background): string {
  let art = '';
  switch (bg) {
    case 'palace':
      art = `<rect width="400" height="300" fill="#b3261a"/>${dots('#e8b437', 6, 6, 400, 240, 18, 1.4)}
        ${[20, 150, 280].map((x) => `<path d="M${x} 240 V122 Q${x} 72 ${x + 50} 72 Q${x + 100} 72 ${x + 100} 122 V240 Z" fill="#7a1a12" ${line}/><path d="M${x + 10} 240 V126 Q${x + 10} 84 ${x + 50} 84 Q${x + 90} 84 ${x + 90} 126 V240" fill="none" stroke="${GOLD}" stroke-width="2"/>`).join('')}
        ${[10, 140, 270, 380].map((x) => `<rect x="${x}" y="70" width="20" height="170" fill="${CREAM}" ${line}/><rect x="${x - 4}" y="62" width="28" height="10" fill="${GOLD}" ${line}/>`).join('')}
        <path d="M0 18 ${Array.from({ length: 10 }, (_, i) => `Q${i * 40 + 20} 44 ${i * 40 + 40} 18`).join(' ')}" fill="none" stroke="#3e7b3a" stroke-width="5"/>
        ${dots('#e07b24', 20, 34, 400, 36, 40, 4)}
        <path d="M170 240 V196 Q200 182 230 196 V240 Z" fill="${GOLD}" ${line}/><path d="M160 196 Q200 150 240 196" fill="${COLOR_HEX.red}" ${line}/>
        <rect y="240" width="400" height="60" fill="${GOLD}" ${line}/>
        <path d="${Array.from({ length: 12 }, (_, i) => `M${i * 36} 240 L${i * 36 + 18} 300 M${i * 36 + 36} 240 L${i * 36 + 18} 300`).join(' ')}" stroke="${INK}" stroke-width="1" opacity=".3"/>`;
      break;
    case 'village':
      art = `<rect width="400" height="300" fill="${SKY}"/><circle cx="330" cy="54" r="22" fill="#e07b24" ${line}/>
        <path d="M0 170 Q80 120 160 160 Q240 118 320 150 Q370 130 400 146 V240 H0 Z" fill="#6e9a4a" ${line}/>
        ${tree(205, 236, 0.8, '#3e7b3a')}${hut(70, 240)}${hut(320, 240)}
        <rect y="238" width="400" height="62" fill="#d9a15a" ${line}/><path d="M150 300 Q190 268 260 240" stroke="#e8c58a" stroke-width="26" fill="none"/>`;
      break;
    case 'forest':
      art = `<rect width="400" height="300" fill="${SKY}"/>
        ${tree(40, 250, 1.1, '#2f6b33')}${tree(130, 246, 0.9, '#557f2e')}${tree(220, 252, 1.15, '#3e7b3a')}${tree(310, 246, 0.95, '#2f6b33')}${tree(385, 252, 1.05, '#557f2e')}
        <rect y="238" width="400" height="62" fill="#4e7a3a" ${line}/>
        ${dots('#e8b437', 10, 252, 400, 298, 26, 2.4)}${dots('#d9648a', 22, 262, 400, 298, 34, 2)}`;
      break;
    case 'river':
      art = `<rect width="400" height="300" fill="${SKY}"/><path d="M0 132 Q100 112 200 128 Q300 112 400 126 V156 H0 Z" fill="#6e9a4a" ${line}/>
        ${tree(330, 140, 0.45, '#3e7b3a')}${tree(60, 140, 0.4, '#2f6b33')}
        <rect y="154" width="400" height="86" fill="#2e5aa8" ${line}/>
        ${[172, 196, 220].map((y, r) => `<path d="M${r * 12} ${y} ${Array.from({ length: 14 }, (_, i) => `q8 -8 16 0 q4 4 8 0`).join(' ')}" fill="none" stroke="${CREAM}" stroke-width="2" opacity=".85"/>`).join('')}
        <g transform="translate(250 186)"><path d="M-34 0 Q0 18 34 0 L28 -6 H-28 Z" fill="#8a5a3a" ${line}/><path d="M0 -6 V-30" ${line}/></g>
        <g fill="#d9648a" ${line}><path d="M80 214 q6 -12 12 0 q-6 4 -12 0 Z"/><path d="M330 226 q6 -12 12 0 q-6 4 -12 0 Z"/></g>
        <rect y="238" width="400" height="62" fill="#d9a15a" ${line}/><path d="M0 252 H400 M0 266 H400 M0 280 H400" stroke="${INK}" stroke-width="1.2" opacity=".35"/>`;
      break;
    case 'sea':
      art = `<rect width="400" height="300" fill="${SKY}"/><circle cx="70" cy="60" r="20" fill="#e07b24" ${line}/>
        <rect y="120" width="400" height="122" fill="#23468f" ${line}/>
        ${[138, 166, 194, 222].map((y, r) => `<path d="M${r * 10 - 10} ${y} ${Array.from({ length: 16 }, () => `q6 -10 14 -2 q-6 -2 -4 6 q6 0 10 -4`).join(' ')}" fill="none" stroke="${CREAM}" stroke-width="2"/>`).join('')}
        <g transform="translate(270 168)"><path d="M-62 0 Q-58 26 0 28 Q58 26 66 -4 Z" fill="#8a5a3a" ${line}/><circle cx="48" cy="6" r="5" fill="${CREAM}" ${line}/><circle cx="49" cy="6" r="2" fill="${INK}"/>
          <path d="M0 0 V-92" ${line} stroke-width="3"/><path d="M2 -88 Q46 -60 2 -14 Z" fill="${CREAM}" ${line}/><path d="M4 -70 Q30 -56 4 -36" fill="none" stroke="${COLOR_HEX.red}" stroke-width="6"/>
          <path d="M0 -92 L18 -86 L0 -80 Z" fill="${COLOR_HEX.red}" ${line}/></g>
        <path d="M40 92 q6 -6 12 0 q6 -6 12 0 M120 70 q5 -5 10 0 q5 -5 10 0" fill="none" ${line}/>
        <rect y="240" width="400" height="60" fill="#e7c27a" ${line}/>${dots('#c98b5b', 14, 254, 400, 298, 30, 2.2)}`;
      break;
    case 'temple':
      art = `<rect width="400" height="300" fill="${SKY}"/>
        ${deula(250, 210, 170, 110, '#d9a15a')}
        <path d="M110 210 L130 150 L190 150 L210 210 Z" fill="#c98b5b" ${line}/><path d="M118 186 H202 M124 168 H196" stroke="${INK}" stroke-width="1" opacity=".5"/>
        <path d="M140 150 L160 124 L180 150 Z" fill="#c98b5b" ${line}/>
        <rect x="0" y="206" width="400" height="34" fill="#b5532c" ${line}/>${dots(GOLD, 8, 216, 400, 236, 16, 2)}
        <rect y="238" width="400" height="62" fill="#e1c79a" ${line}/><path d="${Array.from({ length: 10 }, (_, i) => `M${i * 44} 238 V300`).join(' ')} M0 268 H400" stroke="${INK}" stroke-width="1" opacity=".3"/>`;
      break;
    case 'market':
      art = `<rect width="400" height="300" fill="${SKY}"/>
        ${[20, 150, 280].map((x, i) => `<rect x="${x}" y="150" width="100" height="70" fill="#c98b5b" ${line}/>
          <path d="M${x - 8} 150 L${x + 6} 112 H${x + 94} L${x + 108} 150 Z" fill="${[COLOR_HEX.red, COLOR_HEX.blue, COLOR_HEX.green][i]}" ${line}/>
          <path d="${Array.from({ length: 5 }, (_, j) => `M${x + 8 + j * 20} 112 L${x + j * 22} 150`).join(' ')}" stroke="${GOLD}" stroke-width="5"/>
          <rect x="${x - 4}" y="196" width="108" height="24" fill="#8a5a3a" ${line}/>
          <g ${line}>${[0, 1, 2, 3].map((j) => `<circle cx="${x + 14 + j * 24}" cy="190" r="8" fill="${[GOLD, '#e07b24', '#3e7b3a', '#c8341f'][(i + j) % 4]}"/>`).join('')}</g>`).join('')}
        <rect y="238" width="400" height="62" fill="#d9a15a" ${line}/>`;
      break;
    case 'desert':
      art = `<rect width="400" height="300" fill="#f5c76b"/><circle cx="90" cy="60" r="26" fill="#e07b24" ${line}/>
        <path d="M230 170 V120 H250 V110 H262 V120 H286 V110 H298 V120 H322 V110 H334 V120 H360 V170 Z" fill="#c47a3a" ${line}/><rect x="282" y="140" width="16" height="30" rx="8" fill="#5a3a2a" ${line}/>
        <path d="M0 196 Q100 150 200 186 Q300 150 400 180 V240 H0 Z" fill="#e0a54c" ${line}/>
        <path d="M0 230 Q140 196 260 226 Q340 210 400 222 V300 H0 Z" fill="#d18f35" ${line}/>`;
      break;
    case 'mountain':
      art = `<rect width="400" height="300" fill="#cfe0e6"/>
        <path d="M-20 240 L90 70 L190 240 Z" fill="#6b7fa6" ${line}/><path d="M60 116 L90 70 L120 116 L104 108 L90 120 L76 106 Z" fill="#fff" ${line}/>
        <path d="M140 240 L270 50 L400 240 Z" fill="#5a6d94" ${line}/><path d="M236 100 L270 50 L304 100 L286 92 L270 106 L254 90 Z" fill="#fff" ${line}/>
        ${[30, 70, 330, 370].map((x) => `<path d="M${x} 244 L${x + 14} 200 L${x + 28} 244 Z" fill="#2f5a3a" ${line}/>`).join('')}
        <rect y="238" width="400" height="62" fill="#7a8f6a" ${line}/>`;
      break;
    case 'cremation-ground':
      art = `<rect width="400" height="300" fill="#1f2d5c"/>${dots('#f2ead8', 10, 10, 400, 120, 37, 1.2)}<circle cx="320" cy="60" r="24" fill="#f2ead8" ${line}/>
        <path d="M70 240 C80 190 82 150 76 110 L92 108 C96 150 96 190 108 240 Z" fill="#0f2420" ${line}/>
        <circle cx="50" cy="96" r="40" fill="#143231" ${line}/><circle cx="110" cy="84" r="44" fill="#1b3f3c" ${line}/>
        <g transform="translate(250 238)"><path d="M-30 -6 L30 -12 M-30 -12 L30 -4" stroke="#2a160e" stroke-width="7" stroke-linecap="round"/>
          <path class="pc-flame" d="M0 -64 C14 -40 18 -24 12 -12 C8 -4 -8 -4 -12 -12 C-18 -24 -14 -40 0 -64 Z" fill="#f2913d" ${line}/><path class="pc-flame" d="M0 -44 C7 -30 8 -20 5 -12 C2 -8 -2 -8 -5 -12 C-8 -20 -7 -30 0 -44 Z" fill="#f5d27a"/></g>
        <rect y="238" width="400" height="62" fill="#2a2238" ${line}/>`;
      break;
  }
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${art}</svg>`;
}
