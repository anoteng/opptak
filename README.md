# Karakteromregner – HH-Utdanning / NMBU

Statisk nettside for omregning av utenlandske karakterer til norsk GPA-skala (A–F / 1–5 poeng), beregnet etter vektet snitt per studiepoeng. Beregnet på saksbehandlere ved opptakskontoret.

## Innhold

- [Bruk](#bruk)
- [Servering med nginx](#servering-med-nginx)
- [Filstruktur](#filstruktur)
- [Tilpasning – legge til skalaer og land](#tilpasning--legge-til-skalaer-og-land)
- [Karakteromregning – norsk skala](#karakteromregning--norsk-skala)

---

## Bruk

### 1. Velg land og karakterskala

Velg landet karakterene er utstedt fra. For land med flere skalaer (f.eks. Ghana, Nepal, Sverige) velges riktig skala i et nytt felt. En badge viser hvilken kilde skalaen er hentet fra, med lenke der det er tilgjengelig.

For skalaer med kjente tallgrenser kan du skrive inn tallkarakteren direkte – riktig intervall velges automatisk i nedtrekksmenyen.

### 2. Legg til emner

Fyll inn karakter og studiepoeng per emne. Emnenavnet er valgfritt. Ny linje legges automatisk til når karakter og studiepoeng er registrert.

**Fagkrav:** Kryss av «Fagkrav» på relevante emner. Da vises to separate snittberegninger: én for alle emner og én for fagkravsemner alene. Dette er i tråd med [Forskrift om studier ved NMBU](https://main-bvxea6i-kdsvgmpf4iwws.eu-5.platformsh.site/sites/default/files/2025-07/Forskrift%20om%20studier%20ved%20NMBU%20med%20utfyllende%20bestemmelser_vedtatt%20US%2009032023_endret%20av%20US%2012062025_2.pdf), som åpner for å beregne snitt på enten hele bachelorgraden eller kun fagkravsemner.

### 3. Resultat

Vektet norsk snitt og tilhørende bokstavkarakter (A–F) vises fortløpende. Ved stryk-karakterer vises disse separat i studiepoeng.

### Lineær omregning

For land uten egne omregningstabeller (f.eks. Italia, eller ukjente skalaer) brukes lineær interpolasjon:

- Laveste bestått → E (1 poeng)
- Høyeste karakter → A (5 poeng)

Velg **«Annen skala (lineær omregning)»** og oppgi laveste bestått og høyeste karakter. For Italia er disse forhåndsutfylt (18–30, med støtte for 30L).

> **Merk:** Lineær omregning er en forenkling og tar ikke hensyn til den faktiske fordelingen av karakterer ved institusjonen.

### Lagring

Utregninger kan lagres lokalt i nettleseren med søkernummer som referanse. Lagrede oppføringer kan lastes inn igjen eller slettes. Data lagres kun i den aktuelle nettleseren og forsvinner ved tømming av nettleserens lokale data (localStorage).

---

## Servering med nginx

Plasser filene i `/var/www/opptak/` (eller annen katalog) og inkluder `nginx-opptak.conf` i server-blokken for `hh-utdanning.nmbu.no`:

```nginx
location /opptak {
    alias /var/www/opptak;
    index index.html;
    try_files $uri $uri/ /opptak/index.html;
}
```

Siden bruker ES-moduler (`type="module"`), noe alle moderne nettlesere støtter. Ingen build-steg er nødvendig.

---

## Filstruktur

```
index.html   – HTML-markup
style.css    – All CSS
data.js      – Omregningstabeller (COUNTRIES-array og SRC-konstanter)
app.js       – All logikk og DOM-kode, importerer fra data.js
```

---

## Tilpasning – legge til skalaer og land

All omregningsdata ligger i `data.js`. Redigering her krever ingen endringer i `app.js` eller `index.html`.

### Legge til en ny kilde

Kilder defineres øverst i `data.js` i `SRC`-objektet:

```js
export const SRC = {
  UIS:  { name: "UiS",    url: "https://..." },
  OSLO: { name: "OsloMet", url: "https://..." },
  HH:   { name: "NMBU/Opptakskontoret", url: null }
};
```

Legg til et nytt nøkkel/verdi-par for den nye kilden. `url: null` gir ren tekst i stedet for lenke.

### Legge til et nytt land med oppslagstabell

Legg til et nytt objekt i `COUNTRIES`-arrayen. Rekkefølgen i arrayen spiller ingen rolle – listen sorteres automatisk alfabetisk (med ECTS først).

```js
{
  id: "poland",          // unik ID, kun bokstaver og bindestreker
  name: "Polen",         // vises i nedtrekksmenyen
  scales: [{
    name: "Polsk skala (2–5)",
    src: SRC.UIS,        // kildereferanse
    grades: [
      { label: "5 – Bardzo dobry",  value: 5   },
      { label: "4 – Dobry",         value: 3.5 },
      { label: "3 – Dostateczny",   value: 1.5 },
      { label: "2 – Niedostateczny – Stryk", value: null }
    ]
  }]
}
```

**`label`** vises i nedtrekksmenyen og i omregningstabellen.  
**`value`** er norsk poengverdi (1–5). Bruk `null` for stryk.

### Legge til et land med flere skalaer

Legg til flere objekter i `scales`-arrayen. Brukeren får da en ekstra nedtrekksmeny for å velge skala:

```js
{
  id: "sweden",
  name: "Sverige",
  scales: [
    { name: "G–MVG (fra ~1994)", src: SRC.UIS, grades: [ /* ... */ ] },
    { name: "G–VG (eldre)",      src: SRC.UIS, grades: [ /* ... */ ] }
  ]
}
```

### Tallbaserte skalaer med automatisk intervallvalg

For skalaer der karakteren er et tall (f.eks. 0–20, 40–100 %) kan label-teksten inneholde grenseverdier. Appen tolker da etikettene automatisk og lar brukeren skrive inn tallkarakteren direkte.

Støttede label-formater:

| Format | Eksempel | Tolkning |
|---|---|---|
| Enkeltverdi | `"4,0"` | Nøyaktig verdi |
| Grense med >= | `">= 3,5"` | Alt fra og med 3,5 |
| Intervall | `"6,0–6,4"` | Fra laveste grense (6,0) |
| Prosentintervall | `"80–89 %"` | Fra laveste grense (80) |
| Stryk | `"Under 10 – Stryk"` | Fallback for alt under grensen |

Tallformat: bruk komma (`3,5`) eller punktum (`3.5`) – begge fungerer.

### Lineær omregning (fast skala)

For land der lineær interpolasjon er eneste tilgjengelige metode, bruk `type: "linear"`:

```js
{
  id: "italy",
  name: "Italia",
  scales: [{
    name: "Italiensk skala (18–30 + laud)",
    type: "linear",
    minPass: 18,      // laveste bestått → E (1 poeng)
    maxGrade: 30,     // høyeste → A (5 poeng)
    laudGrade: 31,    // valgfritt: "30L" tolkes som denne verdien
    warn: "Omregningen er basert på lineær interpolasjon ...",
    src: null
  }]
}
```

Sett `minPass: null` og `maxGrade: null` for å la brukeren oppgi grensene selv (som for «Annen skala»).

---

## Karakteromregning – norsk skala

| Norsk poengverdi | Bokstav | Beskrivelse |
|---|---|---|
| ≥ 4,5 | A | Fremragende |
| ≥ 3,5 | B | Meget god |
| ≥ 2,5 | C | God |
| ≥ 1,5 | D | Nokså god |
| ≥ 0,5 | E | Tilstrekkelig |
| – | F | Stryk |

Omregningsverdier i tabellene er basert på [UiS](https://www.uis.no/nb/studier/omregning-av-karaktersystem), [OsloMet](https://www.oslomet.no/studier/soknad-og-opptak/poengberegning-rangeringsregler/omregning-av-karakterer) og NMBU/Opptakskontoret. Der kildene er i konflikt brukes UiS-verdien. Der OsloMet har større granularitet enn UiS uten konflikt, brukes OsloMet.
