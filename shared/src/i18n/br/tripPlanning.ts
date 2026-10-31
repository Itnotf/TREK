import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Planejar juntos',
  'tripPlanning.intro': 'Conversem sobre suas ideias. Peçam à IA para transformá-las em uma viagem que possam fazer.',
  'tripPlanning.chat': 'Conversa da viagem',
  'tripPlanning.proposal': 'Plano compartilhado',
  'tripPlanning.chatHelp':
    'Compartilhem preferências, links e mudanças aqui. Todos os participantes da viagem podem ler esta conversa.',
  'tripPlanning.chatNext': 'Tudo pronto? Peçam à IA para organizar o plano',
  'tripPlanning.chatReadOnly':
    'Você pode ler a conversa. O envio de mensagens está desativado para sua conta nesta viagem.',
  'tripPlanning.members': 'Participantes e convites',
  'tripPlanning.memberCount': '{count} viajantes',
  'tripPlanning.memberCount.one': '{count} viajante',
  'tripPlanning.memberHelp': 'Convide outras pessoas quando quiser. Você pode continuar planejando por conta própria.',
  'tripPlanning.collaborators': 'Quem pode confirmar o roteiro',
  'tripPlanning.collaboratorsHelp':
    'O organizador e os colaboradores escolhidos podem confirmar o plano. Os demais participantes podem conversar e pedir alterações.',
  'tripPlanning.saveCollaborators': 'Salvar colaboradores',
  'tripPlanning.noOtherMembers': 'Convide um viajante para escolher um colaborador.',
  'tripPlanning.emptyTitle': 'O que faria desta uma boa viagem?',
  'tripPlanning.emptyHelp':
    'Conte para onde querem ir, por quantos dias, quem vai e o que é mais importante. Comece pela ideia geral ou peça um plano detalhado.',
  'tripPlanning.emptyExample':
    'Por exemplo: cinco dias de carro saindo de Chengdu com meus pais, caminhadas leves, hotéis tranquilos e tempo para a culinária local.',
  'tripPlanning.instruction': 'Algo a acrescentar ou mudar? (opcional)',
  'tripPlanning.instructionPlaceholder': 'Por exemplo: deixe o terceiro dia mais leve e mantenha o hotel reservado.',
  'tripPlanning.instructionHelp':
    'Seu pedido é compartilhado com o grupo. A IA só começa quando você aperta um dos botões abaixo.',
  'tripPlanning.discuss': 'Organizar nossas ideias',
  'tripPlanning.generate': 'Criar plano detalhado',
  'tripPlanning.revise': 'Revisar plano detalhado',
  'tripPlanning.generating': 'A IA está analisando a conversa e preparando um plano. Isso pode levar alguns minutos.',
  'tripPlanning.confirming': 'Atualizando o roteiro…',
  'tripPlanning.discussionStatus': 'Ideia geral para discussão',
  'tripPlanning.detailedStatus': 'Proposta detalhada · aguardando confirmação',
  'tripPlanning.confirmedStatus': 'Roteiro confirmado',
  'tripPlanning.revision': 'Versão {revision}',
  'tripPlanning.agreements': 'Preferências reunidas',
  'tripPlanning.disagreements': 'Escolhas ainda pendentes',
  'tripPlanning.questions': 'Alguns pontos para esclarecer',
  'tripPlanning.questionsHelp':
    'Responda na conversa ou acrescente sua resposta acima. Depois, peça à IA para atualizar o plano.',
  'tripPlanning.outline': 'A viagem, dia a dia',
  'tripPlanning.day': 'Dia {day}',
  'tripPlanning.changes': 'O que mudou nesta versão',
  'tripPlanning.confirm': 'Confirmar e atualizar roteiro',
  'tripPlanning.confirmHelp': 'Revise o plano acima. A confirmação atualiza o roteiro diário e o guia desta viagem.',
  'tripPlanning.memberConfirmHelp':
    'Você pode sugerir mudanças na conversa. O organizador ou um colaborador confirma o roteiro.',
  'tripPlanning.confirmedHelp':
    'Esta versão já foi aplicada. Continuem conversando e criem outra proposta quando os planos mudarem.',
  'tripPlanning.baselineChanged':
    'O roteiro diário, as estadias ou as reservas mudaram após esta proposta. Gere uma proposta atualizada antes de confirmar.',
  'tripPlanning.previousConfirmed':
    'A versão {revision} continua sendo o roteiro confirmado enquanto vocês discutem esta proposta.',
  'tripPlanning.history': 'Ver histórico de versões',
  'tripPlanning.currentVersion': 'Voltar ao plano atual',
  'tripPlanning.historyReadOnly':
    'Você está lendo uma versão anterior. Volte ao plano atual para alterar ou confirmar.',
  'tripPlanning.historyFailed': 'Não foi possível carregar o histórico. Tente abri-lo novamente.',
  'tripPlanning.historyEmpty': 'Ainda não há versões anteriores.',
  'tripPlanning.refresh': 'Atualizar plano compartilhado',
  'tripPlanning.aiUnavailable':
    'A IA não está disponível para esta conta. Você pode continuar conversando e consultando o plano.',
  'tripPlanning.privacyTitle': 'Antes de usar a IA',
  'tripPlanning.privacyHelp':
    'O serviço de IA configurado recebe a conversa compartilhada e o roteiro desta viagem para preparar uma proposta. Suas conversas privadas com a IA não são incluídas.',
  'tripPlanning.privacyAccept': 'Permitir IA nos meus pedidos',
  'tripPlanning.error.load':
    'Não foi possível carregar o plano compartilhado. Verifique sua conexão e tente novamente.',
  'tripPlanning.error.unavailable': 'Esta viagem não está disponível ou você não tem mais acesso.',
  'tripPlanning.error.forbidden': 'Você não tem permissão para esta ação. Atualize para verificar seu acesso atual.',
  'tripPlanning.error.stale_revision':
    'Alguém atualizou o plano enquanto você trabalhava. A versão mais recente foi carregada; revise e tente novamente.',
  'tripPlanning.error.baseline_changed':
    'O roteiro mudou após esta proposta. Gere uma proposta atualizada; seu roteiro atual foi preservado.',
  'tripPlanning.error.ai_unavailable':
    'A IA não está disponível para esta conta. Verifique a conexão de IA nas configurações e tente novamente.',
  'tripPlanning.error.privacy_required': 'Leia o aviso sobre IA e permita seu uso nos seus pedidos primeiro.',
  'tripPlanning.error.daily_limit': 'Sua cota de IA de hoje acabou. Continue conversando e tente novamente amanhã.',
  'tripPlanning.error.rate_limited': 'Há pedidos demais para a IA. Aguarde um pouco e tente novamente.',
  'tripPlanning.error.busy': 'A IA já está preparando uma proposta para esta viagem. Atualize daqui a pouco.',
  'tripPlanning.error.ai_failed':
    'A IA não conseguiu preparar uma proposta válida. Seu plano atual está preservado. Tente um pedido mais curto.',
  'tripPlanning.memberCount.many': '{count} viajantes',
  'tripPlanning.discussionRecord': "Kaozeadenn pa voe savet ar c'hinnig (evit soñj)",
};

export default tripPlanning;
