import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Birlikte planlayın',
  'tripPlanning.intro':
    'İsteklerinizi konuşun, ardından yapay zekâdan bunları uygulanabilir bir gezi planına dönüştürmesini isteyin.',
  'tripPlanning.chat': 'Gezi sohbeti',
  'tripPlanning.proposal': 'Ortak plan',
  'tripPlanning.chatHelp':
    'Tercihleri, bağlantıları ve değişiklikleri burada paylaşın. Geziye katılan herkes bu sohbeti okuyabilir.',
  'tripPlanning.chatNext': 'Hazır mısınız? Fikirlerinizi yapay zekâ düzenlesin',
  'tripPlanning.chatReadOnly': 'Sohbeti okuyabilirsiniz. Hesabınızın bu gezide mesaj gönderme izni yok.',
  'tripPlanning.members': 'Üyeler ve davetler',
  'tripPlanning.memberCount': '{count} gezgin',
  'tripPlanning.memberCount.one': '{count} gezgin',
  'tripPlanning.memberHelp':
    'İstediğiniz zaman yol arkadaşlarınızı davet edin. Tek başınıza planlamaya da devam edebilirsiniz.',
  'tripPlanning.collaborators': 'Gezi planını kimler onaylayabilir?',
  'tripPlanning.collaboratorsHelp':
    'Düzenleyen kişi ve seçili ortaklar onaylayabilir. Diğer üyeler konuşabilir ve değişiklik isteyebilir.',
  'tripPlanning.saveCollaborators': 'Ortakları kaydet',
  'tripPlanning.noOtherMembers': 'Bir ortak seçmek için geziye birini davet edin.',
  'tripPlanning.emptyTitle': 'Bu geziden beklentileriniz neler?',
  'tripPlanning.emptyHelp':
    'Nereye gideceğinizi, kaç gün kalacağınızı, kimlerin geleceğini ve önceliklerinizi anlatın. Önce genel yönü belirleyin veya doğrudan ayrıntılı plan oluşturun.',
  'tripPlanning.emptyExample':
    'Örneğin: ailemle Chengdu’dan arabayla beş gün; kısa yürüyüşler, sessiz oteller ve yerel yemeklere zaman.',
  'tripPlanning.instruction': 'Eklemek veya değiştirmek istediğiniz bir şey var mı? (isteğe bağlı)',
  'tripPlanning.instructionPlaceholder': 'Örneğin: üçüncü günü daha sakin yap ve rezervasyonlu oteli koru.',
  'tripPlanning.instructionHelp':
    'İsteğiniz grupla paylaşılır. Yapay zekâ yalnızca aşağıdaki bir düğmeye bastığınızda çalışır.',
  'tripPlanning.discuss': 'Fikirlerimizi düzenle',
  'tripPlanning.generate': 'Ayrıntılı plan oluştur',
  'tripPlanning.revise': 'Ayrıntılı planı düzenle',
  'tripPlanning.generating': 'Yapay zekâ sohbeti inceleyip bir öneri hazırlıyor. Bu işlem birkaç dakika sürebilir.',
  'tripPlanning.confirming': 'Gezi planı güncelleniyor…',
  'tripPlanning.discussionStatus': 'Tartışılacak genel çerçeve',
  'tripPlanning.detailedStatus': 'Ayrıntılı öneri · onay bekliyor',
  'tripPlanning.confirmedStatus': 'Onaylanmış gezi planı',
  'tripPlanning.revision': 'Sürüm {revision}',
  'tripPlanning.agreements': 'Toplanan istekler',
  'tripPlanning.disagreements': 'Karar verilmesi gerekenler',
  'tripPlanning.questions': 'Netleştirilecek birkaç konu',
  'tripPlanning.questionsHelp':
    'Sohbette yanıtlayın veya yanıtınızı yukarıya ekleyip yapay zekâdan öneriyi güncellemesini isteyin.',
  'tripPlanning.outline': 'Gün gün gezi',
  'tripPlanning.day': '{day}. gün',
  'tripPlanning.changes': 'Bu sürümdeki değişiklikler',
  'tripPlanning.confirm': 'Onayla ve gezi planını güncelle',
  'tripPlanning.confirmHelp':
    'Yukarıdaki öneriyi inceleyin. Onaylamak, gezinin günlük programını ve rehberini günceller.',
  'tripPlanning.memberConfirmHelp':
    'Sohbette değişiklik önerebilirsiniz. Geziyi düzenleyen kişi veya bir ortak planı onaylar.',
  'tripPlanning.confirmedHelp':
    'Bu sürüm uygulandı. Planlar değişirse konuşmaya devam edip yeni bir öneri oluşturabilirsiniz.',
  'tripPlanning.baselineChanged':
    'Bu öneriden sonra günlük program, konaklama veya rezervasyonlar değişti. Onaylamadan önce güncel bir öneri oluşturun.',
  'tripPlanning.previousConfirmed': 'Bu öneriyi konuşurken {revision}. sürüm onaylanmış gezi planı olarak kalır.',
  'tripPlanning.history': 'Sürüm geçmişini görüntüle',
  'tripPlanning.currentVersion': 'Güncel plana dön',
  'tripPlanning.historyReadOnly':
    'Eski bir sürümü okuyorsunuz. Değişiklik yapmak veya onaylamak için güncel plana dönün.',
  'tripPlanning.historyFailed': 'Sürüm geçmişi yüklenemedi. Yeniden açmayı deneyin.',
  'tripPlanning.historyEmpty': 'Henüz eski sürüm yok.',
  'tripPlanning.refresh': 'Ortak planı yenile',
  'tripPlanning.aiUnavailable':
    'Bu hesap için yapay zekâ kullanılamıyor. Sohbete devam edebilir ve planı inceleyebilirsiniz.',
  'tripPlanning.privacyTitle': 'Yapay zekâyı kullanmadan önce',
  'tripPlanning.privacyHelp':
    'Yapılandırılmış yapay zekâ hizmeti, bir öneri hazırlamak için gezinin ortak sohbetini ve planını alır. Özel yapay zekâ sohbetleriniz dahil edilmez.',
  'tripPlanning.privacyAccept': 'İsteklerim için yapay zekâya izin ver',
  'tripPlanning.error.load': 'Ortak plan yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.',
  'tripPlanning.error.unavailable': 'Bu gezi kullanılamıyor veya artık erişim izniniz yok.',
  'tripPlanning.error.forbidden': 'Bu işlem için yetkiniz yok. Güncel izinlerinizi kontrol etmek için yenileyin.',
  'tripPlanning.error.stale_revision':
    'Siz çalışırken plan güncellendi. En son sürüm yüklendi; inceleyip yeniden deneyin.',
  'tripPlanning.error.baseline_changed':
    'Bu öneriden sonra gezi planı değişti. Güncel bir öneri oluşturun; mevcut gezi planınız korundu.',
  'tripPlanning.error.ai_unavailable':
    'Bu hesap için yapay zekâ kullanılamıyor. Ayarlardan yapay zekâ bağlantısını kontrol edin.',
  'tripPlanning.error.privacy_required': 'Önce yapay zekâ bilgilendirmesini okuyup istekleriniz için izin verin.',
  'tripPlanning.error.daily_limit': 'Bugünkü yapay zekâ kotanız doldu. Sohbete devam edin ve yarın yeniden deneyin.',
  'tripPlanning.error.rate_limited': 'Çok fazla yapay zekâ isteği var. Biraz bekleyip yeniden deneyin.',
  'tripPlanning.error.busy': 'Yapay zekâ bu gezi için zaten bir öneri hazırlıyor. Birazdan yenileyin.',
  'tripPlanning.error.ai_failed':
    'Yapay zekâ geçerli bir öneri hazırlayamadı. Mevcut planınız korundu. Daha kısa bir istekle yeniden deneyin.',
  'tripPlanning.discussionRecord': 'Bu öneri oluşturulurken yapılan görüşmeler (başvuru için)',
};

export default tripPlanning;
