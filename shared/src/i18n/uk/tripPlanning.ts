import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Плануймо разом',
  'tripPlanning.intro':
    'Обговоріть подорож разом. Попросіть ШІ перетворити ваші ідеї на план подорожі, яку можна здійснити.',
  'tripPlanning.chat': 'Обговорення подорожі',
  'tripPlanning.proposal': 'Спільний план',
  'tripPlanning.chatHelp':
    'Діліться тут побажаннями, посиланнями й змінами. Усі учасники подорожі можуть читати це обговорення.',
  'tripPlanning.chatNext': 'Готові? Попросіть ШІ скласти план',
  'tripPlanning.chatReadOnly':
    'Ви можете читати обговорення. Надсилання повідомлень для вашого облікового запису в цій подорожі вимкнено.',
  'tripPlanning.members': 'Учасники та запрошення',
  'tripPlanning.memberCount': '{count} мандрівників',
  'tripPlanning.memberCount.one': '{count} мандрівник',
  'tripPlanning.memberCount.few': '{count} мандрівники',
  'tripPlanning.memberCount.many': '{count} мандрівників',
  'tripPlanning.memberHelp': 'Запрошуйте інших будь-коли. Ви також можете продовжити планувати самостійно.',
  'tripPlanning.collaborators': 'Хто може підтвердити маршрут',
  'tripPlanning.collaboratorsHelp':
    'Організатор і вибрані співавтори можуть підтвердити план. Решта учасників можуть обговорювати його й просити про зміни.',
  'tripPlanning.saveCollaborators': 'Зберегти співавторів',
  'tripPlanning.noOtherMembers': 'Запросіть учасника подорожі, щоб вибрати співавтора.',
  'tripPlanning.emptyTitle': 'Що зробить цю подорож вдалою?',
  'tripPlanning.emptyHelp':
    'Розкажіть, куди хочете поїхати, на скільки днів, хто їде з вами й що для вас найважливіше. Почніть із загального напрямку або попросіть докладний план.',
  'tripPlanning.emptyExample':
    'Наприклад: п’ять днів автомобілем із Ченду з батьками, легкі прогулянки, тихі готелі й час на місцеву кухню.',
  'tripPlanning.instruction': 'Щось додати або змінити? (необов’язково)',
  'tripPlanning.instructionPlaceholder': 'Наприклад: зробити третій день спокійнішим і залишити заброньований готель.',
  'tripPlanning.instructionHelp': 'Ваш запит бачить уся група. ШІ запускається лише після натискання кнопки нижче.',
  'tripPlanning.discuss': 'Упорядкувати наші ідеї',
  'tripPlanning.generate': 'Створити докладний план',
  'tripPlanning.revise': 'Змінити докладний план',
  'tripPlanning.generating': 'ШІ переглядає обговорення й готує план. Це може тривати кілька хвилин.',
  'tripPlanning.confirming': 'Оновлюємо маршрут…',
  'tripPlanning.discussionStatus': 'Напрямок для обговорення',
  'tripPlanning.detailedStatus': 'Докладна пропозиція · очікує підтвердження',
  'tripPlanning.confirmedStatus': 'Підтверджений маршрут',
  'tripPlanning.revision': 'Версія {revision}',
  'tripPlanning.agreements': 'Зібрані побажання',
  'tripPlanning.disagreements': 'Що ще потрібно вибрати',
  'tripPlanning.questions': 'Кілька питань для уточнення',
  'tripPlanning.questionsHelp': 'Дайте відповідь в обговоренні або додайте її вище, а потім попросіть ШІ оновити план.',
  'tripPlanning.outline': 'Подорож день за днем',
  'tripPlanning.day': 'День {day}',
  'tripPlanning.changes': 'Що змінилося в цій версії',
  'tripPlanning.confirm': 'Підтвердити й оновити маршрут',
  'tripPlanning.confirmHelp': 'Перегляньте план вище. Підтвердження оновить щоденний маршрут і путівник цієї подорожі.',
  'tripPlanning.memberConfirmHelp':
    'Ви можете запропонувати зміни в обговоренні. Маршрут підтверджує організатор або співавтор.',
  'tripPlanning.confirmedHelp':
    'Цю версію застосовано. Продовжуйте обговорення й створюйте нову пропозицію, коли плани змінюються.',
  'tripPlanning.baselineChanged':
    'Після підготовки цієї пропозиції змінилися щоденний маршрут, проживання або бронювання. Створіть оновлену пропозицію перед підтвердженням.',
  'tripPlanning.previousConfirmed':
    'Поки ви обговорюєте цю пропозицію, версія {revision} залишається підтвердженим маршрутом.',
  'tripPlanning.history': 'Переглянути історію версій',
  'tripPlanning.currentVersion': 'Повернутися до поточного плану',
  'tripPlanning.historyReadOnly':
    'Ви читаєте попередню версію. Поверніться до поточного плану, щоб змінити чи підтвердити його.',
  'tripPlanning.historyFailed': 'Не вдалося завантажити історію версій. Спробуйте відкрити її ще раз.',
  'tripPlanning.historyEmpty': 'Попередніх версій ще немає.',
  'tripPlanning.refresh': 'Оновити спільний план',
  'tripPlanning.aiUnavailable':
    'ШІ недоступний для цього облікового запису. Ви можете продовжити обговорення й переглядати план.',
  'tripPlanning.privacyTitle': 'Перед використанням ШІ',
  'tripPlanning.privacyHelp':
    'Налаштований сервіс ШІ отримує спільне обговорення й маршрут цієї подорожі для підготовки пропозиції. Ваші приватні розмови з ШІ не включаються.',
  'tripPlanning.privacyAccept': 'Дозволити ШІ обробляти мої запити',
  'tripPlanning.error.load': 'Не вдалося завантажити спільний план. Перевірте з’єднання та спробуйте ще раз.',
  'tripPlanning.error.unavailable': 'Ця подорож недоступна або ви більше не маєте до неї доступу.',
  'tripPlanning.error.forbidden':
    'У вас немає дозволу на цю дію. Оновіть сторінку, щоб перевірити поточні права доступу.',
  'tripPlanning.error.stale_revision':
    'Хтось оновив план, поки ви працювали. Завантажено останню версію; перегляньте її та спробуйте ще раз.',
  'tripPlanning.error.baseline_changed':
    'Маршрут змінився після підготовки цієї пропозиції. Створіть оновлену пропозицію; ваш поточний маршрут збережено.',
  'tripPlanning.error.ai_unavailable':
    'ШІ недоступний для цього облікового запису. Перевірте підключення до ШІ в налаштуваннях і спробуйте ще раз.',
  'tripPlanning.error.privacy_required': 'Спершу прочитайте повідомлення про ШІ й дозвольте ШІ обробляти ваші запити.',
  'tripPlanning.error.daily_limit': 'Ваш ліміт ШІ на сьогодні вичерпано. Продовжуйте обговорення й спробуйте завтра.',
  'tripPlanning.error.rate_limited': 'Забагато запитів до ШІ. Зачекайте трохи та спробуйте ще раз.',
  'tripPlanning.error.busy': 'ШІ вже готує пропозицію для цієї подорожі. Оновіть сторінку за мить.',
  'tripPlanning.error.ai_failed':
    'ШІ не зміг підготувати коректну пропозицію. Ваш поточний план збережено. Спробуйте ще раз із коротшим запитом.',
  'tripPlanning.discussionRecord': 'Обговорення на момент створення пропозиції (для довідки)',
};
export default tripPlanning;
