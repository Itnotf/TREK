import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Planifier ensemble',
  'tripPlanning.intro': 'Discutez de vos envies, puis demandez à l’IA d’en faire un voyage prêt à partir.',
  'tripPlanning.chat': 'Discussion du voyage',
  'tripPlanning.proposal': 'Plan commun',
  'tripPlanning.chatHelp':
    'Partagez ici vos préférences, liens et modifications. Tous les membres du voyage peuvent lire la discussion.',
  'tripPlanning.chatNext': 'Prêts ? Demandez à l’IA d’organiser vos idées',
  'tripPlanning.chatReadOnly':
    'Vous pouvez lire la discussion. Votre compte ne peut pas envoyer de messages pour ce voyage.',
  'tripPlanning.members': 'Membres et invitations',
  'tripPlanning.memberCount': '{count} voyageurs',
  'tripPlanning.memberCount.one': '{count} voyageur',
  'tripPlanning.memberHelp': 'Invitez des compagnons quand vous le souhaitez. Vous pouvez aussi continuer seul.',
  'tripPlanning.collaborators': 'Qui peut confirmer le programme',
  'tripPlanning.collaboratorsHelp':
    'L’organisateur et les collaborateurs désignés peuvent confirmer. Les autres peuvent discuter et demander des modifications.',
  'tripPlanning.saveCollaborators': 'Enregistrer les collaborateurs',
  'tripPlanning.noOtherMembers': 'Invitez un voyageur pour choisir un collaborateur.',
  'tripPlanning.emptyTitle': 'Qu’attendez-vous de ce voyage ?',
  'tripPlanning.emptyHelp':
    'Indiquez la destination, la durée, les participants et vos priorités. Commencez par les grandes lignes ou créez directement un programme détaillé.',
  'tripPlanning.emptyExample':
    'Par exemple : cinq jours en voiture depuis Chengdu avec mes parents, peu de marche, des hôtels calmes et du temps pour la cuisine locale.',
  'tripPlanning.instruction': 'Des précisions ou des modifications ? (facultatif)',
  'tripPlanning.instructionPlaceholder': 'Par exemple : alléger le troisième jour et conserver l’hôtel déjà réservé.',
  'tripPlanning.instructionHelp':
    'Votre demande est partagée avec le groupe. L’IA ne démarre qu’après un clic sur un bouton ci-dessous.',
  'tripPlanning.discuss': 'Organiser nos idées',
  'tripPlanning.generate': 'Créer un programme détaillé',
  'tripPlanning.revise': 'Modifier le programme détaillé',
  'tripPlanning.generating': 'L’IA analyse la discussion et prépare un programme. Cela peut prendre quelques minutes.',
  'tripPlanning.confirming': 'Mise à jour du programme…',
  'tripPlanning.discussionStatus': 'Grandes lignes à discuter',
  'tripPlanning.detailedStatus': 'Programme détaillé · à confirmer',
  'tripPlanning.confirmedStatus': 'Programme confirmé',
  'tripPlanning.revision': 'Version {revision}', // same-as-en
  'tripPlanning.agreements': 'Souhaits recueillis',
  'tripPlanning.disagreements': 'Choix encore à faire',
  'tripPlanning.questions': 'Une ou deux précisions',
  'tripPlanning.questionsHelp':
    'Répondez dans la discussion ou ajoutez votre réponse ci-dessus, puis demandez à l’IA de mettre le programme à jour.',
  'tripPlanning.outline': 'Le voyage, jour après jour',
  'tripPlanning.day': 'Jour {day}',
  'tripPlanning.changes': 'Modifications de cette version',
  'tripPlanning.confirm': 'Confirmer et mettre à jour le programme',
  'tripPlanning.confirmHelp':
    'Vérifiez le programme ci-dessus. La confirmation met à jour les journées et le guide de ce voyage.',
  'tripPlanning.memberConfirmHelp':
    'Proposez des modifications dans la discussion. L’organisateur ou un collaborateur confirme le programme.',
  'tripPlanning.confirmedHelp':
    'Cette version a été appliquée. Continuez la discussion et créez une nouvelle proposition si vos projets changent.',
  'tripPlanning.baselineChanged':
    'Les journées, hébergements ou réservations ont changé depuis cette proposition. Générez une proposition actualisée avant de confirmer.',
  'tripPlanning.previousConfirmed':
    'La version {revision} reste le programme confirmé pendant la discussion de cette proposition.',
  'tripPlanning.history': 'Voir l’historique des versions',
  'tripPlanning.currentVersion': 'Revenir au programme actuel',
  'tripPlanning.historyReadOnly':
    'Vous consultez une ancienne version. Revenez au programme actuel pour le modifier ou le confirmer.',
  'tripPlanning.historyFailed': 'Impossible de charger l’historique. Essayez de le rouvrir.',
  'tripPlanning.historyEmpty': 'Aucune version précédente pour le moment.',
  'tripPlanning.refresh': 'Actualiser le plan commun',
  'tripPlanning.aiUnavailable':
    'L’IA est indisponible pour ce compte. Vous pouvez continuer à discuter et consulter le programme.',
  'tripPlanning.privacyTitle': 'Avant d’utiliser l’IA',
  'tripPlanning.privacyHelp':
    'Le service d’IA configuré reçoit la discussion partagée et le programme du voyage pour préparer une proposition. Vos conversations privées avec l’IA ne sont pas incluses.',
  'tripPlanning.privacyAccept': 'Autoriser l’IA pour mes demandes',
  'tripPlanning.error.load': 'Impossible de charger le plan commun. Vérifiez votre connexion et réessayez.',
  'tripPlanning.error.unavailable': 'Ce voyage est indisponible ou vous n’y avez plus accès.',
  'tripPlanning.error.forbidden':
    'Vous n’avez pas l’autorisation d’effectuer cette action. Actualisez pour vérifier vos droits.',
  'tripPlanning.error.stale_revision':
    'Le programme a été modifié pendant votre travail. La dernière version a été chargée ; vérifiez-la et réessayez.',
  'tripPlanning.error.baseline_changed':
    'Le programme a changé depuis cette proposition. Générez-en une nouvelle ; le programme actuel a été conservé.',
  'tripPlanning.error.ai_unavailable':
    'L’IA est indisponible pour ce compte. Vérifiez la connexion à l’IA dans les paramètres.',
  'tripPlanning.error.privacy_required': 'Lisez d’abord l’avis sur l’IA et autorisez-la pour vos demandes.',
  'tripPlanning.error.daily_limit': 'Votre quota d’IA du jour est épuisé. Continuez à discuter et réessayez demain.',
  'tripPlanning.error.rate_limited': 'Trop de demandes à l’IA. Patientez un instant, puis réessayez.',
  'tripPlanning.error.busy': 'L’IA prépare déjà une proposition pour ce voyage. Actualisez dans un moment.',
  'tripPlanning.error.ai_failed':
    'L’IA n’a pas pu créer de proposition valide. Le programme actuel est conservé. Réessayez avec une demande plus courte.',
  'tripPlanning.discussionRecord': 'Discussion lors de la création de cette proposition (pour mémoire)',
};

export default tripPlanning;
