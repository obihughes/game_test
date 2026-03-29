import type { TownId } from '@/game/core/types.ts'

interface MarketBackdropProps {
  townId: TownId
}

export function MarketBackdrop({ townId }: MarketBackdropProps) {
  return (
    <svg
      className="market-backdrop"
      viewBox="0 0 1200 420"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="marketBackdropFade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.7)" stopOpacity="0.22" />
          <stop offset="58%" stopColor="rgba(255,255,255,0.18)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="rgba(8,7,6,1)" stopOpacity="0.88" />
        </linearGradient>
      </defs>

      <rect width="1200" height="420" fill="url(#marketBackdropFade)" opacity="0.35" />
      {renderTownScene(townId)}
    </svg>
  )
}

function renderTownScene(townId: TownId) {
  switch (townId) {
    case 'ashenford':
      return (
        <>
          <rect x="0" y="300" width="1200" height="120" fill="rgba(24,18,14,0.72)" />
          <path d="M0 285 L130 248 L250 268 L360 214 L470 246 L610 220 L760 252 L900 224 L1040 262 L1200 236 L1200 420 L0 420 Z" fill="rgba(42,28,18,0.56)" />
          <rect x="122" y="206" width="86" height="118" fill="rgba(34,24,18,0.72)" />
          <rect x="270" y="182" width="112" height="142" fill="rgba(28,20,14,0.78)" />
          <rect x="430" y="194" width="74" height="130" fill="rgba(24,18,14,0.72)" />
          <rect x="150" y="120" width="24" height="118" fill="rgba(22,16,12,0.82)" />
          <rect x="318" y="96" width="28" height="126" fill="rgba(22,16,12,0.86)" />
          <circle cx="162" cy="102" r="24" fill="rgba(201,166,107,0.16)" />
          <circle cx="340" cy="82" r="30" fill="rgba(201,166,107,0.18)" />
          <circle cx="186" cy="84" r="38" fill="rgba(201,166,107,0.08)" />
          <circle cx="366" cy="60" r="44" fill="rgba(201,166,107,0.07)" />
          <g className="market-backdrop__forge-fire">
            <rect x="278" y="226" width="18" height="42" fill="rgba(229,134,62,0.45)" />
            <rect x="304" y="216" width="18" height="52" fill="rgba(229,134,62,0.38)" />
            <rect x="330" y="232" width="18" height="36" fill="rgba(229,134,62,0.34)" />
          </g>
        </>
      )
    case 'mirecross':
      return (
        <>
          <rect x="0" y="296" width="1200" height="124" fill="rgba(12,20,18,0.72)" />
          <ellipse cx="290" cy="318" rx="320" ry="58" fill="rgba(63,97,84,0.18)" />
          <ellipse cx="900" cy="328" rx="380" ry="64" fill="rgba(83,117,102,0.14)" />
          <rect x="164" y="220" width="96" height="56" fill="rgba(31,35,28,0.7)" />
          <polygon points="148,222 212,184 286,222" fill="rgba(40,34,24,0.72)" />
          <rect x="436" y="226" width="116" height="60" fill="rgba(32,38,30,0.68)" />
          <polygon points="418,228 494,190 576,228" fill="rgba(44,40,28,0.74)" />
          <rect x="730" y="210" width="104" height="66" fill="rgba(28,34,27,0.66)" />
          <polygon points="716,212 784,176 850,212" fill="rgba(44,38,26,0.7)" />
          <rect x="198" y="276" width="9" height="52" fill="rgba(64,76,68,0.72)" />
          <rect x="246" y="276" width="9" height="52" fill="rgba(64,76,68,0.72)" />
          <rect x="468" y="286" width="10" height="44" fill="rgba(64,76,68,0.72)" />
          <rect x="526" y="286" width="10" height="44" fill="rgba(64,76,68,0.72)" />
          <path d="M0 318 C110 304, 220 334, 332 316 S554 306, 684 324 S946 340, 1200 312" fill="none" stroke="rgba(152,176,166,0.14)" strokeWidth="18" />
          <g className="market-backdrop__reeds">
            <path d="M34 320 L44 272 M62 320 L72 264 M88 320 L98 274 M980 324 L992 266 M1016 326 L1028 274 M1054 324 L1062 268" stroke="rgba(94,126,110,0.42)" strokeWidth="5" strokeLinecap="round" />
          </g>
        </>
      )
    case 'riversend':
      return (
        <>
          <rect x="0" y="310" width="1200" height="110" fill="rgba(14,26,32,0.7)" />
          <g className="market-backdrop__water">
            <rect x="0" y="300" width="1200" height="20" fill="rgba(56,102,124,0.2)" />
            <path d="M0 286 L180 256 L338 270 L478 230 L638 250 L782 228 L940 248 L1088 222 L1200 236 L1200 420 L0 420 Z" fill="rgba(20,32,38,0.46)" />
          </g>
          <rect x="138" y="198" width="112" height="106" fill="rgba(30,32,34,0.7)" />
          <rect x="280" y="214" width="88" height="90" fill="rgba(30,30,32,0.64)" />
          <rect x="782" y="206" width="108" height="98" fill="rgba(28,30,34,0.68)" />
          <rect x="448" y="116" width="8" height="178" fill="rgba(34,30,24,0.78)" />
          <polygon points="456,130 548,188 456,204" fill="rgba(198,214,224,0.24)" />
          <rect x="536" y="142" width="7" height="152" fill="rgba(34,30,24,0.74)" />
          <polygon points="543,154 620,206 543,216" fill="rgba(188,205,214,0.18)" />
          <rect x="936" y="104" width="8" height="176" fill="rgba(34,28,24,0.8)" />
          <path d="M940 110 L1006 126 L1006 134 L940 126 Z" fill="rgba(116,92,54,0.44)" />
          <path d="M1006 126 L1040 160" stroke="rgba(116,92,54,0.44)" strokeWidth="5" />
        </>
      )
    case 'crownpost':
      return (
        <>
          <rect x="0" y="296" width="1200" height="124" fill="rgba(24,18,12,0.72)" />
          <path d="M0 274 L154 252 L310 230 L450 248 L630 214 L808 236 L998 212 L1200 232 L1200 420 L0 420 Z" fill="rgba(42,30,18,0.46)" />
          <rect x="126" y="182" width="132" height="124" fill="rgba(42,32,22,0.72)" />
          <rect x="292" y="166" width="156" height="140" fill="rgba(46,34,22,0.76)" />
          <rect x="492" y="188" width="118" height="118" fill="rgba(38,30,20,0.7)" />
          <rect x="668" y="154" width="172" height="152" fill="rgba(44,32,20,0.78)" />
          <rect x="878" y="176" width="142" height="130" fill="rgba(40,30,20,0.72)" />
          <rect x="364" y="94" width="16" height="110" fill="rgba(70,54,28,0.7)" />
          <rect x="742" y="82" width="18" height="118" fill="rgba(70,54,28,0.74)" />
          <g className="market-backdrop__banner market-backdrop__banner--left">
            <polygon points="380,96 440,114 380,132" fill="rgba(164,74,56,0.42)" />
          </g>
          <g className="market-backdrop__banner market-backdrop__banner--right">
            <polygon points="760,86 832,106 760,128" fill="rgba(188,152,74,0.36)" />
          </g>
          <rect x="704" y="214" width="96" height="14" fill="rgba(198,166,107,0.16)" />
          <rect x="704" y="238" width="96" height="14" fill="rgba(198,166,107,0.12)" />
        </>
      )
    case 'fenward':
      return (
        <>
          <rect x="0" y="304" width="1200" height="116" fill="rgba(10,18,14,0.74)" />
          <ellipse cx="220" cy="332" rx="280" ry="54" fill="rgba(58,86,64,0.18)" />
          <ellipse cx="864" cy="338" rx="360" ry="62" fill="rgba(44,78,58,0.14)" />
          <rect x="148" y="228" width="86" height="54" fill="rgba(34,38,28,0.66)" />
          <polygon points="136,228 192,196 246,228" fill="rgba(80,60,28,0.52)" />
          <rect x="344" y="214" width="98" height="62" fill="rgba(34,38,28,0.68)" />
          <polygon points="332,214 394,176 456,214" fill="rgba(88,66,30,0.5)" />
          <rect x="612" y="220" width="104" height="58" fill="rgba(30,38,28,0.66)" />
          <polygon points="598,220 664,182 730,220" fill="rgba(86,64,28,0.5)" />
          <rect x="170" y="282" width="7" height="58" fill="rgba(82,96,78,0.7)" />
          <rect x="208" y="282" width="7" height="58" fill="rgba(82,96,78,0.7)" />
          <rect x="376" y="276" width="8" height="66" fill="rgba(82,96,78,0.72)" />
          <rect x="414" y="276" width="8" height="66" fill="rgba(82,96,78,0.72)" />
          <rect x="646" y="278" width="8" height="62" fill="rgba(82,96,78,0.72)" />
          <rect x="688" y="278" width="8" height="62" fill="rgba(82,96,78,0.72)" />
          <g className="market-backdrop__lamps">
            <circle cx="812" cy="188" r="9" fill="rgba(228,192,104,0.26)" />
            <circle cx="874" cy="160" r="7" fill="rgba(228,192,104,0.22)" />
            <circle cx="934" cy="202" r="8" fill="rgba(228,192,104,0.18)" />
          </g>
        </>
      )
    case 'stoneholt':
      return (
        <>
          <rect x="0" y="300" width="1200" height="120" fill="rgba(18,14,12,0.76)" />
          <path d="M0 286 L130 176 L240 244 L358 154 L478 234 L612 128 L724 222 L844 148 L968 236 L1082 178 L1200 246 L1200 420 L0 420 Z" fill="rgba(54,44,38,0.46)" />
          <path d="M0 320 L160 246 L286 274 L414 210 L548 268 L686 196 L846 276 L1014 218 L1200 298 L1200 420 L0 420 Z" fill="rgba(30,24,20,0.58)" />
          <rect x="496" y="230" width="92" height="74" fill="rgba(26,20,18,0.78)" />
          <polygon points="486,230 540,194 596,230" fill="rgba(40,32,26,0.76)" />
          <rect x="706" y="182" width="18" height="112" fill="rgba(56,44,32,0.72)" />
          <rect x="716" y="176" width="102" height="8" fill="rgba(56,44,32,0.72)" />
          <path d="M818 180 L858 236" stroke="rgba(94,80,58,0.64)" strokeWidth="6" />
          <g className="market-backdrop__smoke">
            <circle cx="778" cy="168" r="14" fill="rgba(72,64,58,0.22)" />
            <circle cx="798" cy="152" r="10" fill="rgba(88,78,70,0.2)" />
            <circle cx="820" cy="172" r="12" fill="rgba(64,58,52,0.18)" />
          </g>
          <rect x="822" y="238" width="42" height="28" rx="5" fill="rgba(44,34,28,0.8)" />
          <circle cx="832" cy="270" r="8" fill="rgba(94,80,58,0.72)" />
          <circle cx="854" cy="270" r="8" fill="rgba(94,80,58,0.72)" />
        </>
      )
    case 'saltmere':
      return (
        <>
          <rect x="0" y="306" width="1200" height="114" fill="rgba(12,20,24,0.7)" />
          <rect x="0" y="286" width="1200" height="28" fill="rgba(62,98,114,0.16)" />
          <path d="M0 292 L196 268 L392 278 L594 248 L786 270 L972 246 L1200 264 L1200 420 L0 420 Z" fill="rgba(20,30,34,0.4)" />
          <rect x="94" y="232" width="108" height="42" fill="rgba(212,220,220,0.16)" />
          <rect x="224" y="224" width="138" height="48" fill="rgba(212,220,220,0.16)" />
          <rect x="392" y="236" width="118" height="40" fill="rgba(212,220,220,0.14)" />
          <rect x="546" y="224" width="132" height="50" fill="rgba(212,220,220,0.16)" />
          <rect x="726" y="214" width="9" height="100" fill="rgba(74,84,90,0.7)" />
          <polygon points="735,220 806,256 735,270" fill="rgba(216,224,228,0.22)" />
          <rect x="814" y="226" width="8" height="88" fill="rgba(74,84,90,0.68)" />
          <polygon points="822,232 880,262 822,272" fill="rgba(216,224,228,0.18)" />
          <g className="market-backdrop__masts">
            <path d="M934 316 L934 244 M978 316 L978 252 M1022 316 L1022 242 M1064 316 L1064 250" stroke="rgba(122,136,144,0.54)" strokeWidth="5" strokeLinecap="round" />
          </g>
        </>
      )
    default:
      return null
  }
}
