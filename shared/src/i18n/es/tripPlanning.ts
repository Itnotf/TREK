import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Planificar juntos',
  'tripPlanning.intro': 'Comentad vuestras ideas y pedid a la IA que las convierta en un viaje listo para disfrutar.',
  'tripPlanning.chat': 'Conversación del viaje',
  'tripPlanning.proposal': 'Propuesta compartida',
  'tripPlanning.chatHelp':
    'Compartid aquí preferencias, enlaces y cambios. Todos los miembros del viaje pueden leer esta conversación.',
  'tripPlanning.chatNext': '¿Todo listo? Pedid a la IA que organice las ideas',
  'tripPlanning.chatReadOnly':
    'Puedes leer la conversación. Tu cuenta no tiene permiso para enviar mensajes en este viaje.',
  'tripPlanning.members': 'Miembros e invitaciones',
  'tripPlanning.memberCount': '{count} viajeros',
  'tripPlanning.memberCount.one': '{count} viajero',
  'tripPlanning.memberHelp': 'Invita a más personas cuando quieras. También puedes seguir planificando por tu cuenta.',
  'tripPlanning.collaborators': 'Quién puede confirmar el itinerario',
  'tripPlanning.collaboratorsHelp':
    'La persona organizadora y los colaboradores elegidos pueden confirmar. Los demás pueden debatir y pedir cambios.',
  'tripPlanning.saveCollaborators': 'Guardar colaboradores',
  'tripPlanning.noOtherMembers': 'Invita a alguien al viaje para elegir un colaborador.',
  'tripPlanning.emptyTitle': '¿Cómo os gustaría que fuera este viaje?',
  'tripPlanning.emptyHelp':
    'Indicad el destino, los días, quiénes viajáis y vuestras prioridades. Podéis empezar por las ideas generales o crear un itinerario detallado.',
  'tripPlanning.emptyExample':
    'Por ejemplo: cinco días en coche desde Chengdu con mis padres, paseos cortos, hoteles tranquilos y tiempo para comer platos locales.',
  'tripPlanning.instruction': '¿Algo que añadir o cambiar? (opcional)',
  'tripPlanning.instructionPlaceholder':
    'Por ejemplo: hacer más tranquilo el tercer día y mantener el hotel reservado.',
  'tripPlanning.instructionHelp':
    'Tu petición se comparte con el grupo. La IA solo se inicia al pulsar uno de los botones de abajo.',
  'tripPlanning.discuss': 'Organizar nuestras ideas',
  'tripPlanning.generate': 'Crear itinerario detallado',
  'tripPlanning.revise': 'Revisar itinerario detallado',
  'tripPlanning.generating':
    'La IA está revisando la conversación y preparando una propuesta. Puede tardar unos minutos.',
  'tripPlanning.confirming': 'Actualizando el itinerario…',
  'tripPlanning.discussionStatus': 'Ideas para debatir',
  'tripPlanning.detailedStatus': 'Propuesta detallada · pendiente de confirmar',
  'tripPlanning.confirmedStatus': 'Itinerario confirmado',
  'tripPlanning.revision': 'Versión {revision}',
  'tripPlanning.agreements': 'Preferencias recogidas',
  'tripPlanning.disagreements': 'Decisiones pendientes',
  'tripPlanning.questions': 'Una o dos cosas por aclarar',
  'tripPlanning.questionsHelp':
    'Responde en la conversación o añade tu respuesta arriba y pide a la IA que actualice la propuesta.',
  'tripPlanning.outline': 'El viaje, día a día',
  'tripPlanning.day': 'Día {day}',
  'tripPlanning.changes': 'Cambios de esta versión',
  'tripPlanning.confirm': 'Confirmar y actualizar itinerario',
  'tripPlanning.confirmHelp':
    'Revisa la propuesta de arriba. Al confirmar, se actualizan el itinerario diario y la guía de este viaje.',
  'tripPlanning.memberConfirmHelp':
    'Puedes proponer cambios en la conversación. La persona organizadora o un colaborador confirma el itinerario.',
  'tripPlanning.confirmedHelp':
    'Esta versión ya se ha aplicado. Seguid conversando y cread otra propuesta cuando cambien los planes.',
  'tripPlanning.baselineChanged':
    'El itinerario, los alojamientos o las reservas han cambiado desde esta propuesta. Genera una propuesta actualizada antes de confirmar.',
  'tripPlanning.previousConfirmed':
    'La versión {revision} sigue siendo el itinerario confirmado mientras comentáis esta propuesta.',
  'tripPlanning.history': 'Ver historial de versiones',
  'tripPlanning.currentVersion': 'Volver a la propuesta actual',
  'tripPlanning.historyReadOnly':
    'Estás leyendo una versión anterior. Vuelve a la propuesta actual para cambiarla o confirmarla.',
  'tripPlanning.historyFailed': 'No se ha podido cargar el historial. Prueba a abrirlo otra vez.',
  'tripPlanning.historyEmpty': 'Todavía no hay versiones anteriores.',
  'tripPlanning.refresh': 'Actualizar propuesta compartida',
  'tripPlanning.aiUnavailable':
    'La IA no está disponible para esta cuenta. Puedes seguir conversando y consultar la propuesta.',
  'tripPlanning.privacyTitle': 'Antes de usar la IA',
  'tripPlanning.privacyHelp':
    'El servicio de IA configurado recibe la conversación compartida y el itinerario para preparar una propuesta. Tus conversaciones privadas con la IA no se incluyen.',
  'tripPlanning.privacyAccept': 'Permitir la IA para mis peticiones',
  'tripPlanning.error.load':
    'No se ha podido cargar la propuesta compartida. Comprueba tu conexión e inténtalo de nuevo.',
  'tripPlanning.error.unavailable': 'Este viaje no está disponible o ya no tienes acceso.',
  'tripPlanning.error.forbidden': 'No tienes permiso para realizar esta acción. Actualiza para comprobar tus permisos.',
  'tripPlanning.error.stale_revision':
    'Alguien ha actualizado la propuesta mientras trabajabas. Se ha cargado la última versión; revísala e inténtalo de nuevo.',
  'tripPlanning.error.baseline_changed':
    'El itinerario ha cambiado desde esta propuesta. Genera una nueva; se ha conservado el itinerario actual.',
  'tripPlanning.error.ai_unavailable':
    'La IA no está disponible para esta cuenta. Revisa la conexión de IA en los ajustes.',
  'tripPlanning.error.privacy_required': 'Lee primero el aviso sobre la IA y permite su uso para tus peticiones.',
  'tripPlanning.error.daily_limit': 'Has agotado tu cuota de IA de hoy. Sigue conversando e inténtalo mañana.',
  'tripPlanning.error.rate_limited': 'Hay demasiadas peticiones a la IA. Espera un momento e inténtalo de nuevo.',
  'tripPlanning.error.busy': 'La IA ya está preparando una propuesta para este viaje. Actualiza dentro de un momento.',
  'tripPlanning.error.ai_failed':
    'La IA no ha podido preparar una propuesta válida. Tu itinerario actual se conserva. Prueba con una petición más corta.',
  'tripPlanning.discussionRecord': 'Discusión al generar esta propuesta (como referencia)',
};

export default tripPlanning;
