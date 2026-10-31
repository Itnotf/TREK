import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Plánujte společně',
  'tripPlanning.intro': 'Proberte své nápady společně. Nechte AI sestavit cestu, na kterou můžete vyrazit.',
  'tripPlanning.chat': 'Diskuse o cestě',
  'tripPlanning.proposal': 'Společný plán',
  'tripPlanning.chatHelp': 'Sdílejte zde přání, odkazy a změny. Diskusi mohou číst všichni účastníci této cesty.',
  'tripPlanning.chatNext': 'Připraveni? Požádejte AI o uspořádání plánu',
  'tripPlanning.chatReadOnly': 'Diskusi můžete číst. Odesílání zpráv je pro váš účet u této cesty vypnuté.',
  'tripPlanning.members': 'Účastníci a pozvánky',
  'tripPlanning.memberCount': '{count} cestujících',
  'tripPlanning.memberCount.one': '{count} cestující',
  'tripPlanning.memberHelp': 'Další lidi můžete pozvat kdykoli. Plánovat můžete dál i sami.',
  'tripPlanning.collaborators': 'Kdo může potvrdit itinerář',
  'tripPlanning.collaboratorsHelp':
    'Plán může potvrdit organizátor a vybraní spolupracovníci. Ostatní mohou diskutovat a žádat úpravy.',
  'tripPlanning.saveCollaborators': 'Uložit spolupracovníky',
  'tripPlanning.noOtherMembers': 'Pozvěte cestujícího, abyste ho mohli vybrat jako spolupracovníka.',
  'tripPlanning.emptyTitle': 'Co by z této cesty udělalo příjemný zážitek?',
  'tripPlanning.emptyHelp':
    'Napište, kam chcete jet, na kolik dní, kdo pojede a co je pro vás důležité. Začněte hrubým směrem nebo požádejte o podrobný plán.',
  'tripPlanning.emptyExample':
    'Například: pět dní autem z Čcheng-tu s rodiči, nenáročné procházky, klidné hotely a čas na místní jídlo.',
  'tripPlanning.instruction': 'Chcete něco přidat nebo změnit? (nepovinné)',
  'tripPlanning.instructionPlaceholder': 'Například: odlehči třetí den a ponech rezervovaný hotel.',
  'tripPlanning.instructionHelp':
    'Váš požadavek uvidí skupina. AI se spustí až po stisknutí některého z tlačítek níže.',
  'tripPlanning.discuss': 'Uspořádat naše nápady',
  'tripPlanning.generate': 'Vytvořit podrobný plán',
  'tripPlanning.revise': 'Upravit podrobný plán',
  'tripPlanning.generating': 'AI prochází diskusi a připravuje plán. Může to trvat několik minut.',
  'tripPlanning.confirming': 'Aktualizace itineráře…',
  'tripPlanning.discussionStatus': 'Směr k diskusi',
  'tripPlanning.detailedStatus': 'Podrobný návrh · čeká na potvrzení',
  'tripPlanning.confirmedStatus': 'Potvrzený itinerář',
  'tripPlanning.revision': 'Verze {revision}',
  'tripPlanning.agreements': 'Shromážděné požadavky',
  'tripPlanning.disagreements': 'Dosud nerozhodnuté možnosti',
  'tripPlanning.questions': 'Pár věcí k upřesnění',
  'tripPlanning.questionsHelp': 'Odpovězte v diskusi nebo napište odpověď výše a požádejte AI o aktualizaci plánu.',
  'tripPlanning.outline': 'Cesta den po dni',
  'tripPlanning.day': 'Den {day}',
  'tripPlanning.changes': 'Co se v této verzi změnilo',
  'tripPlanning.confirm': 'Potvrdit a aktualizovat itinerář',
  'tripPlanning.confirmHelp': 'Zkontrolujte plán výše. Potvrzením aktualizujete denní itinerář a průvodce této cesty.',
  'tripPlanning.memberConfirmHelp':
    'Změny můžete navrhovat v diskusi. Itinerář potvrzuje organizátor nebo spolupracovník.',
  'tripPlanning.confirmedHelp': 'Tato verze byla použita. Pokračujte v diskusi a při změně plánů vytvořte další návrh.',
  'tripPlanning.baselineChanged':
    'Denní itinerář, ubytování nebo rezervace se od přípravy návrhu změnily. Před potvrzením vytvořte nový návrh.',
  'tripPlanning.previousConfirmed': 'Při diskusi o tomto návrhu zůstává potvrzeným itinerářem verze {revision}.',
  'tripPlanning.history': 'Zobrazit historii verzí',
  'tripPlanning.currentVersion': 'Zpět na aktuální plán',
  'tripPlanning.historyReadOnly': 'Čtete starší verzi. Pro úpravy nebo potvrzení se vraťte k aktuálnímu plánu.',
  'tripPlanning.historyFailed': 'Historii verzí se nepodařilo načíst. Zkuste ji otevřít znovu.',
  'tripPlanning.historyEmpty': 'Zatím nejsou žádné starší verze.',
  'tripPlanning.refresh': 'Obnovit společný plán',
  'tripPlanning.aiUnavailable': 'AI není pro tento účet dostupná. Můžete dál diskutovat a prohlížet plán.',
  'tripPlanning.privacyTitle': 'Před použitím AI',
  'tripPlanning.privacyHelp':
    'Nastavená služba AI obdrží společnou diskusi a itinerář této cesty, aby připravila návrh. Vaše soukromé rozhovory s AI se neposílají.',
  'tripPlanning.privacyAccept': 'Povolit AI pro mé požadavky',
  'tripPlanning.error.load': 'Společný plán se nepodařilo načíst. Zkontrolujte připojení a zkuste to znovu.',
  'tripPlanning.error.unavailable': 'Tato cesta není dostupná nebo k ní již nemáte přístup.',
  'tripPlanning.error.forbidden': 'K této akci nemáte oprávnění. Obnovením ověřte svůj aktuální přístup.',
  'tripPlanning.error.stale_revision':
    'Někdo mezitím plán upravil. Nejnovější verze byla načtena; zkontrolujte ji a zkuste to znovu.',
  'tripPlanning.error.baseline_changed':
    'Itinerář se od přípravy návrhu změnil. Vytvořte aktuální návrh; váš nynější itinerář zůstal zachován.',
  'tripPlanning.error.ai_unavailable':
    'AI není pro tento účet dostupná. Zkontrolujte připojení AI v nastavení a zkuste to znovu.',
  'tripPlanning.error.privacy_required':
    'Nejprve si přečtěte upozornění k AI a povolte její použití pro své požadavky.',
  'tripPlanning.error.daily_limit': 'Dnešní limit AI jste vyčerpali. Pokračujte v diskusi a zkuste to zítra.',
  'tripPlanning.error.rate_limited': 'Příliš mnoho požadavků na AI. Chvíli počkejte a zkuste to znovu.',
  'tripPlanning.error.busy': 'AI už připravuje návrh pro tuto cestu. Za chvíli stránku obnovte.',
  'tripPlanning.error.ai_failed':
    'AI nedokázala připravit platný návrh. Váš aktuální plán je zachován. Zkuste kratší požadavek.',
  'tripPlanning.memberCount.few': '{count} cestující',
  'tripPlanning.discussionRecord': 'Diskuse při vytvoření tohoto návrhu (pro připomenutí)',
};

export default tripPlanning;
