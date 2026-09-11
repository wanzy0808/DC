export const invitationPalettes = {
  rose: { name: "Rose", bg: "#fbf2f0", surface: "#fffaf8", ink: "#2d2020", accent: "#7a1c25", soft: "#e8b7b1" },
  blush: { name: "Blush", bg: "#fff4f6", surface: "#fffafb", ink: "#34242a", accent: "#a44f62", soft: "#e9a9b9" },
  sage: { name: "Sage", bg: "#f3f5ee", surface: "#fcfcf8", ink: "#273027", accent: "#65775f", soft: "#b8c9ae" },
  night: { name: "Night", bg: "#171318", surface: "#211b22", ink: "#f8f2ee", accent: "#e7a9b1", soft: "#9b7079" },
  pearl: { name: "Pearl", bg: "#f5f1ea", surface: "#fffdf8", ink: "#292522", accent: "#806a5a", soft: "#cdbba8" },
} as const;

export const invitationFonts = {
  abrilLato: { name: "Abril Fatface + Lato", heading: "Abril Fatface", body: "Lato" },
  fugazWork: { name: "Fugaz One + Work Sans", heading: "Fugaz One", body: "Work Sans" },
  spaceJakarta: { name: "Space Mono + Plus Jakarta Sans", heading: "Space Mono", body: "Plus Jakarta Sans" },
  grandLato: { name: "Grand Hotel + Lato", heading: "Grand Hotel", body: "Lato" },
  ralewayMerriweather: { name: "Raleway + Merriweather", heading: "Raleway", body: "Merriweather" },
  chonburiDomine: { name: "Chonburi + Domine", heading: "Chonburi", body: "Domine" },
  interKrub: { name: "Inter + Krub", heading: "Inter", body: "Krub" },
  oswaldSourceSerif: { name: "Oswald + Source Serif 4", heading: "Oswald", body: "Source Serif 4" },
  arimaMulish: { name: "Arima Madurai + Mulish", heading: "Arima Madurai", body: "Mulish" },
  nunitoLora: { name: "Nunito + Lora", heading: "Nunito", body: "Lora" },
  ultraSlabo: { name: "Ultra + Slabo", heading: "Ultra", body: "Slabo" },
  arvoLato: { name: "Arvo + Lato", heading: "Arvo", body: "Lato" },
  unicaCrimson: { name: "Unica One + Crimson Text", heading: "Unica One", body: "Crimson Text" },
  cinzelFauna: { name: "Cinzel + Fauna One", heading: "Cinzel", body: "Fauna One" },
  yesevaJosefin: { name: "Yeseva One + Josefin Sans", heading: "Yeseva One", body: "Josefin Sans" },
  sacramentoAlice: { name: "Sacramento + Alice", heading: "Sacramento", body: "Alice" },
  robotoLora: { name: "Roboto + Lora", heading: "Roboto", body: "Lora" },
  montserratKarla: { name: "Montserrat + Karla", heading: "Montserrat", body: "Karla" },
  fjallaCantarell: { name: "Fjalla One + Cantarell", heading: "Fjalla One", body: "Cantarell" },
  sourceSansAlegreya: { name: "Source Sans Pro + Alegreya", heading: "Source Sans 3", body: "Alegreya" },
  stintPontano: { name: "Stint Ultra Expanded + Pontano Sans", heading: "Stint Ultra Expanded", body: "Pontano Sans" },
  ubuntuRokkitt: { name: "Ubuntu + Rokkitt", heading: "Ubuntu", body: "Rokkitt" },
  nunitoPtSans: { name: "Nunito + PT Sans", heading: "Nunito", body: "PT Sans" },
  dotGothicSpace: { name: "DotGothic16 + Space Mono", heading: "DotGothic16", body: "Space Mono" },
  playfairLato: { name: "Playfair Display + Lato", heading: "Playfair Display", body: "Lato" },
  quicksand: { name: "Quicksand Bold + Quicksand Regular", heading: "Quicksand", body: "Quicksand" },
  syneInter: { name: "Syne + Inter", heading: "Syne", body: "Inter" },
  yellowtailRethink: { name: "Yellowtail + Rethink Sans", heading: "Yellowtail", body: "Rethink Sans" },
  rufinaAverage: { name: "Rufina + Average Sans", heading: "Rufina", body: "Average Sans" },
  poiretMontserrat: { name: "Poiret One + Montserrat", heading: "Poiret One", body: "Montserrat" },
  sintonyPoppins: { name: "Sintony + Poppins", heading: "Sintony", body: "Poppins" },
  philosopherMulish: { name: "Philosopher + Mulish", heading: "Philosopher", body: "Mulish" },
  cardoHind: { name: "Cardo + Hind", heading: "Cardo", body: "Hind" },
  bubblegumOpenSans: { name: "Bubblegum Sans + Open Sans", heading: "Bubblegum Sans", body: "Open Sans" },
  archivoTenor: { name: "Archivo Narrow + Tenor Sans", heading: "Archivo Narrow", body: "Tenor Sans" },
  rethinkSpectral: { name: "Rethink Sans + Spectral", heading: "Rethink Sans", body: "Spectral" },
  crimsonDmSans: { name: "Crimson Serif + DM Sans", heading: "Crimson Pro", body: "DM Sans" },
  youngInstrument: { name: "Young Serif + Instrument Sans", heading: "Young Serif", body: "Instrument Sans" },
  instrumentGeist: { name: "Instrument Sans + Geist", heading: "Instrument Sans", body: "Geist" },
} as const;

export type PaletteKey = keyof typeof invitationPalettes;
export type FontKey = keyof typeof invitationFonts;

export function makeDesignKey(template: string, palette: PaletteKey, font: FontKey) {
  return `${template}::${palette}::${font}`;
}

export function parseDesignKey(key: string) {
  const [template = "eternal-blossom", palette = "rose", font = "cinzelFauna"] = key.split("::");
  return {
    template,
    palette: (palette in invitationPalettes ? palette : "rose") as PaletteKey,
    font: (font in invitationFonts ? font : "cinzelFauna") as FontKey,
  };
}
