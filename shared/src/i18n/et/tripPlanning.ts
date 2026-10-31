import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Planeerige koos',
  'tripPlanning.intro':
    'Arutage oma ideid koos. Paluge tehisintellektil koostada neist reis, millele saate päriselt minna.',
  'tripPlanning.chat': 'Reisi arutelu',
  'tripPlanning.proposal': 'Ühine plaan',
  'tripPlanning.chatHelp': 'Jagage siin eelistusi, linke ja muudatusi. Kõik selle reisi liikmed saavad arutelu lugeda.',
  'tripPlanning.chatNext': 'Valmis? Paluge tehisintellektil plaan kokku panna',
  'tripPlanning.chatReadOnly': 'Saate arutelu lugeda. Sõnumite saatmine on teie kontol selle reisi jaoks keelatud.',
  'tripPlanning.members': 'Liikmed ja kutsed',
  'tripPlanning.memberCount': '{count} reisijat',
  'tripPlanning.memberCount.one': '{count} reisija',
  'tripPlanning.memberHelp': 'Kutsuge teisi sobival ajal. Saate planeerimist jätkata ka üksi.',
  'tripPlanning.collaborators': 'Kes saab reisikava kinnitada',
  'tripPlanning.collaboratorsHelp':
    'Plaani saavad kinnitada korraldaja ja valitud kaasplaneerijad. Teised liikmed saavad arutada ja muudatusi paluda.',
  'tripPlanning.saveCollaborators': 'Salvesta kaasplaneerijad',
  'tripPlanning.noOtherMembers': 'Kaasplaneerija valimiseks kutsuge reisija.',
  'tripPlanning.emptyTitle': 'Mis teeks sellest hea reisi?',
  'tripPlanning.emptyHelp':
    'Kirjutage, kuhu soovite minna, mitmeks päevaks, kes kaasa tuleb ja mis on kõige tähtsam. Alustage üldsuunast või paluge üksikasjalikku plaani.',
  'tripPlanning.emptyExample':
    'Näiteks: viis päeva autoga Chengdust koos vanematega, kerged jalutuskäigud, vaiksed hotellid ja aeg kohaliku toidu jaoks.',
  'tripPlanning.instruction': 'Soovite midagi lisada või muuta? (valikuline)',
  'tripPlanning.instructionPlaceholder': 'Näiteks: tee kolmas päev kergemaks ja jäta broneeritud hotell alles.',
  'tripPlanning.instructionHelp':
    'Teie soovi jagatakse rühmaga. Tehisintellekt käivitub ainult siis, kui vajutate allolevat nuppu.',
  'tripPlanning.discuss': 'Koonda meie ideed',
  'tripPlanning.generate': 'Koosta üksikasjalik plaan',
  'tripPlanning.revise': 'Muuda üksikasjalikku plaani',
  'tripPlanning.generating': 'Tehisintellekt vaatab arutelu läbi ja koostab plaani. See võib võtta mõne minuti.',
  'tripPlanning.confirming': 'Reisikava uuendamine…',
  'tripPlanning.discussionStatus': 'Arutelu üldsuund',
  'tripPlanning.detailedStatus': 'Üksikasjalik ettepanek · ootab kinnitamist',
  'tripPlanning.confirmedStatus': 'Kinnitatud reisikava',
  'tripPlanning.revision': 'Versioon {revision}',
  'tripPlanning.agreements': 'Kogutud soovid',
  'tripPlanning.disagreements': 'Veel otsustamata valikud',
  'tripPlanning.questions': 'Mõned täpsustamist vajavad küsimused',
  'tripPlanning.questionsHelp':
    'Vastake arutelus või lisage vastus ülalpool ning paluge tehisintellektil plaani uuendada.',
  'tripPlanning.outline': 'Reis päevade kaupa',
  'tripPlanning.day': 'Päev {day}',
  'tripPlanning.changes': 'Selle versiooni muudatused',
  'tripPlanning.confirm': 'Kinnita ja uuenda reisikava',
  'tripPlanning.confirmHelp': 'Vaadake ülalolev plaan üle. Kinnitamine uuendab selle reisi päevakava ja reisijuhti.',
  'tripPlanning.memberConfirmHelp':
    'Saate arutelus muudatusi soovitada. Reisikava kinnitab korraldaja või kaasplaneerija.',
  'tripPlanning.confirmedHelp': 'See versioon on rakendatud. Jätkake arutelu ja looge plaanide muutudes uus ettepanek.',
  'tripPlanning.baselineChanged':
    'Päevakava, majutus või broneeringud on pärast ettepaneku koostamist muutunud. Looge enne kinnitamist uus ettepanek.',
  'tripPlanning.previousConfirmed': 'Selle ettepaneku arutamise ajal jääb kinnitatud reisikavaks versioon {revision}.',
  'tripPlanning.history': 'Vaata versioonide ajalugu',
  'tripPlanning.currentVersion': 'Tagasi praeguse plaani juurde',
  'tripPlanning.historyReadOnly':
    'Loete varasemat versiooni. Muutmiseks või kinnitamiseks naaske praeguse plaani juurde.',
  'tripPlanning.historyFailed': 'Versioonide ajalugu ei saanud laadida. Proovige see uuesti avada.',
  'tripPlanning.historyEmpty': 'Varasemaid versioone veel pole.',
  'tripPlanning.refresh': 'Värskenda ühist plaani',
  'tripPlanning.aiUnavailable':
    'Tehisintellekt pole sellel kontol saadaval. Saate jätkata arutelu ja plaani vaatamist.',
  'tripPlanning.privacyTitle': 'Enne tehisintellekti kasutamist',
  'tripPlanning.privacyHelp':
    'Seadistatud tehisintellektiteenus saab ettepaneku koostamiseks selle reisi ühise arutelu ja reisikava. Teie privaatseid tehisintellektivestlusi ei kaasata.',
  'tripPlanning.privacyAccept': 'Luba minu päringute jaoks tehisintellekti',
  'tripPlanning.error.load': 'Ühist plaani ei saanud laadida. Kontrollige ühendust ja proovige uuesti.',
  'tripPlanning.error.unavailable': 'See reis pole saadaval või teil pole enam sellele ligipääsu.',
  'tripPlanning.error.forbidden':
    'Teil pole selle toimingu jaoks õigust. Praeguse ligipääsu kontrollimiseks värskendage lehte.',
  'tripPlanning.error.stale_revision':
    'Keegi uuendas vahepeal plaani. Uusim versioon on laaditud; vaadake see üle ja proovige uuesti.',
  'tripPlanning.error.baseline_changed':
    'Reisikava on pärast ettepaneku koostamist muutunud. Looge uus ettepanek; praegune reisikava on säilitatud.',
  'tripPlanning.error.ai_unavailable':
    'Tehisintellekt pole sellel kontol saadaval. Kontrollige seadetes ühendust ja proovige uuesti.',
  'tripPlanning.error.privacy_required':
    'Lugege esmalt tehisintellekti teadet ja lubage selle kasutamine oma päringute jaoks.',
  'tripPlanning.error.daily_limit':
    'Tänane tehisintellekti kasutusmaht on täis. Jätkake arutelu ja proovige homme uuesti.',
  'tripPlanning.error.rate_limited': 'Liiga palju tehisintellektipäringuid. Oodake veidi ja proovige uuesti.',
  'tripPlanning.error.busy': 'Tehisintellekt juba koostab selle reisi ettepanekut. Värskendage mõne hetke pärast.',
  'tripPlanning.error.ai_failed':
    'Tehisintellekt ei suutnud sobivat ettepanekut koostada. Teie praegune plaan on alles. Proovige lühemat päringut.',
  'tripPlanning.discussionRecord': 'Arutelu ettepaneku loomise ajal (tagasivaateks)',
};

export default tripPlanning;
