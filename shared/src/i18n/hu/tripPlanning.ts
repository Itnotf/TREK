import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Tervezzetek együtt',
  'tripPlanning.intro':
    'Beszéljétek át az ötleteiteket. Kérjétek meg az MI-t, hogy készítsen belőlük megvalósítható utazást.',
  'tripPlanning.chat': 'Utazási beszélgetés',
  'tripPlanning.proposal': 'Közös terv',
  'tripPlanning.chatHelp':
    'Itt osszátok meg az igényeket, hivatkozásokat és változtatásokat. Az utazás minden résztvevője olvashatja ezt a beszélgetést.',
  'tripPlanning.chatNext': 'Készen álltok? Kérjétek az MI-t a terv összeállítására',
  'tripPlanning.chatReadOnly': 'A beszélgetést olvashatod. Ennél az utazásnál a fiókod nem küldhet üzeneteket.',
  'tripPlanning.members': 'Résztvevők és meghívások',
  'tripPlanning.memberCount': '{count} utazó',
  'tripPlanning.memberCount.one': '{count} utazó',
  'tripPlanning.memberHelp': 'Bármikor meghívhatsz másokat. Egyedül is folytathatod a tervezést.',
  'tripPlanning.collaborators': 'Ki hagyhatja jóvá az útitervet',
  'tripPlanning.collaboratorsHelp':
    'A szervező és a kiválasztott társtervezők hagyhatják jóvá a tervet. Más résztvevők hozzászólhatnak és módosítást kérhetnek.',
  'tripPlanning.saveCollaborators': 'Társtervezők mentése',
  'tripPlanning.noOtherMembers': 'Hívj meg egy utazót, hogy társtervezőt választhass.',
  'tripPlanning.emptyTitle': 'Mitől lenne jó ez az utazás?',
  'tripPlanning.emptyHelp':
    'Írjátok le az úti célt, a napok számát, a résztvevőket és a legfontosabb szempontokat. Kezdjetek egy iránnyal, vagy kérjetek részletes tervet.',
  'tripPlanning.emptyExample':
    'Például: öt nap autóval Csengtuból a szüleimmel, könnyű séták, csendes szállodák és idő a helyi ételekre.',
  'tripPlanning.instruction': 'Hozzáadnál vagy módosítanál valamit? (nem kötelező)',
  'tripPlanning.instructionPlaceholder': 'Például: legyen lazább a harmadik nap, és maradjon a lefoglalt szálloda.',
  'tripPlanning.instructionHelp':
    'A kérésedet a csoport is látja. Az MI csak az alábbi gombok valamelyikének megnyomásakor indul el.',
  'tripPlanning.discuss': 'Ötleteink rendezése',
  'tripPlanning.generate': 'Részletes terv készítése',
  'tripPlanning.revise': 'Részletes terv módosítása',
  'tripPlanning.generating': 'Az MI átnézi a beszélgetést és elkészíti a tervet. Ez néhány percig tarthat.',
  'tripPlanning.confirming': 'Útiterv frissítése…',
  'tripPlanning.discussionStatus': 'Megvitatandó irány',
  'tripPlanning.detailedStatus': 'Részletes javaslat · jóváhagyásra vár',
  'tripPlanning.confirmedStatus': 'Jóváhagyott útiterv',
  'tripPlanning.revision': '{revision}. változat',
  'tripPlanning.agreements': 'Összegyűjtött igények',
  'tripPlanning.disagreements': 'Még eldöntendő lehetőségek',
  'tripPlanning.questions': 'Néhány tisztázandó kérdés',
  'tripPlanning.questionsHelp':
    'Válaszolj a beszélgetésben vagy írd be a válaszod fent, majd kérd az MI-től a terv frissítését.',
  'tripPlanning.outline': 'Az utazás napról napra',
  'tripPlanning.day': '{day}. nap',
  'tripPlanning.changes': 'Mi változott ebben a változatban',
  'tripPlanning.confirm': 'Útiterv jóváhagyása és frissítése',
  'tripPlanning.confirmHelp': 'Nézd át a fenti tervet. A jóváhagyás frissíti az utazás napi programját és útikalauzát.',
  'tripPlanning.memberConfirmHelp':
    'A beszélgetésben javasolhatsz változtatást. Az útitervet a szervező vagy egy társtervező hagyja jóvá.',
  'tripPlanning.confirmedHelp':
    'Ez a változat már érvénybe lépett. Folytassátok a beszélgetést, és ha változnak a tervek, készítsetek új javaslatot.',
  'tripPlanning.baselineChanged':
    'A javaslat elkészülte óta változott a napi program, a szállás vagy valamelyik foglalás. Jóváhagyás előtt készíts új javaslatot.',
  'tripPlanning.previousConfirmed':
    'A javaslat megvitatása alatt továbbra is a(z) {revision}. változat a jóváhagyott útiterv.',
  'tripPlanning.history': 'Változatelőzmények megtekintése',
  'tripPlanning.currentVersion': 'Vissza a jelenlegi tervhez',
  'tripPlanning.historyReadOnly':
    'Egy korábbi változatot olvasol. Módosításhoz vagy jóváhagyáshoz térj vissza a jelenlegi tervhez.',
  'tripPlanning.historyFailed': 'Nem sikerült betölteni a változatelőzményeket. Próbáld újra megnyitni.',
  'tripPlanning.historyEmpty': 'Még nincsenek korábbi változatok.',
  'tripPlanning.refresh': 'Közös terv frissítése',
  'tripPlanning.aiUnavailable':
    'Az MI nem érhető el ehhez a fiókhoz. A beszélgetést és a terv megtekintését folytathatod.',
  'tripPlanning.privacyTitle': 'Az MI használata előtt',
  'tripPlanning.privacyHelp':
    'A beállított MI-szolgáltatás megkapja az utazás közös beszélgetését és útitervét a javaslat elkészítéséhez. A privát MI-beszélgetéseid nem kerülnek bele.',
  'tripPlanning.privacyAccept': 'MI engedélyezése a kéréseimhez',
  'tripPlanning.error.load': 'Nem sikerült betölteni a közös tervet. Ellenőrizd a kapcsolatot, majd próbáld újra.',
  'tripPlanning.error.unavailable': 'Ez az utazás nem érhető el, vagy már nincs hozzáférésed.',
  'tripPlanning.error.forbidden':
    'Ehhez a művelethez nincs jogosultságod. Frissítsd az oldalt az aktuális hozzáférés ellenőrzéséhez.',
  'tripPlanning.error.stale_revision':
    'Valaki közben frissítette a tervet. Betöltöttük a legújabb változatot; nézd át, majd próbáld újra.',
  'tripPlanning.error.baseline_changed':
    'Az útiterv a javaslat elkészítése óta megváltozott. Készíts friss javaslatot; a jelenlegi útiterved megmaradt.',
  'tripPlanning.error.ai_unavailable':
    'Az MI nem érhető el ehhez a fiókhoz. Ellenőrizd az MI-kapcsolatot a beállításokban, majd próbáld újra.',
  'tripPlanning.error.privacy_required': 'Először olvasd el az MI-tájékoztatót, és engedélyezd az MI-t a kéréseidhez.',
  'tripPlanning.error.daily_limit': 'A mai MI-kereted elfogyott. Folytasd a beszélgetést, és próbáld újra holnap.',
  'tripPlanning.error.rate_limited': 'Túl sok MI-kérés érkezett. Várj egy kicsit, majd próbáld újra.',
  'tripPlanning.error.busy':
    'Az MI már készít egy javaslatot ehhez az utazáshoz. Frissítsd az oldalt egy kis idő múlva.',
  'tripPlanning.error.ai_failed':
    'Az MI nem tudott megfelelő javaslatot készíteni. A jelenlegi terved megmaradt. Próbálkozz rövidebb kéréssel.',
  'tripPlanning.discussionRecord': 'Megbeszélés a javaslat készítésekor (visszatekintéshez)',
};

export default tripPlanning;
