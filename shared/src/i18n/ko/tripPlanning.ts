import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': '함께 계획하기',
  'tripPlanning.intro':
    '함께 이야기를 나누세요. 여러분의 아이디어를 실현할 수 있는 여행으로 정리해 달라고 AI에게 요청하세요.',
  'tripPlanning.chat': '여행 의논',
  'tripPlanning.proposal': '공유 계획',
  'tripPlanning.chatHelp':
    '희망 사항, 링크, 변경할 내용을 여기에 공유하세요. 이 여행의 모든 참여자가 내용을 읽을 수 있습니다.',
  'tripPlanning.chatNext': '준비되셨나요? AI에게 계획 정리 요청하기',
  'tripPlanning.chatReadOnly':
    '의논 내용을 읽을 수 있습니다. 이 여행에서는 회원님의 계정으로 메시지를 보낼 수 없습니다.',
  'tripPlanning.members': '멤버 및 초대',
  'tripPlanning.memberCount': '여행자 {count}명',
  'tripPlanning.memberHelp': '언제든지 다른 사람을 초대하세요. 혼자서 계속 계획할 수도 있습니다.',
  'tripPlanning.collaborators': '일정을 확정할 수 있는 사람',
  'tripPlanning.collaboratorsHelp':
    '주최자와 지정된 공동 편집자가 계획을 확정할 수 있습니다. 다른 멤버는 의논하고 수정을 요청할 수 있습니다.',
  'tripPlanning.saveCollaborators': '공동 편집자 저장',
  'tripPlanning.noOtherMembers': '공동 편집자를 지정하려면 여행자를 초대하세요.',
  'tripPlanning.emptyTitle': '어떤 여행이면 좋을까요?',
  'tripPlanning.emptyHelp':
    '가고 싶은 곳, 여행 일수, 동행자, 가장 중요한 것을 공유하세요. 대략적인 방향부터 정하거나 상세 계획을 요청할 수 있습니다.',
  'tripPlanning.emptyExample':
    '예: 부모님과 함께 청두에서 출발하는 5일 자동차 여행. 가벼운 산책, 조용한 호텔, 현지 음식을 즐길 시간을 원해요.',
  'tripPlanning.instruction': '추가하거나 바꿀 내용이 있나요? (선택 사항)',
  'tripPlanning.instructionPlaceholder': '예: 3일 차는 더 여유롭게 하고 예약한 호텔은 유지해 주세요.',
  'tripPlanning.instructionHelp': '요청은 그룹에 공유됩니다. 아래 버튼을 눌러야 AI가 실행됩니다.',
  'tripPlanning.discuss': '우리의 아이디어 정리',
  'tripPlanning.generate': '상세 계획 만들기',
  'tripPlanning.revise': '상세 계획 수정',
  'tripPlanning.generating': 'AI가 의논 내용을 검토하고 계획을 준비하고 있습니다. 몇 분 정도 걸릴 수 있습니다.',
  'tripPlanning.confirming': '일정을 업데이트하는 중…',
  'tripPlanning.discussionStatus': '의논할 방향',
  'tripPlanning.detailedStatus': '상세 제안 · 확정 대기 중',
  'tripPlanning.confirmedStatus': '확정된 일정',
  'tripPlanning.revision': '버전 {revision}',
  'tripPlanning.agreements': '수집한 요구 사항',
  'tripPlanning.disagreements': '아직 결정할 사항',
  'tripPlanning.questions': '확인이 필요한 몇 가지 사항',
  'tripPlanning.questionsHelp': '의논 중에 답하거나 위에 답변을 추가한 뒤 AI에게 계획 업데이트를 요청하세요.',
  'tripPlanning.outline': '날짜별 여행 계획',
  'tripPlanning.day': '{day}일 차',
  'tripPlanning.changes': '이번 버전의 변경 사항',
  'tripPlanning.confirm': '확정하고 일정 업데이트',
  'tripPlanning.confirmHelp': '위의 계획을 검토하세요. 확정하면 이 여행의 일별 일정과 가이드가 업데이트됩니다.',
  'tripPlanning.memberConfirmHelp': '의논 중에 변경을 제안할 수 있습니다. 일정 확정은 주최자나 공동 편집자가 합니다.',
  'tripPlanning.confirmedHelp':
    '이 버전이 적용되었습니다. 계속 의논하고 계획이 바뀔 때마다 새 제안을 만들 수 있습니다.',
  'tripPlanning.baselineChanged':
    '이 제안이 작성된 후 일별 일정, 숙박 또는 예약이 변경되었습니다. 확정하기 전에 새 제안을 생성하세요.',
  'tripPlanning.previousConfirmed': '이 제안을 의논하는 동안 버전 {revision}이 확정된 일정으로 유지됩니다.',
  'tripPlanning.history': '버전 기록 보기',
  'tripPlanning.currentVersion': '현재 계획으로 돌아가기',
  'tripPlanning.historyReadOnly': '이전 버전을 보고 있습니다. 변경하거나 확정하려면 현재 계획으로 돌아가세요.',
  'tripPlanning.historyFailed': '버전 기록을 불러오지 못했습니다. 다시 열어 보세요.',
  'tripPlanning.historyEmpty': '아직 이전 버전이 없습니다.',
  'tripPlanning.refresh': '공유 계획 새로고침',
  'tripPlanning.aiUnavailable': '이 계정에서는 AI를 사용할 수 없습니다. 계속 의논하고 계획을 볼 수는 있습니다.',
  'tripPlanning.privacyTitle': 'AI 사용 전 안내',
  'tripPlanning.privacyHelp':
    '제안을 준비하기 위해 설정된 AI 서비스로 이 여행의 공유 의논 내용과 일정이 전송됩니다. AI와 나눈 비공개 대화는 포함되지 않습니다.',
  'tripPlanning.privacyAccept': '내 요청에 AI 사용 허용',
  'tripPlanning.error.load': '공유 계획을 불러오지 못했습니다. 연결을 확인하고 다시 시도하세요.',
  'tripPlanning.error.unavailable': '이 여행을 이용할 수 없거나 더 이상 접근 권한이 없습니다.',
  'tripPlanning.error.forbidden': '이 작업을 수행할 권한이 없습니다. 새로고침하여 현재 접근 권한을 확인하세요.',
  'tripPlanning.error.stale_revision':
    '작업하는 동안 다른 사람이 계획을 업데이트했습니다. 최신 버전을 불러왔습니다. 검토하고 다시 시도하세요.',
  'tripPlanning.error.baseline_changed':
    '이 제안이 작성된 후 일정이 변경되었습니다. 새 제안을 생성하세요. 현재 일정은 그대로 보존되었습니다.',
  'tripPlanning.error.ai_unavailable':
    '이 계정에서는 AI를 사용할 수 없습니다. 설정에서 AI 연결을 확인한 뒤 다시 시도하세요.',
  'tripPlanning.error.privacy_required': '먼저 AI 안내를 읽고 내 요청에 AI 사용을 허용하세요.',
  'tripPlanning.error.daily_limit': '오늘의 AI 사용 한도를 모두 사용했습니다. 계속 의논하고 내일 다시 시도하세요.',
  'tripPlanning.error.rate_limited': 'AI 요청이 너무 많습니다. 잠시 기다린 뒤 다시 시도하세요.',
  'tripPlanning.error.busy': 'AI가 이미 이 여행의 제안을 준비하고 있습니다. 잠시 후 새로고침하세요.',
  'tripPlanning.error.ai_failed':
    'AI가 유효한 제안을 만들지 못했습니다. 현재 계획은 보존되었습니다. 요청을 더 짧게 작성하여 다시 시도하세요.',
  'tripPlanning.discussionRecord': '이 제안 생성 당시의 논의 기록 (참고용)',
};
export default tripPlanning;
