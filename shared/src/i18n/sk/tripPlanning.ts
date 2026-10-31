import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Plánujte spoločne',
  'tripPlanning.intro':
    'Preberte svoje nápady spoločne. Požiadajte AI, aby z nich zostavila cestu, na ktorú môžete vyraziť.',
  'tripPlanning.chat': 'Diskusia o ceste',
  'tripPlanning.proposal': 'Spoločný plán',
  'tripPlanning.chatHelp': 'Zdieľajte tu želania, odkazy a zmeny. Diskusiu môžu čítať všetci účastníci tejto cesty.',
  'tripPlanning.chatNext': 'Pripravení? Požiadajte AI o usporiadanie plánu',
  'tripPlanning.chatReadOnly': 'Diskusiu môžete čítať. Odosielanie správ je pre váš účet pri tejto ceste vypnuté.',
  'tripPlanning.members': 'Účastníci a pozvánky',
  'tripPlanning.memberCount': '{count} cestujúcich',
  'tripPlanning.memberCount.one': '{count} cestujúci',
  'tripPlanning.memberHelp': 'Ďalších ľudí môžete pozvať kedykoľvek. Plánovať môžete ďalej aj sami.',
  'tripPlanning.collaborators': 'Kto môže potvrdiť itinerár',
  'tripPlanning.collaboratorsHelp':
    'Plán môže potvrdiť organizátor a vybraní spolupracovníci. Ostatní môžu diskutovať a žiadať úpravy.',
  'tripPlanning.saveCollaborators': 'Uložiť spolupracovníkov',
  'tripPlanning.noOtherMembers': 'Pozvite cestujúceho, aby ste ho mohli vybrať za spolupracovníka.',
  'tripPlanning.emptyTitle': 'Čo by z tejto cesty urobilo príjemný zážitok?',
  'tripPlanning.emptyHelp':
    'Napíšte, kam chcete ísť, na koľko dní, kto pôjde a čo je pre vás dôležité. Začnite hrubým smerom alebo požiadajte o podrobný plán.',
  'tripPlanning.emptyExample':
    'Napríklad: päť dní autom z Čcheng-tu s rodičmi, nenáročné prechádzky, tiché hotely a čas na miestne jedlo.',
  'tripPlanning.instruction': 'Chcete niečo pridať alebo zmeniť? (nepovinné)',
  'tripPlanning.instructionPlaceholder': 'Napríklad: odľahči tretí deň a ponechaj rezervovaný hotel.',
  'tripPlanning.instructionHelp':
    'Vašu požiadavku uvidí skupina. AI sa spustí až po stlačení niektorého z tlačidiel nižšie.',
  'tripPlanning.discuss': 'Usporiadať naše nápady',
  'tripPlanning.generate': 'Vytvoriť podrobný plán',
  'tripPlanning.revise': 'Upraviť podrobný plán',
  'tripPlanning.generating': 'AI prechádza diskusiu a pripravuje plán. Môže to trvať niekoľko minút.',
  'tripPlanning.confirming': 'Aktualizácia itinerára…',
  'tripPlanning.discussionStatus': 'Smer na diskusiu',
  'tripPlanning.detailedStatus': 'Podrobný návrh · čaká na potvrdenie',
  'tripPlanning.confirmedStatus': 'Potvrdený itinerár',
  'tripPlanning.revision': 'Verzia {revision}',
  'tripPlanning.agreements': 'Zozbierané požiadavky',
  'tripPlanning.disagreements': 'Možnosti, o ktorých treba rozhodnúť',
  'tripPlanning.questions': 'Pár vecí na upresnenie',
  'tripPlanning.questionsHelp':
    'Odpovedzte v diskusii alebo napíšte odpoveď vyššie a požiadajte AI o aktualizáciu plánu.',
  'tripPlanning.outline': 'Cesta deň po dni',
  'tripPlanning.day': 'Deň {day}',
  'tripPlanning.changes': 'Čo sa v tejto verzii zmenilo',
  'tripPlanning.confirm': 'Potvrdiť a aktualizovať itinerár',
  'tripPlanning.confirmHelp':
    'Skontrolujte plán vyššie. Potvrdením aktualizujete denný itinerár a sprievodcu tejto cesty.',
  'tripPlanning.memberConfirmHelp':
    'Zmeny môžete navrhovať v diskusii. Itinerár potvrdzuje organizátor alebo spolupracovník.',
  'tripPlanning.confirmedHelp':
    'Táto verzia bola použitá. Pokračujte v diskusii a pri zmene plánov vytvorte ďalší návrh.',
  'tripPlanning.baselineChanged':
    'Denný itinerár, ubytovanie alebo rezervácie sa od prípravy návrhu zmenili. Pred potvrdením vytvorte nový návrh.',
  'tripPlanning.previousConfirmed': 'Počas diskusie o tomto návrhu zostáva potvrdeným itinerárom verzia {revision}.',
  'tripPlanning.history': 'Zobraziť históriu verzií',
  'tripPlanning.currentVersion': 'Späť na aktuálny plán',
  'tripPlanning.historyReadOnly': 'Čítate staršiu verziu. Na úpravy alebo potvrdenie sa vráťte k aktuálnemu plánu.',
  'tripPlanning.historyFailed': 'Históriu verzií sa nepodarilo načítať. Skúste ju otvoriť znova.',
  'tripPlanning.historyEmpty': 'Zatiaľ nie sú žiadne staršie verzie.',
  'tripPlanning.refresh': 'Obnoviť spoločný plán',
  'tripPlanning.aiUnavailable': 'AI nie je pre tento účet dostupná. Môžete ďalej diskutovať a prezerať plán.',
  'tripPlanning.privacyTitle': 'Pred použitím AI',
  'tripPlanning.privacyHelp':
    'Nastavená služba AI dostane spoločnú diskusiu a itinerár tejto cesty, aby pripravila návrh. Vaše súkromné rozhovory s AI sa neposielajú.',
  'tripPlanning.privacyAccept': 'Povoliť AI pre moje požiadavky',
  'tripPlanning.error.load': 'Spoločný plán sa nepodarilo načítať. Skontrolujte pripojenie a skúste to znova.',
  'tripPlanning.error.unavailable': 'Táto cesta nie je dostupná alebo k nej už nemáte prístup.',
  'tripPlanning.error.forbidden': 'Na túto akciu nemáte oprávnenie. Obnovením overte svoj aktuálny prístup.',
  'tripPlanning.error.stale_revision':
    'Niekto medzitým upravil plán. Najnovšia verzia bola načítaná; skontrolujte ju a skúste to znova.',
  'tripPlanning.error.baseline_changed':
    'Itinerár sa od prípravy návrhu zmenil. Vytvorte aktuálny návrh; váš terajší itinerár zostal zachovaný.',
  'tripPlanning.error.ai_unavailable':
    'AI nie je pre tento účet dostupná. Skontrolujte pripojenie AI v nastaveniach a skúste to znova.',
  'tripPlanning.error.privacy_required':
    'Najprv si prečítajte upozornenie k AI a povoľte jej použitie pre svoje požiadavky.',
  'tripPlanning.error.daily_limit': 'Dnešný limit AI ste vyčerpali. Pokračujte v diskusii a skúste to zajtra.',
  'tripPlanning.error.rate_limited': 'Príliš veľa požiadaviek na AI. Chvíľu počkajte a skúste to znova.',
  'tripPlanning.error.busy': 'AI už pripravuje návrh pre túto cestu. O chvíľu stránku obnovte.',
  'tripPlanning.error.ai_failed':
    'AI nedokázala pripraviť platný návrh. Váš aktuálny plán je zachovaný. Skúste kratšiu požiadavku.',
  'tripPlanning.memberCount.few': '{count} cestujúci',
  'tripPlanning.discussionRecord': 'Diskusia pri vytvorení tohto návrhu (na pripomenutie)',
};

export default tripPlanning;
