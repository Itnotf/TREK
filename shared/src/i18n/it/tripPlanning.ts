import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Pianificare insieme',
  'tripPlanning.intro': 'Condividete le vostre idee e chiedete all’IA di trasformarle in un viaggio pronto da vivere.',
  'tripPlanning.chat': 'Discussione del viaggio',
  'tripPlanning.proposal': 'Proposta condivisa',
  'tripPlanning.chatHelp':
    'Condividete qui preferenze, link e modifiche. Tutti i membri del viaggio possono leggere la discussione.',
  'tripPlanning.chatNext': 'Pronti? Chiedete all’IA di organizzare le idee',
  'tripPlanning.chatReadOnly':
    'Puoi leggere la discussione. Per il tuo account l’invio di messaggi in questo viaggio è disabilitato.',
  'tripPlanning.members': 'Membri e inviti',
  'tripPlanning.memberCount': '{count} viaggiatori',
  'tripPlanning.memberCount.one': '{count} viaggiatore',
  'tripPlanning.memberHelp': 'Invita altre persone quando vuoi. Puoi continuare a pianificare anche da solo.',
  'tripPlanning.collaborators': 'Chi può confermare l’itinerario',
  'tripPlanning.collaboratorsHelp':
    'L’organizzatore e i collaboratori scelti possono confermare. Gli altri possono discutere e chiedere modifiche.',
  'tripPlanning.saveCollaborators': 'Salva collaboratori',
  'tripPlanning.noOtherMembers': 'Invita un viaggiatore per scegliere un collaboratore.',
  'tripPlanning.emptyTitle': 'Come vorreste vivere questo viaggio?',
  'tripPlanning.emptyHelp':
    'Indicate destinazione, durata, partecipanti e priorità. Partite dalle idee generali oppure create subito un itinerario dettagliato.',
  'tripPlanning.emptyExample':
    'Ad esempio: cinque giorni in auto da Chengdu con i miei genitori, passeggiate brevi, hotel tranquilli e tempo per la cucina locale.',
  'tripPlanning.instruction': 'Qualcosa da aggiungere o modificare? (facoltativo)',
  'tripPlanning.instructionPlaceholder':
    'Ad esempio: rendere più tranquillo il terzo giorno e mantenere l’hotel già prenotato.',
  'tripPlanning.instructionHelp':
    'La tua richiesta viene condivisa con il gruppo. L’IA parte solo premendo un pulsante qui sotto.',
  'tripPlanning.discuss': 'Organizza le nostre idee',
  'tripPlanning.generate': 'Crea itinerario dettagliato',
  'tripPlanning.revise': 'Modifica itinerario dettagliato',
  'tripPlanning.generating':
    'L’IA sta esaminando la discussione e preparando una proposta. Potrebbero servire alcuni minuti.',
  'tripPlanning.confirming': 'Aggiornamento dell’itinerario…',
  'tripPlanning.discussionStatus': 'Idee da discutere',
  'tripPlanning.detailedStatus': 'Proposta dettagliata · da confermare',
  'tripPlanning.confirmedStatus': 'Itinerario confermato',
  'tripPlanning.revision': 'Versione {revision}',
  'tripPlanning.agreements': 'Preferenze raccolte',
  'tripPlanning.disagreements': 'Decisioni ancora da prendere',
  'tripPlanning.questions': 'Una o due cose da chiarire',
  'tripPlanning.questionsHelp':
    'Rispondi nella discussione o aggiungi la risposta qui sopra, poi chiedi all’IA di aggiornare la proposta.',
  'tripPlanning.outline': 'Il viaggio, giorno per giorno',
  'tripPlanning.day': 'Giorno {day}',
  'tripPlanning.changes': 'Modifiche di questa versione',
  'tripPlanning.confirm': 'Conferma e aggiorna itinerario',
  'tripPlanning.confirmHelp':
    'Controlla la proposta qui sopra. La conferma aggiorna il programma giornaliero e la guida del viaggio.',
  'tripPlanning.memberConfirmHelp':
    'Puoi proporre modifiche nella discussione. L’organizzatore o un collaboratore conferma l’itinerario.',
  'tripPlanning.confirmedHelp':
    'Questa versione è stata applicata. Continuate a discutere e create un’altra proposta quando i programmi cambiano.',
  'tripPlanning.baselineChanged':
    'Il programma giornaliero, gli alloggi o le prenotazioni sono cambiati dopo questa proposta. Generane una aggiornata prima di confermare.',
  'tripPlanning.previousConfirmed':
    'La versione {revision} resta l’itinerario confermato mentre discutete questa proposta.',
  'tripPlanning.history': 'Vedi cronologia delle versioni',
  'tripPlanning.currentVersion': 'Torna alla proposta attuale',
  'tripPlanning.historyReadOnly':
    'Stai leggendo una versione precedente. Torna alla proposta attuale per modificarla o confermarla.',
  'tripPlanning.historyFailed': 'Impossibile caricare la cronologia. Prova ad aprirla di nuovo.',
  'tripPlanning.historyEmpty': 'Non ci sono ancora versioni precedenti.',
  'tripPlanning.refresh': 'Aggiorna proposta condivisa',
  'tripPlanning.aiUnavailable':
    'L’IA non è disponibile per questo account. Puoi continuare a discutere e consultare la proposta.',
  'tripPlanning.privacyTitle': 'Prima di usare l’IA',
  'tripPlanning.privacyHelp':
    'Il servizio IA configurato riceve la discussione condivisa e l’itinerario per preparare una proposta. Le tue conversazioni private con l’IA non sono incluse.',
  'tripPlanning.privacyAccept': 'Consenti l’IA per le mie richieste',
  'tripPlanning.error.load': 'Impossibile caricare la proposta condivisa. Controlla la connessione e riprova.',
  'tripPlanning.error.unavailable': 'Questo viaggio non è disponibile o non hai più accesso.',
  'tripPlanning.error.forbidden':
    'Non hai il permesso di eseguire questa azione. Aggiorna per verificare i tuoi permessi.',
  'tripPlanning.error.stale_revision':
    'Qualcuno ha aggiornato la proposta mentre lavoravi. È stata caricata l’ultima versione: controllala e riprova.',
  'tripPlanning.error.baseline_changed':
    'L’itinerario è cambiato dopo questa proposta. Generane una aggiornata; l’itinerario attuale è stato conservato.',
  'tripPlanning.error.ai_unavailable':
    'L’IA non è disponibile per questo account. Controlla la connessione IA nelle impostazioni.',
  'tripPlanning.error.privacy_required': 'Leggi prima l’avviso sull’IA e consenti l’utilizzo per le tue richieste.',
  'tripPlanning.error.daily_limit': 'Hai esaurito la quota IA di oggi. Continua a discutere e riprova domani.',
  'tripPlanning.error.rate_limited': 'Troppe richieste all’IA. Attendi un momento e riprova.',
  'tripPlanning.error.busy': 'L’IA sta già preparando una proposta per questo viaggio. Aggiorna tra poco.',
  'tripPlanning.error.ai_failed':
    'L’IA non è riuscita a preparare una proposta valida. Il programma attuale è al sicuro. Riprova con una richiesta più breve.',
  'tripPlanning.discussionRecord': 'Discussione alla creazione della proposta (per riferimento)',
};

export default tripPlanning;
