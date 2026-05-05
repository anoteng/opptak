export const SRC = {
  UIS:  { name: "UiS",                  url: "https://www.uis.no/nb/studier/omregning-av-karaktersystem" },
  OSLO: { name: "OsloMet",              url: "https://www.oslomet.no/studier/soknad-og-opptak/poengberegning-rangeringsregler/omregning-av-karakterer" },
  HH:   { name: "NMBU/Opptakskontoret", url: null },
  ELTE: { name: "ELTE",                 url: "https://www.elte.hu/en/ects-credit-system-and-grading" }
};

export const COUNTRIES = [
  // ── ECTS ──────────────────────────────────────────────────────
  {
    id: "ects", name: "ECTS (Europeisk standardskala)",
    scales: [{ name: "Standard ECTS", src: SRC.UIS, grades: [
      { label: "A – Fremragende",   value: 5 },
      { label: "B – Meget god",     value: 4 },
      { label: "C – God",           value: 3 },
      { label: "D – Nokså god",     value: 2 },
      { label: "E – Tilstrekkelig", value: 1 },
      { label: "F – Stryk",         value: null }
    ]}]
  },
  // ── Australia ─────────────────────────────────────────────────
  {
    id: "australia", name: "Australia",
    scales: [{ name: "Standard australsk skala", src: SRC.UIS, grades: [
      { label: "HD – High Distinction (80–100)", value: 5 },
      { label: "DN – Distinction (70–79)",        value: 4 },
      { label: "Credit (60–69)",                  value: 2.5 },
      { label: "Pass (50–59)",                    value: 1 },
      { label: "Fail – Stryk",                    value: null }
    ]}]
  },
  // ── Belgia ────────────────────────────────────────────────────
  {
    id: "belgium", name: "Belgia",
    scales: [{ name: "Belgisk skala (0–20)", src: SRC.UIS, grades: [
      { label: "18–20 – Onderscheiding met voldoening / Summa cum laude", value: 5 },
      { label: "16–17 – Onderscheiding / Magna cum laude",                value: 4 },
      { label: "14–15 – Bevredigend / Cum laude",                         value: 3 },
      { label: "12–13 – Voldoende / Satisfecit",                          value: 2 },
      { label: "10–11 – Voldoende",                                       value: 1 },
      { label: "Under 10 – Stryk",                                        value: null }
    ]}]
  },
  // ── Østerrike ─────────────────────────────────────────────────
  {
    id: "austria", name: "Østerrike",
    scales: [{
      name: "Østerriksk tallskala (1–4, lineær omregning)",
      grades: [
        { label: "Sehr gut (1) / Excellent",          value: 5    },
        { label: "Gut (2) / Good",                    value: 3.67 },
        { label: "Befriedigend (3) / Satisfactory",   value: 2.33 },
        { label: "Genügend (4) / Sufficient",         value: 1    },
        { label: "Nicht genügend (5) / Fail – Stryk", value: null }
      ]
    }]
  },
  // ── Bosnia-Hercegovina ────────────────────────────────────────
  {
    id: "bosnia", name: "Bosnia-Hercegovina",
    scales: [{ name: "Bosnisk/kroatisk/serbisk skala (5–10)", src: SRC.UIS, grades: [
      { label: "10 – Odličan",      value: 5 },
      { label: "9 – Odličan",       value: 4 },
      { label: "8 – Vrlo dobar",    value: 3 },
      { label: "7 – Dobar",         value: 2 },
      { label: "6 – Dovoljan",      value: 1 },
      { label: "5 – Nedovoljan (Stryk)", value: null }
    ]}]
  },
  // ── Bulgaria ──────────────────────────────────────────────────
  {
    id: "bulgaria", name: "Bulgaria",
    scales: [{ name: "Bulgarsk skala (2–6)", src: SRC.UIS, grades: [
      { label: "6 – Otlichen",         value: 5 },
      { label: "5 – Mnog dobar",       value: 4 },
      { label: "4 – Dobar",            value: 3 },
      { label: "3 – Sreden",           value: 1.5 },
      { label: "2 – Slab / Stryk",     value: null }
    ]}]
  },
  // ── Danmark ───────────────────────────────────────────────────
  {
    id: "denmark", name: "Danmark",
    scales: [{ name: "Dansk 7-trinnskala", src: SRC.UIS, grades: [
      { label: "12",                value: 5 },
      { label: "10",                value: 4 },
      { label: "7",                 value: 3 },
      { label: "4",                 value: 2 },
      { label: "02",                value: 1 },
      { label: "00 – Stryk",        value: null },
      { label: "-3 – Stryk",        value: null }
    ]}]
  },
  // ── England/UK ────────────────────────────────────────────────
  // Kilde NMBU/Opptakskontoret
  {
    id: "uk", name: "England / Storbritannia",
    scales: [{ name: "Britisk Honours-system", src: SRC.HH, grades: [
      { label: "First class honours (70–100 %)",         value: 5 },
      { label: "Upper second class (2:1) (60–69 %)",     value: 4 },
      { label: "Lower second class (2:2) (50–59 %)",     value: 3 },
      { label: "Third class honours (40–49 %)",          value: 2 },
      { label: "Ordinary degree (35–39 %)",              value: 1 },
      { label: "Fail – Stryk",                           value: null }
    ]}]
  },
  // ── Estland ───────────────────────────────────────────────────
  {
    id: "estonia", name: "Estland",
    scales: [{ name: "Estisk skala (0–5)", src: SRC.UIS, grades: [
      { label: "5 – Väga hea",     value: 5 },
      { label: "4 – Hea",          value: 3.5 },
      { label: "3 – Rahuldav",     value: 2 },
      { label: "2 – Kasin",        value: 1 },
      { label: "1 / 0 – Stryk",    value: null }
    ]}]
  },
  // ── Finland ───────────────────────────────────────────────────
  {
    id: "finland", name: "Finland",
    scales: [{ name: "Finsk skala (0–5)", src: SRC.UIS, grades: [
      { label: "5 – Kiitettävä",      value: 5 },
      { label: "4 – Hyvä",            value: 4 },
      { label: "3 – Hyvä",            value: 3 },
      { label: "2 – Tyydyttävä",      value: 2 },
      { label: "1 – Tyydyttävä",      value: 1 },
      { label: "0 – Hylätty / Stryk", value: null }
    ]}]
  },
  // ── Frankrike ─────────────────────────────────────────────────
  {
    id: "france", name: "Frankrike",
    scales: [{ name: "Fransk skala (0–20)", src: SRC.UIS, grades: [
      { label: "16–20 – Très bien",   value: 5 },
      { label: "14–15 – Bien",        value: 4 },
      { label: "12–13 – Assez bien",  value: 3 },
      { label: "10–11 – Passable",    value: 2 },
      { label: "Under 10 – Stryk",    value: null }
    ]}]
  },
  // ── Ghana ─────────────────────────────────────────────────────
  {
    id: "ghana", name: "Ghana",
    scales: [
      { name: "University of Ghana (fra 2009/2010)", src: SRC.HH, grades: [
        { label: "4,0",                value: 5    },
        { label: ">= 3,90",            value: 4.75 },
        { label: ">= 3,80",            value: 4.5  },
        { label: ">= 3,70",            value: 4.25 },
        { label: ">= 3,6",             value: 4    },
        { label: ">= 3,52",            value: 3.75 },
        { label: ">= 3,45",            value: 3.5  },
        { label: ">= 3,37",            value: 3.25 },
        { label: ">= 3,30",            value: 3    },
        { label: ">= 3,25",            value: 2.5  },
        { label: ">= 2,5",             value: 2    },
        { label: ">= 2,0",             value: 1.5  },
        { label: ">= 1,50",            value: 1    },
        { label: "Under 1,50 – Stryk", value: null }
      ]},
      { name: "University of Ghana (inntil 2008/2009)", src: SRC.HH, grades: [
        { label: "A+ (80–100)",         value: 5    },
        { label: "A  (75–79)",          value: 4.5  },
        { label: "B+ (70–74)",          value: 4    },
        { label: "B  (65–69)",          value: 3.5  },
        { label: "C+ (60–64)",          value: 3    },
        { label: "C  (55–59)",          value: 2.5  },
        { label: "D+ (50–54)",          value: 2    },
        { label: "D  (45–49)",          value: 1    },
        { label: "E / F – Stryk",       value: null }
      ]},
      { name: "Kwame Nkrumah Univ. of Science and Tech. (fra 2009/2010)", src: SRC.HH, grades: [
        { label: "4,0",                value: 5    },
        { label: ">= 3,90",            value: 4.75 },
        { label: ">= 3,80",            value: 4.5  },
        { label: ">= 3,70",            value: 4.25 },
        { label: ">= 3,6",             value: 4    },
        { label: ">= 3,52",            value: 3.75 },
        { label: ">= 3,45",            value: 3.5  },
        { label: ">= 3,37",            value: 3.25 },
        { label: ">= 3,30",            value: 3    },
        { label: ">= 3,25",            value: 2.5  },
        { label: ">= 2,5",             value: 2    },
        { label: ">= 2,0",             value: 1.5  },
        { label: ">= 1,50",            value: 1    },
        { label: "Under 1,50 – Stryk", value: null }
      ]},
      { name: "Kwame Nkrumah Univ. of Science and Tech. (inntil 2008/2009)", src: SRC.HH, grades: [
        { label: "A (70–100)",         value: 5    },
        { label: "B (60–69)",          value: 4    },
        { label: "C (50–59)",          value: 3    },
        { label: "D (45–49)",          value: 1.5  },
        { label: "E / F – Stryk",      value: null }
      ]},
      { name: "University of Cape Coast", src: SRC.HH, grades: [
        { label: "A (70–100)",         value: 5    },
        { label: "B+ (65–69)",         value: 4.5  },
        { label: "B  (60–64)",         value: 4    },
        { label: "C+ (55–59)",         value: 3    },
        { label: "C  (50–54)",         value: 2.5  },
        { label: "D  (45–49)",         value: 1    },
        { label: "E / F – Stryk",      value: null }
      ]},
      { name: "University for Development Studies", src: SRC.HH, grades: [
        { label: "A (70–100)",         value: 5    },
        { label: "B+ (65–69)",         value: 4.5  },
        { label: "B  (60–64)",         value: 4    },
        { label: "C+ (55–59)",         value: 3    },
        { label: "C  (50–54)",         value: 2.5  },
        { label: "D  (45–49)",         value: 1    },
        { label: "E / F – Stryk",      value: null }
      ]},
      { name: "Ghana Institute of Management and Public Administration", src: SRC.HH, grades: [
        { label: "A (75–100)",         value: 5    },
        { label: "B (65–74)",          value: 4    },
        { label: "C (55–64)",          value: 3    },
        { label: "D (50–54)",          value: 1    },
        { label: "E / F – Stryk",      value: null }
      ]},
      { name: "Central University College", src: SRC.HH, grades: [
        { label: "A (70–100)",         value: 5    },
        { label: "B (60–69)",          value: 4    },
        { label: "C (50–59)",          value: 3    },
        { label: "D (45–49)",          value: 1    },
        { label: "E / F – Stryk",      value: null }
      ]},
      { name: "Univ. of Professional Studies, Accra (fra 2011/2012)", src: SRC.HH, grades: [
        { label: "4,0",                value: 5    },
        { label: ">= 3,90",            value: 4.75 },
        { label: ">= 3,80",            value: 4.5  },
        { label: ">= 3,70",            value: 4.25 },
        { label: ">= 3,6",             value: 4    },
        { label: ">= 3,5",             value: 3.75 },
        { label: ">= 3,4",             value: 3.5  },
        { label: ">= 3,3",             value: 3.25 },
        { label: ">= 3,2",             value: 3    },
        { label: ">= 3,0",             value: 2.5  },
        { label: ">= 2,5",             value: 2    },
        { label: ">= 2,0",             value: 1.5  },
        { label: ">= 1,0",             value: 1    },
        { label: "Under 1,0 – Stryk",  value: null }
      ]}
    ]
  },
  // ── Ungarn ────────────────────────────────────────────────────
  {
    id: "hungary", name: "Ungarn",
    scales: [{ name: "Ungarsk skala (1–5)", src: SRC.ELTE, grades: [
      { label: "5 – Jeles (Excellent)",       value: 4.5 },
      { label: "4 – Jó (Good)",               value: 3   },
      { label: "3 – Közepes (Satisfactory)",  value: 2   },
      { label: "2 – Elégséges (Pass)",        value: 1   },
      { label: "1 – Elégtelen (Fail) – Stryk", value: null }
    ]}]
  },
  // ── Iran ──────────────────────────────────────────────────────
  {
    id: "iran", name: "Iran",
    scales: [{ name: "Iransk tallskala (0–20)", src: SRC.HH, grades: [
      { label: "20",                  value: 5    },
      { label: ">= 19,17",            value: 4.75 },
      { label: ">= 18,75",            value: 4.5  },
      { label: ">= 18,33",            value: 4.25 },
      { label: ">= 18",               value: 4    },
      { label: ">= 17,5",             value: 3.75 },
      { label: ">= 17",               value: 3.5  },
      { label: ">= 16,5",             value: 3.25 },
      { label: ">= 15,5",             value: 3    },
      { label: ">= 14",               value: 2.5  },
      { label: ">= 12,5",             value: 2    },
      { label: ">= 11,5",             value: 1.5  },
      { label: ">= 10",               value: 1    },
      { label: "Under 10 – Stryk",    value: null }
    ]}]
  },
  // ── Italia ────────────────────────────────────────────────────
  {
    id: "italy", name: "Italia",
    scales: [{ name: "Italiensk skala (18–30 + laud)", type: "linear", minPass: 18, maxGrade: 30, laudGrade: 31,
      warn: "Omregningen er basert på lineær interpolasjon og ikke statistikk om faktisk bruk av karakterskalaen. Laveste bestått (18) tilsvarer E (1 poeng), høyeste (30) tilsvarer A (5 poeng). 30 con lode skrives «30L».",
      src: null
    }]
  },
  // ── Litauen ───────────────────────────────────────────────────
  {
    id: "lithuania", name: "Litauen",
    scales: [{ name: "Litauisk tallskala (1–10)", src: SRC.OSLO, grades: [
      { label: "10 – Fremragende",  value: 5 },
      { label: "8–9 – Meget god",   value: 4 },
      { label: "7 – God",           value: 3 },
      { label: "6 – Nokså god",     value: 2 },
      { label: "5 – Tilstrekkelig", value: 1 },
      { label: "Under 5 – Stryk",   value: null }
    ]}]
  },
  // ── Nederland ─────────────────────────────────────────────────
  // OsloMet-granularitet fra 6,9 og opp; konflikt ved 6,0–6,9: UiS brukt
  {
    id: "netherlands", name: "Nederland",
    scales: [{ name: "Nederlandsk tallskala (1–10)", src: SRC.OSLO, grades: [
      { label: ">= 9,0",              value: 5    },
      { label: ">= 8,5",              value: 4.75 },
      { label: ">= 8,0",              value: 4.5  },
      { label: ">= 7,9",              value: 4.25 },
      { label: ">= 7,7",              value: 4    },
      { label: ">= 7,5",              value: 3.75 },
      { label: ">= 7,3",              value: 3.5  },
      { label: ">= 7,1",              value: 3.25 },
      { label: ">= 6,9",              value: 3    },
      { label: "6,5–6,9",             value: 2.5  },
      { label: "6,0–6,4 (UiS)",       value: 1    },
      { label: "Under 6,0 – Stryk",   value: null }
    ]}]
  },
  // ── Nepal ─────────────────────────────────────────────────────
  {
    id: "nepal", name: "Nepal",
    scales: [
      { name: "40–100 % skala (inkl. Tribhuvan gammel, før 2021)", src: SRC.HH, grades: [
        { label: "100–88 %",            value: 5    },
        { label: "> 87 %",              value: 4.75 },
        { label: "> 84 %",              value: 4.5  },
        { label: "> 81 %",              value: 4.25 },
        { label: "> 78 %",              value: 4    },
        { label: "> 75 %",              value: 3.75 },
        { label: "> 72 %",              value: 3.5  },
        { label: "> 69 %",              value: 3.25 },
        { label: "> 66 %",              value: 3    },
        { label: "> 63 %",              value: 2.5  },
        { label: "> 60 %",              value: 2    },
        { label: "> 55 %",              value: 1.5  },
        { label: ">= 40 %",             value: 1    },
        { label: "Under 40 % – Stryk",  value: null }
      ]},
      { name: "Tribhuvan ny skala (fra 2021, GPA 0–4)", src: SRC.HH, grades: [
        { label: "4,0 – Outstanding",            value: 5    },
        { label: ">= 3,7 – Excellent",           value: 4.75 },
        { label: ">= 3,3 – Very good",           value: 4.25 },
        { label: ">= 3,0 – Good",                value: 3.75 },
        { label: ">= 2,7 – Satisfactory",        value: 3.25 },
        { label: ">= 2,0 – Acceptable",          value: 2.5  },
        { label: ">= 1,6 – Partially acceptable",value: 1.5  },
        { label: "Under 1,6 – Stryk",            value: null }
      ]}
    ]
  },
  // ── Norge (gammel skala) ──────────────────────────────────────
  {
    id: "norway_old", name: "Norge (gammel skala)",
    scales: [{ name: "Gammel norsk tallskala (1,0–4,0)", src: SRC.UIS, grades: [
      { label: "1,0–2,2",          value: 5 },
      { label: "2,3–2,5",          value: 4 },
      { label: "2,6–2,7",          value: 3 },
      { label: "2,8–3,0",          value: 2 },
      { label: "3,1–4,0",          value: 1 },
      { label: "Over 4,0 – Stryk", value: null }
    ]}]
  },
  // ── Nigeria ───────────────────────────────────────────────────
  {
    id: "nigeria", name: "Nigeria",
    scales: [{ name: "Nigeriansk GPA-skala (0–5)", src: SRC.HH, grades: [
      { label: "5,0 – First class",              value: 5    },
      { label: ">= 4,5 – First class",           value: 4.75 },
      { label: ">= 4,0 – Second class upper",    value: 4    },
      { label: ">= 3,5 – Second class upper",    value: 3.5  },
      { label: ">= 3,0 – Second class lower",    value: 3    },
      { label: ">= 2,5 – Second class lower",    value: 2.5  },
      { label: ">= 2,0 – Third class",           value: 2    },
      { label: ">= 1,0 – Pass",                  value: 1    },
      { label: "Under 1,0 – Stryk",              value: null }
    ]}]
  },
  // ── Russland ──────────────────────────────────────────────────
  {
    id: "russia", name: "Russland",
    scales: [{ name: "Russisk skala (2–5)", src: SRC.UIS, grades: [
      { label: "5 – Otlichno / Fremragende",        value: 5 },
      { label: "4 – Horosho / God",                 value: 3 },
      { label: "3 – Udovletvoritelno / Tilstrekkelig", value: 1.5 },
      { label: "2 – Neudovletvoritelno / Stryk",    value: null }
    ]}]
  },
  // ── Spania ────────────────────────────────────────────────────
  {
    id: "spain", name: "Spania",
    scales: [{ name: "Spansk tallskala (0–10)", src: SRC.OSLO, grades: [
      { label: "> 9,50",              value: 5    },
      { label: "> 9,25",              value: 4.75 },
      { label: "> 9,00",              value: 4.5  },
      { label: "> 8,75",              value: 4.25 },
      { label: "> 8,50",              value: 4    },
      { label: "> 8,00",              value: 3.75 },
      { label: "> 7,50",              value: 3.5  },
      { label: "> 7,25",              value: 3.25 },
      { label: "> 7,00",              value: 3    },
      { label: "> 6,75",              value: 2.75 },
      { label: "> 6,50",              value: 2.5  },
      { label: "> 6,25",              value: 2.25 },
      { label: "> 6,00",              value: 2    },
      { label: "> 5,75",              value: 1.75 },
      { label: "> 5,50",              value: 1.5  },
      { label: "> 5,10",              value: 1.25 },
      { label: "5,00",                value: 1    },
      { label: "Under 5,0 – Stryk",   value: null }
    ]}]
  },
  // ── Sverige ───────────────────────────────────────────────────
  {
    id: "sweden", name: "Sverige",
    scales: [
      { name: "G–MVG skala (3 trinn, fra ~1994)", src: SRC.UIS, grades: [
        { label: "MVG – Mycket Väl Godkänt", value: 5 },
        { label: "VG – Väl Godkänt",         value: 3.5 },
        { label: "G – Godkänt",              value: 1.5 },
        { label: "Underkänd – Stryk",        value: null }
      ]},
      { name: "G–VG skala (2 trinn, eldre)", src: SRC.UIS, grades: [
        { label: "VG – Väl Godkänt",  value: 4 },
        { label: "G – Godkänt",       value: 2.5 },
        { label: "Underkänd – Stryk", value: null }
      ]}
    ]
  },
  // ── Syria ─────────────────────────────────────────────────────
  {
    id: "syria", name: "Syria",
    scales: [
      { name: "Prosentskala – 50 % beståttgrense", src: SRC.UIS, grades: [
        { label: "90–100 %",           value: 5 },
        { label: "80–89 %",            value: 4 },
        { label: "70–79 %",            value: 3 },
        { label: "60–69 %",            value: 2.5 },
        { label: "50–59 %",            value: 1 },
        { label: "Under 50 % – Stryk", value: null }
      ]},
      { name: "Prosentskala – 60 % beståttgrense", src: SRC.UIS, grades: [
        { label: "90–100 %",           value: 5 },
        { label: "80–89 %",            value: 4 },
        { label: "75–79 %",            value: 3 },
        { label: "70–74 %",            value: 2.5 },
        { label: "60–69 %",            value: 1 },
        { label: "Under 60 % – Stryk", value: null }
      ]}
    ]
  },
  // ── Tyrkia ────────────────────────────────────────────────────
  {
    id: "turkey", name: "Tyrkia",
    scales: [{ name: "Tyrkisk skala (AA–FF)", src: SRC.UIS, grades: [
      { label: "AA / 90–100 – Pekiyi",      value: 5 },
      { label: "BA / 85–89 – Iyi",          value: 4 },
      { label: "BB / 80–84 – Iyi",          value: 4 },
      { label: "CB / 75–79 – Orta",         value: 2.5 },
      { label: "CC / 70–74 – Orta",         value: 2.5 },
      { label: "DC / 60–69 – Gecer",        value: 1.5 },
      { label: "DD / 50–59 – Gecer (svak)", value: 1 },
      { label: "FF / under 50 – Stryk",     value: null }
    ]}]
  },
  // ── Tyskland ──────────────────────────────────────────────────
  {
    id: "germany", name: "Tyskland",
    scales: [{ name: "Tysk skala 1–5 (med ECTS-ekvivalent)", src: SRC.UIS, grades: [
      { label: "1,0–1,5 / A – Sehr gut",              value: 5 },
      { label: "1,6–2,0 / B – Gut",                   value: 4 },
      { label: "2,1–3,0 / C – Befriedigend",          value: 3 },
      { label: "3,1–3,5 / D – Ausreichend",           value: 2 },
      { label: "3,6–4,0 / E – Ausreichend",           value: 1 },
      { label: "4,1–5,0 / F – Nicht bestanden (Stryk)", value: null }
    ]}]
  },
  // ── Ukraina ───────────────────────────────────────────────────
  {
    id: "ukraine", name: "Ukraina",
    scales: [
      { name: "System 1 – tradisjonell skala", src: SRC.UIS, grades: [
        { label: "5 – Fremragende",      value: 5 },
        { label: "4 – God",              value: 3 },
        { label: "3 – Tilstrekkelig",    value: 1.5 },
        { label: "2 – Stryk",            value: null }
      ]},
      { name: "System 2 – ECTS-basert skala", src: SRC.UIS, grades: [
        { label: "5 / A – Fremragende",  value: 5 },
        { label: "4,5 / B – Meget god",  value: 4 },
        { label: "4 / C – God",          value: 3 },
        { label: "3,5 / D – Nokså god",  value: 2 },
        { label: "3 / E – Tilstrekkelig", value: 1 },
        { label: "2 / F – Stryk",        value: null },
        { label: "1 / FX – Stryk",       value: null }
      ]}
    ]
  },
  // ── USA ───────────────────────────────────────────────────────
  {
    id: "usa", name: "USA",
    scales: [{ name: "Amerikansk GPA-skala (4,0)", src: SRC.HH, grades: [
      { label: "4,0",                  value: 5    },
      { label: ">= 3,9",               value: 4.75 },
      { label: ">= 3,85",              value: 4.5  },
      { label: ">= 3,8",               value: 4.25 },
      { label: ">= 3,7",               value: 4    },
      { label: ">= 3,5",               value: 3.75 },
      { label: ">= 3,3",               value: 3.5  },
      { label: ">= 3,15",              value: 3.25 },
      { label: ">= 3,0",               value: 3    },
      { label: ">= 2,7",               value: 2.5  },
      { label: ">= 2,0",               value: 2    },
      { label: ">= 1,7",               value: 1.5  },
      { label: ">= 0,7",               value: 1    },
      { label: "Under 0,7 – Stryk",    value: null }
    ]}]
  },
  // ── Annen skala (lineær) ──────────────────────────────────────
  {
    id: "custom_linear", name: "Annen skala (lineær omregning)",
    scales: [{ name: "Egendefinert lineær skala", type: "linear", minPass: null, maxGrade: null, laudGrade: null,
      warn: "Lineær interpolasjon: laveste bestått tilsvarer E (1 poeng), høyeste karakter tilsvarer A (5 poeng). Metoden er en forenkling og tar ikke hensyn til statistikk om faktisk bruk av karakterskalaen.",
      src: null
    }]
  },
  // ── Annen skala (invertert lineær) ────────────────────────────
  {
    id: "custom_linear_inv", name: "Annen skala, invertert (laveste tall er best)",
    scales: [{ name: "Egendefinert invertert lineær skala", type: "linear_inv", bestGrade: null, maxPass: null,
      warn: "Lineær interpolasjon (invertert skala): beste karakter (laveste tall) tilsvarer A (5 poeng), høyeste bestått tilsvarer E (1 poeng). Karakterer over høyeste bestått regnes som stryk. Metoden er en forenkling og tar ikke hensyn til statistikk om faktisk bruk av karakterskalaen.",
      src: null
    }]
  }
];

// ECTS first, custom_linear* last (in order), rest alphabetically
const CUSTOM_LAST = ['custom_linear', 'custom_linear_inv'];
COUNTRIES.sort((a, b) => {
  if (a.id === 'ects') return -1;
  if (b.id === 'ects') return 1;
  const ai = CUSTOM_LAST.indexOf(a.id), bi = CUSTOM_LAST.indexOf(b.id);
  if (ai >= 0 && bi >= 0) return ai - bi;
  if (ai >= 0) return 1;
  if (bi >= 0) return -1;
  return a.name.localeCompare(b.name, 'no');
});
