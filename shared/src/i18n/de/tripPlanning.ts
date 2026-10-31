import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Gemeinsam planen',
  'tripPlanning.intro': 'Besprecht eure Wünsche und lasst die KI daraus einen passenden Reiseplan erstellen.',
  'tripPlanning.chat': 'Reise besprechen',
  'tripPlanning.proposal': 'Gemeinsamer Plan',
  'tripPlanning.chatHelp':
    'Teilt hier Wünsche, Links und Änderungsvorschläge. Alle Mitglieder dieser Reise können mitlesen.',
  'tripPlanning.chatNext': 'Bereit? Die KI kann eure Ideen ordnen',
  'tripPlanning.chatReadOnly':
    'Du kannst mitlesen. Für dein Konto ist das Senden von Nachrichten bei dieser Reise deaktiviert.',
  'tripPlanning.members': 'Mitglieder und Einladungen',
  'tripPlanning.memberCount': '{count} Reisende',
  'tripPlanning.memberCount.one': '{count} reisende Person',
  'tripPlanning.memberHelp': 'Lade jederzeit Mitreisende ein. Du kannst auch allein weiterplanen.',
  'tripPlanning.collaborators': 'Wer den Reiseplan bestätigen darf',
  'tripPlanning.collaboratorsHelp':
    'Die organisierende Person und ausgewählte Mitwirkende dürfen bestätigen. Andere können diskutieren und Änderungen vorschlagen.',
  'tripPlanning.saveCollaborators': 'Mitwirkende speichern',
  'tripPlanning.noOtherMembers': 'Lade jemanden ein, um Mitwirkende auszuwählen.',
  'tripPlanning.emptyTitle': 'Wie stellt ihr euch diese Reise vor?',
  'tripPlanning.emptyHelp':
    'Nennt Ziel, Dauer, Mitreisende und eure wichtigsten Wünsche. Klärt zunächst die Richtung oder erstellt gleich einen genauen Plan.',
  'tripPlanning.emptyExample':
    'Zum Beispiel: fünf Tage mit dem Auto ab Chengdu mit meinen Eltern, kurze Spaziergänge, ruhige Hotels und Zeit für regionale Küche.',
  'tripPlanning.instruction': 'Ergänzungen oder Änderungen? (optional)',
  'tripPlanning.instructionPlaceholder':
    'Zum Beispiel: Tag drei entspannter gestalten und das gebuchte Hotel beibehalten.',
  'tripPlanning.instructionHelp':
    'Deine Anfrage ist für die Gruppe sichtbar. Die KI startet erst nach einem Klick auf eine Schaltfläche unten.',
  'tripPlanning.discuss': 'Ideen zusammenfassen',
  'tripPlanning.generate': 'Genauen Reiseplan erstellen',
  'tripPlanning.revise': 'Genauen Reiseplan überarbeiten',
  'tripPlanning.generating':
    'Die KI wertet eure Diskussion aus und erstellt einen Vorschlag. Das kann einige Minuten dauern.',
  'tripPlanning.confirming': 'Reiseplan wird aktualisiert …',
  'tripPlanning.discussionStatus': 'Richtung zur Diskussion',
  'tripPlanning.detailedStatus': 'Genauer Vorschlag · wartet auf Bestätigung',
  'tripPlanning.confirmedStatus': 'Bestätigter Reiseplan',
  'tripPlanning.revision': 'Version {revision}', // same-as-en
  'tripPlanning.agreements': 'Gesammelte Wünsche',
  'tripPlanning.disagreements': 'Noch offene Entscheidungen',
  'tripPlanning.questions': 'Ein oder zwei Fragen vorab',
  'tripPlanning.questionsHelp':
    'Antworte in der Diskussion oder ergänze deine Antwort oben. Bitte danach die KI um eine Aktualisierung.',
  'tripPlanning.outline': 'Die Reise, Tag für Tag',
  'tripPlanning.day': 'Tag {day}',
  'tripPlanning.changes': 'Änderungen dieser Version',
  'tripPlanning.confirm': 'Bestätigen und Reiseplan aktualisieren',
  'tripPlanning.confirmHelp':
    'Prüfe den Vorschlag oben. Mit der Bestätigung werden Tagesplan und Reiseführer dieser Reise aktualisiert.',
  'tripPlanning.memberConfirmHelp':
    'Du kannst Änderungen in der Diskussion vorschlagen. Die organisierende Person oder Mitwirkende bestätigen den Reiseplan.',
  'tripPlanning.confirmedHelp':
    'Diese Version wurde übernommen. Bei Änderungen könnt ihr weiterdiskutieren und einen neuen Vorschlag erstellen.',
  'tripPlanning.baselineChanged':
    'Tagesplan, Unterkünfte oder Buchungen wurden nach diesem Vorschlag geändert. Erstelle vor der Bestätigung einen aktualisierten Vorschlag.',
  'tripPlanning.previousConfirmed':
    'Während ihr diesen Vorschlag besprecht, bleibt Version {revision} der bestätigte Reiseplan.',
  'tripPlanning.history': 'Versionsverlauf ansehen',
  'tripPlanning.currentVersion': 'Zum aktuellen Plan zurück',
  'tripPlanning.historyReadOnly':
    'Du liest eine frühere Version. Kehre zum aktuellen Plan zurück, um Änderungen vorzunehmen oder zu bestätigen.',
  'tripPlanning.historyFailed': 'Der Versionsverlauf konnte nicht geladen werden. Öffne ihn erneut.',
  'tripPlanning.historyEmpty': 'Noch keine früheren Versionen.',
  'tripPlanning.refresh': 'Gemeinsamen Plan aktualisieren',
  'tripPlanning.aiUnavailable':
    'Für dieses Konto ist die KI nicht verfügbar. Du kannst weiterdiskutieren und den Plan ansehen.',
  'tripPlanning.privacyTitle': 'Vor der KI-Nutzung',
  'tripPlanning.privacyHelp':
    'Der eingerichtete KI-Dienst erhält die gemeinsame Diskussion und den Reiseplan, um einen Vorschlag zu erstellen. Deine privaten KI-Chats werden nicht einbezogen.',
  'tripPlanning.privacyAccept': 'KI für meine Anfragen erlauben',
  'tripPlanning.error.load':
    'Der gemeinsame Plan konnte nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.',
  'tripPlanning.error.unavailable': 'Diese Reise ist nicht verfügbar oder du hast keinen Zugriff mehr.',
  'tripPlanning.error.forbidden':
    'Du darfst diese Aktion nicht ausführen. Aktualisiere die Seite, um deine Zugriffsrechte zu prüfen.',
  'tripPlanning.error.stale_revision':
    'Während deiner Bearbeitung wurde der Plan aktualisiert. Die neueste Version ist geladen; prüfe sie und versuche es erneut.',
  'tripPlanning.error.baseline_changed':
    'Der Reiseplan wurde nach diesem Vorschlag geändert. Erstelle einen neuen Vorschlag; dein aktueller Reiseplan bleibt erhalten.',
  'tripPlanning.error.ai_unavailable':
    'Für dieses Konto ist die KI nicht verfügbar. Prüfe die KI-Verbindung in den Einstellungen.',
  'tripPlanning.error.privacy_required': 'Lies zuerst den KI-Hinweis und erlaube die KI für deine Anfragen.',
  'tripPlanning.error.daily_limit':
    'Dein KI-Kontingent für heute ist aufgebraucht. Diskutiere weiter und versuche es morgen erneut.',
  'tripPlanning.error.rate_limited': 'Zu viele KI-Anfragen. Warte einen Moment und versuche es erneut.',
  'tripPlanning.error.busy': 'Die KI erstellt bereits einen Vorschlag für diese Reise. Aktualisiere die Seite später.',
  'tripPlanning.error.ai_failed':
    'Die KI konnte keinen gültigen Vorschlag erstellen. Dein aktueller Plan ist gesichert. Versuche eine kürzere Anfrage.',
  'tripPlanning.discussionRecord': 'Diskussion bei Erstellung dieses Vorschlags (zur Rückschau)',
};

export default tripPlanning;
