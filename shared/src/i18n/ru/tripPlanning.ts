import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Планируем вместе',
  'tripPlanning.intro':
    'Обсудите поездку вместе. Попросите ИИ превратить ваши идеи в план путешествия, которое можно осуществить.',
  'tripPlanning.chat': 'Обсуждение поездки',
  'tripPlanning.proposal': 'Общий план',
  'tripPlanning.chatHelp':
    'Делитесь здесь пожеланиями, ссылками и изменениями. Все участники поездки могут читать это обсуждение.',
  'tripPlanning.chatNext': 'Готовы? Попросите ИИ составить план',
  'tripPlanning.chatReadOnly':
    'Вы можете читать обсуждение. Отправка сообщений для вашего аккаунта в этой поездке отключена.',
  'tripPlanning.members': 'Участники и приглашения',
  'tripPlanning.memberCount': '{count} путешественников',
  'tripPlanning.memberCount.one': '{count} путешественник',
  'tripPlanning.memberCount.few': '{count} путешественника',
  'tripPlanning.memberCount.many': '{count} путешественников',
  'tripPlanning.memberHelp': 'Приглашайте других в любое время. Вы можете продолжить планировать и самостоятельно.',
  'tripPlanning.collaborators': 'Кто может подтвердить маршрут',
  'tripPlanning.collaboratorsHelp':
    'Организатор и выбранные соавторы могут подтвердить план. Остальные участники могут обсуждать его и запрашивать изменения.',
  'tripPlanning.saveCollaborators': 'Сохранить соавторов',
  'tripPlanning.noOtherMembers': 'Пригласите участника поездки, чтобы выбрать соавтора.',
  'tripPlanning.emptyTitle': 'Что сделает эту поездку удачной?',
  'tripPlanning.emptyHelp':
    'Расскажите, куда хотите поехать, на сколько дней, кто едет с вами и что для вас важнее всего. Начните с общего направления или запросите подробный план.',
  'tripPlanning.emptyExample':
    'Например: пять дней на машине из Чэнду с родителями, лёгкие прогулки, тихие отели и время для местной кухни.',
  'tripPlanning.instruction': 'Что-нибудь добавить или изменить? (необязательно)',
  'tripPlanning.instructionPlaceholder': 'Например: сделать третий день спокойнее и оставить забронированный отель.',
  'tripPlanning.instructionHelp': 'Ваш запрос виден всей группе. ИИ запускается только при нажатии кнопки ниже.',
  'tripPlanning.discuss': 'Собрать наши идеи',
  'tripPlanning.generate': 'Создать подробный план',
  'tripPlanning.revise': 'Изменить подробный план',
  'tripPlanning.generating': 'ИИ изучает обсуждение и готовит план. Это может занять несколько минут.',
  'tripPlanning.confirming': 'Обновляем маршрут…',
  'tripPlanning.discussionStatus': 'Направление для обсуждения',
  'tripPlanning.detailedStatus': 'Подробное предложение · ожидает подтверждения',
  'tripPlanning.confirmedStatus': 'Подтверждённый маршрут',
  'tripPlanning.revision': 'Версия {revision}',
  'tripPlanning.agreements': 'Собранные пожелания',
  'tripPlanning.disagreements': 'Что ещё нужно выбрать',
  'tripPlanning.questions': 'Несколько вопросов для уточнения',
  'tripPlanning.questionsHelp': 'Ответьте в обсуждении или добавьте ответ выше, затем попросите ИИ обновить план.',
  'tripPlanning.outline': 'Поездка по дням',
  'tripPlanning.day': 'День {day}',
  'tripPlanning.changes': 'Что изменилось в этой версии',
  'tripPlanning.confirm': 'Подтвердить и обновить маршрут',
  'tripPlanning.confirmHelp':
    'Проверьте план выше. При подтверждении обновятся ежедневный маршрут и путеводитель этой поездки.',
  'tripPlanning.memberConfirmHelp':
    'Вы можете предложить изменения в обсуждении. Маршрут подтверждает организатор или соавтор.',
  'tripPlanning.confirmedHelp':
    'Эта версия применена. Продолжайте обсуждение и создавайте новое предложение, когда планы меняются.',
  'tripPlanning.baselineChanged':
    'После подготовки этого предложения изменились ежедневный маршрут, проживание или бронирования. Создайте обновлённое предложение перед подтверждением.',
  'tripPlanning.previousConfirmed':
    'Пока вы обсуждаете это предложение, версия {revision} остаётся подтверждённым маршрутом.',
  'tripPlanning.history': 'Посмотреть историю версий',
  'tripPlanning.currentVersion': 'Вернуться к текущему плану',
  'tripPlanning.historyReadOnly':
    'Вы читаете предыдущую версию. Вернитесь к текущему плану, чтобы внести изменения или подтвердить его.',
  'tripPlanning.historyFailed': 'Не удалось загрузить историю версий. Попробуйте открыть её ещё раз.',
  'tripPlanning.historyEmpty': 'Предыдущих версий пока нет.',
  'tripPlanning.refresh': 'Обновить общий план',
  'tripPlanning.aiUnavailable':
    'ИИ недоступен для этого аккаунта. Вы можете продолжить обсуждение и просматривать план.',
  'tripPlanning.privacyTitle': 'Перед использованием ИИ',
  'tripPlanning.privacyHelp':
    'Настроенный сервис ИИ получает общее обсуждение и маршрут этой поездки для подготовки предложения. Ваши личные беседы с ИИ не включаются.',
  'tripPlanning.privacyAccept': 'Разрешить ИИ обрабатывать мои запросы',
  'tripPlanning.error.load': 'Не удалось загрузить общий план. Проверьте подключение и попробуйте ещё раз.',
  'tripPlanning.error.unavailable': 'Эта поездка недоступна или у вас больше нет к ней доступа.',
  'tripPlanning.error.forbidden':
    'У вас нет разрешения на это действие. Обновите страницу, чтобы проверить текущие права доступа.',
  'tripPlanning.error.stale_revision':
    'Кто-то обновил план, пока вы работали. Загружена последняя версия; проверьте её и попробуйте ещё раз.',
  'tripPlanning.error.baseline_changed':
    'Маршрут изменился после подготовки этого предложения. Создайте обновлённое предложение; ваш текущий маршрут сохранён.',
  'tripPlanning.error.ai_unavailable':
    'ИИ недоступен для этого аккаунта. Проверьте подключение к ИИ в настройках и попробуйте ещё раз.',
  'tripPlanning.error.privacy_required':
    'Сначала прочитайте уведомление об ИИ и разрешите ИИ обрабатывать ваши запросы.',
  'tripPlanning.error.daily_limit': 'Ваш лимит ИИ на сегодня исчерпан. Продолжайте обсуждение и попробуйте завтра.',
  'tripPlanning.error.rate_limited': 'Слишком много запросов к ИИ. Подождите немного и попробуйте ещё раз.',
  'tripPlanning.error.busy': 'ИИ уже готовит предложение для этой поездки. Обновите страницу чуть позже.',
  'tripPlanning.error.ai_failed':
    'ИИ не смог подготовить корректное предложение. Ваш текущий план сохранён. Попробуйте ещё раз с более коротким запросом.',
  'tripPlanning.discussionRecord': 'Обсуждение на момент создания предложения (для справки)',
};
export default tripPlanning;
