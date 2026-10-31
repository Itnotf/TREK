import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Rencanakan bersama',
  'tripPlanning.intro': 'Diskusikan bersama. Minta AI mengubah ide kalian menjadi perjalanan yang bisa diwujudkan.',
  'tripPlanning.chat': 'Diskusi perjalanan',
  'tripPlanning.proposal': 'Rencana bersama',
  'tripPlanning.chatHelp':
    'Bagikan preferensi, tautan, dan perubahan di sini. Semua peserta perjalanan ini dapat membaca diskusi ini.',
  'tripPlanning.chatNext': 'Sudah siap? Minta AI menyusun rencana',
  'tripPlanning.chatReadOnly': 'Kamu dapat membaca diskusi. Akunmu tidak dapat mengirim pesan dalam perjalanan ini.',
  'tripPlanning.members': 'Anggota dan undangan',
  'tripPlanning.memberCount': '{count} peserta perjalanan',
  'tripPlanning.memberHelp': 'Undang orang lain kapan saja. Kamu juga bisa terus merencanakan sendiri.',
  'tripPlanning.collaborators': 'Siapa yang dapat mengonfirmasi rencana perjalanan',
  'tripPlanning.collaboratorsHelp':
    'Penyelenggara dan rekan perencana yang dipilih dapat mengonfirmasi rencana. Anggota lain dapat berdiskusi dan meminta revisi.',
  'tripPlanning.saveCollaborators': 'Simpan rekan perencana',
  'tripPlanning.noOtherMembers': 'Undang peserta perjalanan untuk memilih rekan perencana.',
  'tripPlanning.emptyTitle': 'Apa yang membuat perjalanan ini menyenangkan?',
  'tripPlanning.emptyHelp':
    'Ceritakan tujuan, jumlah hari, siapa yang ikut, dan hal yang paling penting. Mulai dengan gambaran umum atau minta rencana terperinci.',
  'tripPlanning.emptyExample':
    'Misalnya: berkendara lima hari dari Chengdu bersama orang tua, jalan santai, hotel yang tenang, dan waktu untuk mencicipi makanan lokal.',
  'tripPlanning.instruction': 'Ada yang ingin ditambah atau diubah? (opsional)',
  'tripPlanning.instructionPlaceholder':
    'Misalnya: buat hari ketiga lebih santai dan pertahankan hotel yang sudah dipesan.',
  'tripPlanning.instructionHelp':
    'Permintaanmu dibagikan kepada grup. AI hanya bekerja saat kamu menekan tombol di bawah.',
  'tripPlanning.discuss': 'Susun ide kami',
  'tripPlanning.generate': 'Buat rencana terperinci',
  'tripPlanning.revise': 'Revisi rencana terperinci',
  'tripPlanning.generating':
    'AI sedang meninjau diskusi dan menyiapkan rencana. Proses ini bisa memakan waktu beberapa menit.',
  'tripPlanning.confirming': 'Memperbarui rencana perjalanan…',
  'tripPlanning.discussionStatus': 'Gambaran untuk didiskusikan',
  'tripPlanning.detailedStatus': 'Usulan terperinci · menunggu konfirmasi',
  'tripPlanning.confirmedStatus': 'Rencana perjalanan terkonfirmasi',
  'tripPlanning.revision': 'Versi {revision}',
  'tripPlanning.agreements': 'Kebutuhan yang terkumpul',
  'tripPlanning.disagreements': 'Pilihan yang belum diputuskan',
  'tripPlanning.questions': 'Beberapa hal yang perlu diperjelas',
  'tripPlanning.questionsHelp': 'Balas di diskusi atau tambahkan jawabanmu di atas, lalu minta AI memperbarui rencana.',
  'tripPlanning.outline': 'Perjalanan dari hari ke hari',
  'tripPlanning.day': 'Hari ke-{day}',
  'tripPlanning.changes': 'Perubahan dalam versi ini',
  'tripPlanning.confirm': 'Konfirmasi dan perbarui rencana perjalanan',
  'tripPlanning.confirmHelp':
    'Tinjau rencana di atas. Konfirmasi akan memperbarui rencana harian dan panduan perjalanan ini.',
  'tripPlanning.memberConfirmHelp':
    'Kamu dapat mengusulkan perubahan dalam diskusi. Penyelenggara atau rekan perencana yang mengonfirmasi rencana perjalanan.',
  'tripPlanning.confirmedHelp':
    'Versi ini telah diterapkan. Lanjutkan diskusi dan buat usulan baru kapan pun rencana berubah.',
  'tripPlanning.baselineChanged':
    'Rencana harian, penginapan, atau pemesanan berubah setelah usulan ini disiapkan. Buat usulan terbaru sebelum mengonfirmasi.',
  'tripPlanning.previousConfirmed':
    'Versi {revision} tetap menjadi rencana perjalanan terkonfirmasi selama kalian mendiskusikan usulan ini.',
  'tripPlanning.history': 'Lihat riwayat versi',
  'tripPlanning.currentVersion': 'Kembali ke rencana saat ini',
  'tripPlanning.historyReadOnly':
    'Kamu sedang membaca versi sebelumnya. Kembali ke rencana saat ini untuk mengubah atau mengonfirmasi.',
  'tripPlanning.historyFailed': 'Riwayat versi tidak dapat dimuat. Coba buka kembali.',
  'tripPlanning.historyEmpty': 'Belum ada versi sebelumnya.',
  'tripPlanning.refresh': 'Muat ulang rencana bersama',
  'tripPlanning.aiUnavailable': 'AI tidak tersedia untuk akun ini. Kamu tetap dapat berdiskusi dan melihat rencana.',
  'tripPlanning.privacyTitle': 'Sebelum menggunakan AI',
  'tripPlanning.privacyHelp':
    'Layanan AI yang dikonfigurasi menerima diskusi bersama dan rencana perjalanan ini untuk menyiapkan usulan. Percakapan AI pribadimu tidak disertakan.',
  'tripPlanning.privacyAccept': 'Izinkan AI untuk permintaanku',
  'tripPlanning.error.load': 'Rencana bersama tidak dapat dimuat. Periksa koneksimu dan coba lagi.',
  'tripPlanning.error.unavailable': 'Perjalanan ini tidak tersedia atau kamu tidak lagi memiliki akses.',
  'tripPlanning.error.forbidden':
    'Kamu tidak memiliki izin untuk tindakan ini. Muat ulang untuk memeriksa aksesmu saat ini.',
  'tripPlanning.error.stale_revision':
    'Seseorang memperbarui rencana saat kamu sedang mengerjakannya. Versi terbaru telah dimuat; tinjau dan coba lagi.',
  'tripPlanning.error.baseline_changed':
    'Rencana perjalanan berubah setelah usulan ini disiapkan. Buat usulan terbaru; rencana perjalananmu saat ini tetap tersimpan.',
  'tripPlanning.error.ai_unavailable':
    'AI tidak tersedia untuk akun ini. Periksa koneksi AI di pengaturan, lalu coba lagi.',
  'tripPlanning.error.privacy_required': 'Baca pemberitahuan AI dan izinkan AI untuk permintaanmu terlebih dahulu.',
  'tripPlanning.error.daily_limit': 'Jatah penggunaan AI hari ini telah habis. Lanjutkan diskusi dan coba lagi besok.',
  'tripPlanning.error.rate_limited': 'Terlalu banyak permintaan AI. Tunggu sebentar, lalu coba lagi.',
  'tripPlanning.error.busy': 'AI sedang menyiapkan usulan untuk perjalanan ini. Muat ulang sebentar lagi.',
  'tripPlanning.error.ai_failed':
    'AI tidak dapat menyiapkan usulan yang valid. Rencanamu saat ini tetap aman. Coba lagi dengan permintaan yang lebih singkat.',
  'tripPlanning.discussionRecord': 'Diskusi saat usulan dibuat (untuk referensi)',
};
export default tripPlanning;
