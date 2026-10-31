import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Planera tillsammans',
  'tripPlanning.intro': 'Prata igenom era önskemål och be AI att göra dem till en resa ni kan ge er ut på.',
  'tripPlanning.chat': 'Resediskussion',
  'tripPlanning.proposal': 'Gemensamt förslag',
  'tripPlanning.chatHelp': 'Dela önskemål, länkar och ändringar här. Alla på resan kan läsa diskussionen.',
  'tripPlanning.chatNext': 'Redo? Be AI att ordna era idéer',
  'tripPlanning.chatReadOnly': 'Du kan läsa diskussionen. Ditt konto kan inte skicka meddelanden för den här resan.',
  'tripPlanning.members': 'Medlemmar och inbjudningar',
  'tripPlanning.memberCount': '{count} resenärer',
  'tripPlanning.memberCount.one': '{count} resenär',
  'tripPlanning.memberHelp': 'Bjud in medresenärer när du vill. Du kan också fortsätta planera på egen hand.',
  'tripPlanning.collaborators': 'Vem som får bekräfta resplanen',
  'tripPlanning.collaboratorsHelp':
    'Organisatören och utvalda medarbetare får bekräfta. Övriga kan diskutera och be om ändringar.',
  'tripPlanning.saveCollaborators': 'Spara medarbetare',
  'tripPlanning.noOtherMembers': 'Bjud in en resenär för att välja en medarbetare.',
  'tripPlanning.emptyTitle': 'Vad skulle göra det här till en bra resa?',
  'tripPlanning.emptyHelp':
    'Berätta om resmål, antal dagar, vilka som följer med och era prioriteringar. Börja med huvuddragen eller skapa en detaljerad plan direkt.',
  'tripPlanning.emptyExample':
    'Till exempel: fem dagar med bil från Chengdu med mina föräldrar, korta promenader, lugna hotell och tid för lokal mat.',
  'tripPlanning.instruction': 'Något att lägga till eller ändra? (valfritt)',
  'tripPlanning.instructionPlaceholder': 'Till exempel: gör dag tre lugnare och behåll det bokade hotellet.',
  'tripPlanning.instructionHelp': 'Din begäran delas med gruppen. AI startar först när du trycker på en knapp nedan.',
  'tripPlanning.discuss': 'Ordna våra idéer',
  'tripPlanning.generate': 'Skapa detaljerad resplan',
  'tripPlanning.revise': 'Ändra detaljerad resplan',
  'tripPlanning.generating': 'AI går igenom diskussionen och förbereder ett förslag. Det kan ta några minuter.',
  'tripPlanning.confirming': 'Uppdaterar resplanen…',
  'tripPlanning.discussionStatus': 'Inriktning att diskutera',
  'tripPlanning.detailedStatus': 'Detaljerat förslag · väntar på bekräftelse',
  'tripPlanning.confirmedStatus': 'Bekräftad resplan',
  'tripPlanning.revision': 'Version {revision}', // same-as-en
  'tripPlanning.agreements': 'Insamlade önskemål',
  'tripPlanning.disagreements': 'Val som återstår',
  'tripPlanning.questions': 'Ett par saker att klargöra',
  'tripPlanning.questionsHelp':
    'Svara i diskussionen eller lägg till svaret ovan och be sedan AI att uppdatera förslaget.',
  'tripPlanning.outline': 'Resan, dag för dag',
  'tripPlanning.day': 'Dag {day}',
  'tripPlanning.changes': 'Ändringar i den här versionen',
  'tripPlanning.confirm': 'Bekräfta och uppdatera resplan',
  'tripPlanning.confirmHelp': 'Granska förslaget ovan. En bekräftelse uppdaterar resans dagsschema och guide.',
  'tripPlanning.memberConfirmHelp':
    'Du kan föreslå ändringar i diskussionen. Organisatören eller en medarbetare bekräftar resplanen.',
  'tripPlanning.confirmedHelp':
    'Den här versionen har tillämpats. Fortsätt diskutera och skapa ett nytt förslag när planerna ändras.',
  'tripPlanning.baselineChanged':
    'Dagsschemat, boendet eller bokningarna har ändrats efter det här förslaget. Skapa ett uppdaterat förslag innan du bekräftar.',
  'tripPlanning.previousConfirmed':
    'Version {revision} är fortfarande den bekräftade resplanen medan ni diskuterar det här förslaget.',
  'tripPlanning.history': 'Visa versionshistorik',
  'tripPlanning.currentVersion': 'Tillbaka till aktuellt förslag',
  'tripPlanning.historyReadOnly':
    'Du läser en äldre version. Gå tillbaka till det aktuella förslaget för att ändra eller bekräfta.',
  'tripPlanning.historyFailed': 'Versionshistoriken kunde inte läsas in. Försök öppna den igen.',
  'tripPlanning.historyEmpty': 'Det finns inga tidigare versioner än.',
  'tripPlanning.refresh': 'Uppdatera gemensamt förslag',
  'tripPlanning.aiUnavailable':
    'AI är inte tillgänglig för det här kontot. Du kan fortsätta diskutera och läsa förslaget.',
  'tripPlanning.privacyTitle': 'Innan du använder AI',
  'tripPlanning.privacyHelp':
    'Den inställda AI-tjänsten tar emot resans gemensamma diskussion och resplan för att skapa ett förslag. Dina privata AI-konversationer ingår inte.',
  'tripPlanning.privacyAccept': 'Tillåt AI för mina förfrågningar',
  'tripPlanning.error.load': 'Det gemensamma förslaget kunde inte läsas in. Kontrollera anslutningen och försök igen.',
  'tripPlanning.error.unavailable': 'Resan är inte tillgänglig eller så har du inte längre åtkomst.',
  'tripPlanning.error.forbidden':
    'Du har inte behörighet för den här åtgärden. Uppdatera för att kontrollera dina nuvarande rättigheter.',
  'tripPlanning.error.stale_revision':
    'Någon uppdaterade förslaget medan du arbetade. Den senaste versionen har lästs in; granska den och försök igen.',
  'tripPlanning.error.baseline_changed':
    'Resplanen har ändrats efter förslaget. Skapa ett uppdaterat förslag; den nuvarande resplanen har sparats.',
  'tripPlanning.error.ai_unavailable':
    'AI är inte tillgänglig för det här kontot. Kontrollera AI-anslutningen i inställningarna.',
  'tripPlanning.error.privacy_required': 'Läs AI-informationen och tillåt AI för dina förfrågningar först.',
  'tripPlanning.error.daily_limit': 'Dagens AI-kvot är slut. Fortsätt diskutera och försök igen i morgon.',
  'tripPlanning.error.rate_limited': 'För många AI-förfrågningar. Vänta en stund och försök igen.',
  'tripPlanning.error.busy': 'AI håller redan på att skapa ett förslag för den här resan. Uppdatera om en stund.',
  'tripPlanning.error.ai_failed':
    'AI kunde inte skapa ett giltigt förslag. Din nuvarande resplan är sparad. Försök med en kortare begäran.',
  'tripPlanning.discussionRecord': 'Diskussion när förslaget skapades (som referens)',
};

export default tripPlanning;
