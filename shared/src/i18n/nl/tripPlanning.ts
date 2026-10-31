import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Samen plannen',
  'tripPlanning.intro': 'Bespreek jullie wensen en vraag AI er een uitvoerbaar reisplan van te maken.',
  'tripPlanning.chat': 'Reisoverleg',
  'tripPlanning.proposal': 'Gezamenlijk plan',
  'tripPlanning.chatHelp': 'Deel hier voorkeuren, links en wijzigingen. Iedereen op deze reis kan het overleg lezen.',
  'tripPlanning.chatNext': 'Klaar? Laat AI jullie ideeën ordenen',
  'tripPlanning.chatReadOnly':
    'Je kunt het overleg lezen. Berichten sturen is voor jouw account bij deze reis uitgeschakeld.',
  'tripPlanning.members': 'Leden en uitnodigingen',
  'tripPlanning.memberCount': '{count} reizigers',
  'tripPlanning.memberCount.one': '{count} reiziger',
  'tripPlanning.memberHelp': 'Nodig op elk moment reisgenoten uit. Je kunt ook alleen verder plannen.',
  'tripPlanning.collaborators': 'Wie het reisplan mag bevestigen',
  'tripPlanning.collaboratorsHelp':
    'De organisator en gekozen medewerkers mogen bevestigen. Andere leden kunnen overleggen en wijzigingen voorstellen.',
  'tripPlanning.saveCollaborators': 'Medewerkers opslaan',
  'tripPlanning.noOtherMembers': 'Nodig een reiziger uit om een medewerker te kiezen.',
  'tripPlanning.emptyTitle': 'Wat maakt dit voor jullie een fijne reis?',
  'tripPlanning.emptyHelp':
    'Vertel waarheen, hoeveel dagen, wie meegaat en wat belangrijk is. Begin met de grote lijnen of maak meteen een gedetailleerd plan.',
  'tripPlanning.emptyExample':
    'Bijvoorbeeld: vijf dagen met de auto vanuit Chengdu met mijn ouders, korte wandelingen, rustige hotels en tijd voor lokale gerechten.',
  'tripPlanning.instruction': 'Iets toevoegen of aanpassen? (optioneel)',
  'tripPlanning.instructionPlaceholder': 'Bijvoorbeeld: maak dag drie rustiger en behoud het geboekte hotel.',
  'tripPlanning.instructionHelp':
    'Je verzoek wordt met de groep gedeeld. AI begint pas wanneer je hieronder op een knop drukt.',
  'tripPlanning.discuss': 'Onze ideeën ordenen',
  'tripPlanning.generate': 'Gedetailleerd plan maken',
  'tripPlanning.revise': 'Gedetailleerd plan aanpassen',
  'tripPlanning.generating': 'AI bekijkt het overleg en maakt een voorstel. Dit kan enkele minuten duren.',
  'tripPlanning.confirming': 'Reisplan wordt bijgewerkt…',
  'tripPlanning.discussionStatus': 'Richting om te bespreken',
  'tripPlanning.detailedStatus': 'Gedetailleerd voorstel · wacht op bevestiging',
  'tripPlanning.confirmedStatus': 'Bevestigd reisplan',
  'tripPlanning.revision': 'Versie {revision}',
  'tripPlanning.agreements': 'Verzamelde wensen',
  'tripPlanning.disagreements': 'Nog te maken keuzes',
  'tripPlanning.questions': 'Een paar dingen verduidelijken',
  'tripPlanning.questionsHelp':
    'Antwoord in het overleg of voeg hierboven je antwoord toe. Vraag AI daarna het voorstel bij te werken.',
  'tripPlanning.outline': 'De reis, dag voor dag',
  'tripPlanning.day': 'Dag {day}',
  'tripPlanning.changes': 'Wijzigingen in deze versie',
  'tripPlanning.confirm': 'Bevestigen en reisplan bijwerken',
  'tripPlanning.confirmHelp':
    'Controleer het voorstel hierboven. Bevestigen werkt de dagplanning en reisgids van deze reis bij.',
  'tripPlanning.memberConfirmHelp':
    'Je kunt wijzigingen voorstellen in het overleg. De organisator of een medewerker bevestigt het reisplan.',
  'tripPlanning.confirmedHelp':
    'Deze versie is toegepast. Blijf overleggen en maak een nieuw voorstel als jullie plannen veranderen.',
  'tripPlanning.baselineChanged':
    'De dagplanning, verblijven of boekingen zijn na dit voorstel gewijzigd. Maak een bijgewerkt voorstel voordat je bevestigt.',
  'tripPlanning.previousConfirmed':
    'Versie {revision} blijft het bevestigde reisplan terwijl jullie dit voorstel bespreken.',
  'tripPlanning.history': 'Versiegeschiedenis bekijken',
  'tripPlanning.currentVersion': 'Terug naar het huidige plan',
  'tripPlanning.historyReadOnly':
    'Je leest een oudere versie. Ga terug naar het huidige plan om wijzigingen te maken of te bevestigen.',
  'tripPlanning.historyFailed': 'De versiegeschiedenis kon niet worden geladen. Probeer deze opnieuw te openen.',
  'tripPlanning.historyEmpty': 'Er zijn nog geen eerdere versies.',
  'tripPlanning.refresh': 'Gezamenlijk plan vernieuwen',
  'tripPlanning.aiUnavailable':
    'AI is niet beschikbaar voor dit account. Je kunt blijven overleggen en het plan bekijken.',
  'tripPlanning.privacyTitle': 'Voordat je AI gebruikt',
  'tripPlanning.privacyHelp':
    'De ingestelde AI-dienst ontvangt het gedeelde overleg en reisplan om een voorstel te maken. Je privégesprekken met AI worden niet meegenomen.',
  'tripPlanning.privacyAccept': 'AI toestaan voor mijn verzoeken',
  'tripPlanning.error.load':
    'Het gezamenlijke plan kon niet worden geladen. Controleer je verbinding en probeer het opnieuw.',
  'tripPlanning.error.unavailable': 'Deze reis is niet beschikbaar of je hebt geen toegang meer.',
  'tripPlanning.error.forbidden': 'Je mag deze actie niet uitvoeren. Vernieuw om je huidige rechten te controleren.',
  'tripPlanning.error.stale_revision':
    'Iemand heeft het plan bijgewerkt terwijl je bezig was. De nieuwste versie is geladen; controleer deze en probeer het opnieuw.',
  'tripPlanning.error.baseline_changed':
    'Het reisplan is na dit voorstel gewijzigd. Maak een bijgewerkt voorstel; je huidige reisplan is behouden.',
  'tripPlanning.error.ai_unavailable':
    'AI is niet beschikbaar voor dit account. Controleer de AI-verbinding in de instellingen.',
  'tripPlanning.error.privacy_required': 'Lees eerst de AI-melding en sta AI toe voor je verzoeken.',
  'tripPlanning.error.daily_limit': 'Je AI-tegoed voor vandaag is op. Blijf overleggen en probeer het morgen opnieuw.',
  'tripPlanning.error.rate_limited': 'Te veel AI-verzoeken. Wacht even en probeer het opnieuw.',
  'tripPlanning.error.busy': 'AI maakt al een voorstel voor deze reis. Vernieuw over een moment.',
  'tripPlanning.error.ai_failed':
    'AI kon geen geldig voorstel maken. Je huidige plan is bewaard. Probeer een korter verzoek.',
  'tripPlanning.discussionRecord': 'Discussie bij het maken van dit voorstel (ter referentie)',
};

export default tripPlanning;
