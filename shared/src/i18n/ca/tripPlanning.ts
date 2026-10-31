import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Planificar plegats',
  'tripPlanning.intro':
    'Parleu de les vostres idees i demaneu a la IA que les converteixi en un viatge a punt per gaudir.',
  'tripPlanning.chat': 'Conversa del viatge',
  'tripPlanning.proposal': 'Proposta compartida',
  'tripPlanning.chatHelp':
    'Compartiu aquí preferències, enllaços i canvis. Tots els membres del viatge poden llegir la conversa.',
  'tripPlanning.chatNext': 'A punt? Demaneu a la IA que organitzi les idees',
  'tripPlanning.chatReadOnly': 'Pots llegir la conversa. El teu compte no pot enviar missatges en aquest viatge.',
  'tripPlanning.members': 'Membres i invitacions',
  'tripPlanning.memberCount': '{count} viatgers',
  'tripPlanning.memberCount.one': '{count} viatger',
  'tripPlanning.memberHelp': 'Convida companys quan vulguis. També pots continuar planificant pel teu compte.',
  'tripPlanning.collaborators': 'Qui pot confirmar l’itinerari',
  'tripPlanning.collaboratorsHelp':
    'La persona organitzadora i els col·laboradors escollits poden confirmar. Els altres poden debatre i demanar canvis.',
  'tripPlanning.saveCollaborators': 'Desa els col·laboradors',
  'tripPlanning.noOtherMembers': 'Convida un viatger per escollir un col·laborador.',
  'tripPlanning.emptyTitle': 'Com us agradaria que fos aquest viatge?',
  'tripPlanning.emptyHelp':
    'Digueu la destinació, els dies, qui hi va i les vostres prioritats. Comenceu per les idees generals o creeu directament un itinerari detallat.',
  'tripPlanning.emptyExample':
    'Per exemple: cinc dies en cotxe des de Chengdu amb els meus pares, passejades curtes, hotels tranquils i temps per a la cuina local.',
  'tripPlanning.instruction': 'Vols afegir o canviar res? (opcional)',
  'tripPlanning.instructionPlaceholder': 'Per exemple: fer més tranquil el tercer dia i mantenir l’hotel reservat.',
  'tripPlanning.instructionHelp':
    'La teva petició es comparteix amb el grup. La IA només s’inicia en prémer un botó de sota.',
  'tripPlanning.discuss': 'Organitza les nostres idees',
  'tripPlanning.generate': 'Crea un itinerari detallat',
  'tripPlanning.revise': 'Revisa l’itinerari detallat',
  'tripPlanning.generating': 'La IA revisa la conversa i prepara una proposta. Pot trigar uns minuts.',
  'tripPlanning.confirming': 'S’està actualitzant l’itinerari…',
  'tripPlanning.discussionStatus': 'Idees per debatre',
  'tripPlanning.detailedStatus': 'Proposta detallada · pendent de confirmar',
  'tripPlanning.confirmedStatus': 'Itinerari confirmat',
  'tripPlanning.revision': 'Versió {revision}',
  'tripPlanning.agreements': 'Preferències recollides',
  'tripPlanning.disagreements': 'Decisions pendents',
  'tripPlanning.questions': 'Un parell de coses per aclarir',
  'tripPlanning.questionsHelp':
    'Respon a la conversa o afegeix la resposta a dalt i demana a la IA que actualitzi la proposta.',
  'tripPlanning.outline': 'El viatge, dia a dia',
  'tripPlanning.day': 'Dia {day}',
  'tripPlanning.changes': 'Canvis d’aquesta versió',
  'tripPlanning.confirm': 'Confirma i actualitza l’itinerari',
  'tripPlanning.confirmHelp':
    'Revisa la proposta de dalt. La confirmació actualitza l’itinerari diari i la guia d’aquest viatge.',
  'tripPlanning.memberConfirmHelp':
    'Pots proposar canvis a la conversa. La persona organitzadora o un col·laborador confirma l’itinerari.',
  'tripPlanning.confirmedHelp':
    'Aquesta versió ja s’ha aplicat. Continueu parlant i creeu una altra proposta quan canviïn els plans.',
  'tripPlanning.baselineChanged':
    'L’itinerari, els allotjaments o les reserves han canviat després d’aquesta proposta. Genera una proposta actualitzada abans de confirmar.',
  'tripPlanning.previousConfirmed':
    'La versió {revision} continua sent l’itinerari confirmat mentre parleu d’aquesta proposta.',
  'tripPlanning.history': 'Mostra l’historial de versions',
  'tripPlanning.currentVersion': 'Torna a la proposta actual',
  'tripPlanning.historyReadOnly':
    'Estàs llegint una versió anterior. Torna a la proposta actual per modificar-la o confirmar-la.',
  'tripPlanning.historyFailed': 'No s’ha pogut carregar l’historial. Prova de tornar-lo a obrir.',
  'tripPlanning.historyEmpty': 'Encara no hi ha versions anteriors.',
  'tripPlanning.refresh': 'Actualitza la proposta compartida',
  'tripPlanning.aiUnavailable':
    'La IA no està disponible per a aquest compte. Pots continuar parlant i consultar la proposta.',
  'tripPlanning.privacyTitle': 'Abans d’utilitzar la IA',
  'tripPlanning.privacyHelp':
    'El servei d’IA configurat rep la conversa compartida i l’itinerari per preparar una proposta. Les teves converses privades amb la IA no s’hi inclouen.',
  'tripPlanning.privacyAccept': 'Permet la IA per a les meves peticions',
  'tripPlanning.error.load': 'No s’ha pogut carregar la proposta compartida. Comprova la connexió i torna-ho a provar.',
  'tripPlanning.error.unavailable': 'Aquest viatge no està disponible o ja no hi tens accés.',
  'tripPlanning.error.forbidden':
    'No tens permís per fer aquesta acció. Actualitza per comprovar els permisos actuals.',
  'tripPlanning.error.stale_revision':
    'Algú ha actualitzat la proposta mentre hi treballaves. S’ha carregat l’última versió; revisa-la i torna-ho a provar.',
  'tripPlanning.error.baseline_changed':
    'L’itinerari ha canviat després d’aquesta proposta. Genera’n una de nova; s’ha conservat l’itinerari actual.',
  'tripPlanning.error.ai_unavailable':
    'La IA no està disponible per a aquest compte. Revisa la connexió d’IA a la configuració.',
  'tripPlanning.error.privacy_required':
    'Llegeix primer l’avís sobre la IA i permet-ne l’ús per a les teves peticions.',
  'tripPlanning.error.daily_limit': 'Has esgotat la quota d’IA d’avui. Continua parlant i torna-ho a provar demà.',
  'tripPlanning.error.rate_limited': 'Hi ha massa peticions a la IA. Espera un moment i torna-ho a provar.',
  'tripPlanning.error.busy': 'La IA ja prepara una proposta per a aquest viatge. Actualitza d’aquí a una estona.',
  'tripPlanning.error.ai_failed':
    'La IA no ha pogut crear una proposta vàlida. El pla actual es conserva. Prova una petició més curta.',
  'tripPlanning.discussionRecord': 'Discussió en generar aquesta proposta (com a referència)',
};

export default tripPlanning;
