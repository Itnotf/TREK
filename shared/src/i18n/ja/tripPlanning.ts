import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'みんなで計画',
  'tripPlanning.intro': 'みんなで話し合いましょう。アイデアを実際の旅行プランにまとめるようAIに頼めます。',
  'tripPlanning.chat': '旅行の話し合い',
  'tripPlanning.proposal': '共有プラン',
  'tripPlanning.chatHelp': '希望やリンク、変更点をここで共有しましょう。この旅行の参加者全員が話し合いを読めます。',
  'tripPlanning.chatNext': '準備ができたら、AIにプランをまとめてもらう',
  'tripPlanning.chatReadOnly':
    '話し合いを読むことができます。この旅行では、お使いのアカウントからのメッセージ送信は無効になっています。',
  'tripPlanning.members': 'メンバーと招待',
  'tripPlanning.memberCount': '参加者 {count}人',
  'tripPlanning.memberHelp': 'いつでも他の人を招待できます。一人で計画を続けることもできます。',
  'tripPlanning.collaborators': '日程を確定できる人',
  'tripPlanning.collaboratorsHelp':
    '主催者と選ばれた共同編集者がプランを確定できます。他のメンバーは話し合いに参加し、修正を依頼できます。',
  'tripPlanning.saveCollaborators': '共同編集者を保存',
  'tripPlanning.noOtherMembers': '共同編集者を選ぶには、旅行の参加者を招待してください。',
  'tripPlanning.emptyTitle': 'どんな旅行にしたいですか？',
  'tripPlanning.emptyHelp':
    '行き先、日数、同行者、特に大切にしたいことを共有しましょう。大まかな方向性から始めることも、詳しいプランを頼むこともできます。',
  'tripPlanning.emptyExample':
    '例：両親と成都から車で5日間。散歩は無理のない範囲で、静かなホテルに泊まり、地元の料理を楽しむ時間もほしい。',
  'tripPlanning.instruction': '追加や変更はありますか？（任意）',
  'tripPlanning.instructionPlaceholder': '例：3日目はゆったりした日程にして、予約済みのホテルはそのままにして。',
  'tripPlanning.instructionHelp': 'リクエストはグループに共有されます。AIは下のボタンを押したときだけ実行されます。',
  'tripPlanning.discuss': 'みんなのアイデアを整理',
  'tripPlanning.generate': '詳しいプランを作成',
  'tripPlanning.revise': '詳しいプランを修正',
  'tripPlanning.generating': 'AIが話し合いを確認し、プランを作成しています。数分かかることがあります。',
  'tripPlanning.confirming': '日程を更新しています…',
  'tripPlanning.discussionStatus': '話し合うための方向性',
  'tripPlanning.detailedStatus': '詳しい提案・確定待ち',
  'tripPlanning.confirmedStatus': '確定した日程',
  'tripPlanning.revision': '第{revision}版',
  'tripPlanning.agreements': '集まった希望・条件',
  'tripPlanning.disagreements': 'これから決めること',
  'tripPlanning.questions': '確認したいこと',
  'tripPlanning.questionsHelp': '話し合いで返信するか、上の欄に回答を追加してから、AIにプランの更新を頼んでください。',
  'tripPlanning.outline': '1日ごとのプラン',
  'tripPlanning.day': '{day}日目',
  'tripPlanning.changes': 'この版での変更点',
  'tripPlanning.confirm': '確定して日程を更新',
  'tripPlanning.confirmHelp': '上のプランを確認してください。確定すると、この旅行の毎日の行程とガイドが更新されます。',
  'tripPlanning.memberConfirmHelp': '話し合いで変更を提案できます。日程の確定は主催者または共同編集者が行います。',
  'tripPlanning.confirmedHelp':
    'この版は適用済みです。引き続き話し合い、予定が変わったらいつでも新しい提案を作成できます。',
  'tripPlanning.baselineChanged':
    'この提案の作成後に毎日の行程、宿泊先、または予約が変更されました。確定する前に最新の提案を作成してください。',
  'tripPlanning.previousConfirmed':
    'この提案について話し合っている間も、第{revision}版が確定した日程として維持されます。',
  'tripPlanning.history': '版の履歴を見る',
  'tripPlanning.currentVersion': '現在のプランに戻る',
  'tripPlanning.historyReadOnly': '以前の版を表示しています。変更や確定を行うには、現在のプランに戻ってください。',
  'tripPlanning.historyFailed': '版の履歴を読み込めませんでした。もう一度開いてみてください。',
  'tripPlanning.historyEmpty': '以前の版はまだありません。',
  'tripPlanning.refresh': '共有プランを再読み込み',
  'tripPlanning.aiUnavailable': 'このアカウントではAIを利用できません。引き続き話し合いやプランの閲覧はできます。',
  'tripPlanning.privacyTitle': 'AIを使う前に',
  'tripPlanning.privacyHelp':
    '提案を作成するため、設定されたAIサービスにこの旅行の共有の話し合いと日程が送信されます。あなたとAIとの非公開の会話は含まれません。',
  'tripPlanning.privacyAccept': '自分のリクエストでのAI利用を許可',
  'tripPlanning.error.load': '共有プランを読み込めませんでした。接続を確認して、もう一度お試しください。',
  'tripPlanning.error.unavailable': 'この旅行は利用できないか、アクセス権がなくなっています。',
  'tripPlanning.error.forbidden':
    'この操作を行う権限がありません。再読み込みして、現在のアクセス権を確認してください。',
  'tripPlanning.error.stale_revision':
    '作業中に他の人がプランを更新しました。最新版を読み込みました。内容を確認して、もう一度お試しください。',
  'tripPlanning.error.baseline_changed':
    'この提案の作成後に日程が変更されました。最新の提案を作成してください。現在の日程は維持されています。',
  'tripPlanning.error.ai_unavailable':
    'このアカウントではAIを利用できません。設定でAIへの接続を確認してから、もう一度お試しください。',
  'tripPlanning.error.privacy_required': 'まずAIに関する案内を読み、自分のリクエストでのAI利用を許可してください。',
  'tripPlanning.error.daily_limit': '本日のAI利用上限に達しました。引き続き話し合い、明日もう一度お試しください。',
  'tripPlanning.error.rate_limited': 'AIへのリクエストが多すぎます。少し待ってから、もう一度お試しください。',
  'tripPlanning.error.busy': 'AIがこの旅行の提案を作成中です。少し待って再読み込みしてください。',
  'tripPlanning.error.ai_failed':
    'AIが有効な提案を作成できませんでした。現在のプランは維持されています。リクエストを短くして、もう一度お試しください。',
  'tripPlanning.discussionRecord': 'この案の作成時の話し合い（振り返り用）',
};
export default tripPlanning;
