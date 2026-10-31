import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Cùng lên kế hoạch',
  'tripPlanning.intro': 'Cùng nhau thảo luận. Nhờ AI biến ý tưởng của mọi người thành một chuyến đi có thể thực hiện.',
  'tripPlanning.chat': 'Thảo luận chuyến đi',
  'tripPlanning.proposal': 'Kế hoạch chung',
  'tripPlanning.chatHelp':
    'Chia sẻ sở thích, liên kết và những điều muốn thay đổi tại đây. Mọi thành viên của chuyến đi đều có thể đọc cuộc thảo luận này.',
  'tripPlanning.chatNext': 'Sẵn sàng chưa? Nhờ AI sắp xếp kế hoạch',
  'tripPlanning.chatReadOnly':
    'Bạn có thể đọc cuộc thảo luận. Tài khoản của bạn không được gửi tin nhắn trong chuyến đi này.',
  'tripPlanning.members': 'Thành viên và lời mời',
  'tripPlanning.memberCount': '{count} người đi cùng',
  'tripPlanning.memberHelp': 'Mời thêm người bất cứ lúc nào. Bạn vẫn có thể tiếp tục tự lên kế hoạch.',
  'tripPlanning.collaborators': 'Ai có thể xác nhận lịch trình',
  'tripPlanning.collaboratorsHelp':
    'Người tổ chức và các cộng tác viên được chọn có thể xác nhận kế hoạch. Các thành viên khác có thể thảo luận và yêu cầu chỉnh sửa.',
  'tripPlanning.saveCollaborators': 'Lưu cộng tác viên',
  'tripPlanning.noOtherMembers': 'Mời thêm người tham gia chuyến đi để chọn cộng tác viên.',
  'tripPlanning.emptyTitle': 'Điều gì sẽ khiến chuyến đi này đáng mong đợi?',
  'tripPlanning.emptyHelp':
    'Chia sẻ nơi bạn muốn đến, số ngày, người đi cùng và điều quan trọng nhất. Bắt đầu với hướng đi chung hoặc yêu cầu kế hoạch chi tiết.',
  'tripPlanning.emptyExample':
    'Ví dụ: lái xe năm ngày từ Thành Đô cùng bố mẹ, đi bộ nhẹ nhàng, khách sạn yên tĩnh và có thời gian thưởng thức món địa phương.',
  'tripPlanning.instruction': 'Bạn muốn thêm hoặc thay đổi gì? (không bắt buộc)',
  'tripPlanning.instructionPlaceholder': 'Ví dụ: sắp xếp ngày thứ ba thư thả hơn và giữ khách sạn đã đặt.',
  'tripPlanning.instructionHelp': 'Yêu cầu của bạn được chia sẻ với cả nhóm. AI chỉ chạy khi bạn nhấn nút bên dưới.',
  'tripPlanning.discuss': 'Sắp xếp ý tưởng của chúng ta',
  'tripPlanning.generate': 'Tạo kế hoạch chi tiết',
  'tripPlanning.revise': 'Chỉnh sửa kế hoạch chi tiết',
  'tripPlanning.generating': 'AI đang xem lại cuộc thảo luận và chuẩn bị kế hoạch. Quá trình này có thể mất vài phút.',
  'tripPlanning.confirming': 'Đang cập nhật lịch trình…',
  'tripPlanning.discussionStatus': 'Hướng đi để thảo luận',
  'tripPlanning.detailedStatus': 'Đề xuất chi tiết · chờ xác nhận',
  'tripPlanning.confirmedStatus': 'Lịch trình đã xác nhận',
  'tripPlanning.revision': 'Phiên bản {revision}',
  'tripPlanning.agreements': 'Các yêu cầu đã thu thập',
  'tripPlanning.disagreements': 'Những lựa chọn còn cần quyết định',
  'tripPlanning.questions': 'Một vài điều cần làm rõ',
  'tripPlanning.questionsHelp':
    'Trả lời trong cuộc thảo luận hoặc thêm câu trả lời ở trên, rồi nhờ AI cập nhật kế hoạch.',
  'tripPlanning.outline': 'Chuyến đi theo từng ngày',
  'tripPlanning.day': 'Ngày {day}',
  'tripPlanning.changes': 'Những thay đổi trong phiên bản này',
  'tripPlanning.confirm': 'Xác nhận và cập nhật lịch trình',
  'tripPlanning.confirmHelp':
    'Xem lại kế hoạch bên trên. Khi xác nhận, lịch trình từng ngày và cẩm nang của chuyến đi này sẽ được cập nhật.',
  'tripPlanning.memberConfirmHelp':
    'Bạn có thể đề xuất thay đổi trong cuộc thảo luận. Người tổ chức hoặc cộng tác viên sẽ xác nhận lịch trình.',
  'tripPlanning.confirmedHelp':
    'Phiên bản này đã được áp dụng. Tiếp tục thảo luận và tạo đề xuất mới bất cứ khi nào kế hoạch thay đổi.',
  'tripPlanning.baselineChanged':
    'Lịch trình từng ngày, chỗ ở hoặc đặt chỗ đã thay đổi sau khi đề xuất này được chuẩn bị. Hãy tạo đề xuất cập nhật trước khi xác nhận.',
  'tripPlanning.previousConfirmed':
    'Phiên bản {revision} vẫn là lịch trình đã xác nhận trong khi mọi người thảo luận về đề xuất này.',
  'tripPlanning.history': 'Xem lịch sử phiên bản',
  'tripPlanning.currentVersion': 'Quay lại kế hoạch hiện tại',
  'tripPlanning.historyReadOnly': 'Bạn đang đọc phiên bản cũ. Quay lại kế hoạch hiện tại để chỉnh sửa hoặc xác nhận.',
  'tripPlanning.historyFailed': 'Không thể tải lịch sử phiên bản. Hãy thử mở lại.',
  'tripPlanning.historyEmpty': 'Chưa có phiên bản cũ.',
  'tripPlanning.refresh': 'Làm mới kế hoạch chung',
  'tripPlanning.aiUnavailable': 'Tài khoản này không dùng được AI. Bạn vẫn có thể tiếp tục thảo luận và xem kế hoạch.',
  'tripPlanning.privacyTitle': 'Trước khi dùng AI',
  'tripPlanning.privacyHelp':
    'Dịch vụ AI đã cấu hình sẽ nhận cuộc thảo luận chung và lịch trình của chuyến đi này để chuẩn bị đề xuất. Các cuộc trò chuyện riêng của bạn với AI không được gửi kèm.',
  'tripPlanning.privacyAccept': 'Cho phép AI xử lý yêu cầu của tôi',
  'tripPlanning.error.load': 'Không thể tải kế hoạch chung. Kiểm tra kết nối rồi thử lại.',
  'tripPlanning.error.unavailable': 'Chuyến đi này không khả dụng hoặc bạn không còn quyền truy cập.',
  'tripPlanning.error.forbidden':
    'Bạn không có quyền thực hiện thao tác này. Làm mới để kiểm tra quyền truy cập hiện tại.',
  'tripPlanning.error.stale_revision':
    'Có người đã cập nhật kế hoạch trong lúc bạn đang thao tác. Phiên bản mới nhất đã được tải; hãy xem lại rồi thử lại.',
  'tripPlanning.error.baseline_changed':
    'Lịch trình đã thay đổi sau khi đề xuất này được chuẩn bị. Hãy tạo đề xuất cập nhật; lịch trình hiện tại của bạn vẫn được giữ nguyên.',
  'tripPlanning.error.ai_unavailable':
    'Tài khoản này không dùng được AI. Kiểm tra kết nối AI trong phần cài đặt rồi thử lại.',
  'tripPlanning.error.privacy_required': 'Trước tiên, hãy đọc thông báo về AI và cho phép AI xử lý yêu cầu của bạn.',
  'tripPlanning.error.daily_limit':
    'Bạn đã dùng hết hạn mức AI hôm nay. Hãy tiếp tục thảo luận và thử lại vào ngày mai.',
  'tripPlanning.error.rate_limited': 'Có quá nhiều yêu cầu gửi đến AI. Chờ một lát rồi thử lại.',
  'tripPlanning.error.busy': 'AI đang chuẩn bị đề xuất cho chuyến đi này. Hãy làm mới sau một lát.',
  'tripPlanning.error.ai_failed':
    'AI không thể chuẩn bị đề xuất hợp lệ. Kế hoạch hiện tại của bạn vẫn được giữ nguyên. Hãy thử lại với yêu cầu ngắn hơn.',
  'tripPlanning.discussionRecord': 'Thảo luận khi tạo đề xuất này (để tham khảo)',
};
export default tripPlanning;
