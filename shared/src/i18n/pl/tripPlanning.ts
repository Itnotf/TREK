import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Planujcie razem',
  'tripPlanning.intro':
    'Porozmawiajcie o swoich pomysłach. Poproście AI, aby zamieniła je w podróż, w którą możecie wyruszyć.',
  'tripPlanning.chat': 'Rozmowa o podróży',
  'tripPlanning.proposal': 'Wspólny plan',
  'tripPlanning.chatHelp':
    'Tutaj dzielcie się preferencjami, linkami i zmianami. Wszyscy uczestnicy tej podróży mogą czytać rozmowę.',
  'tripPlanning.chatNext': 'Gotowi? Poproście AI o uporządkowanie planu',
  'tripPlanning.chatReadOnly':
    'Możesz czytać rozmowę. Wysyłanie wiadomości z Twojego konta jest wyłączone dla tej podróży.',
  'tripPlanning.members': 'Uczestnicy i zaproszenia',
  'tripPlanning.memberCount': '{count} podróżnych',
  'tripPlanning.memberCount.one': '{count} podróżny',
  'tripPlanning.memberHelp': 'Zaproś innych w dowolnej chwili. Możesz też dalej planować samodzielnie.',
  'tripPlanning.collaborators': 'Kto może zatwierdzić plan podróży',
  'tripPlanning.collaboratorsHelp':
    'Plan mogą zatwierdzać organizator i wybrani współpracownicy. Pozostali uczestnicy mogą rozmawiać i prosić o zmiany.',
  'tripPlanning.saveCollaborators': 'Zapisz współpracowników',
  'tripPlanning.noOtherMembers': 'Zaproś podróżnego, aby móc wybrać współpracownika.',
  'tripPlanning.emptyTitle': 'Co sprawiłoby, że ta podróż będzie udana?',
  'tripPlanning.emptyHelp':
    'Napiszcie, dokąd chcecie jechać, na ile dni, z kim i co jest najważniejsze. Zacznijcie od ogólnego kierunku lub poproście o szczegółowy plan.',
  'tripPlanning.emptyExample':
    'Na przykład: pięć dni samochodem z Chengdu z rodzicami, łatwe spacery, ciche hotele i czas na lokalne jedzenie.',
  'tripPlanning.instruction': 'Chcesz coś dodać lub zmienić? (opcjonalnie)',
  'tripPlanning.instructionPlaceholder': 'Na przykład: rozluźnij trzeci dzień i zachowaj zarezerwowany hotel.',
  'tripPlanning.instructionHelp':
    'Twoją prośbę zobaczy grupa. AI zaczyna działać dopiero po naciśnięciu jednego z przycisków poniżej.',
  'tripPlanning.discuss': 'Uporządkuj nasze pomysły',
  'tripPlanning.generate': 'Utwórz szczegółowy plan',
  'tripPlanning.revise': 'Popraw szczegółowy plan',
  'tripPlanning.generating': 'AI przegląda rozmowę i przygotowuje plan. Może to potrwać kilka minut.',
  'tripPlanning.confirming': 'Aktualizowanie planu podróży…',
  'tripPlanning.discussionStatus': 'Kierunek do omówienia',
  'tripPlanning.detailedStatus': 'Szczegółowa propozycja · czeka na zatwierdzenie',
  'tripPlanning.confirmedStatus': 'Zatwierdzony plan podróży',
  'tripPlanning.revision': 'Wersja {revision}',
  'tripPlanning.agreements': 'Zebrane wymagania',
  'tripPlanning.disagreements': 'Wybory, które pozostały do podjęcia',
  'tripPlanning.questions': 'Kilka kwestii do wyjaśnienia',
  'tripPlanning.questionsHelp':
    'Odpowiedz w rozmowie lub dodaj odpowiedź powyżej, a następnie poproś AI o aktualizację planu.',
  'tripPlanning.outline': 'Podróż dzień po dniu',
  'tripPlanning.day': 'Dzień {day}',
  'tripPlanning.changes': 'Co zmieniło się w tej wersji',
  'tripPlanning.confirm': 'Zatwierdź i zaktualizuj plan podróży',
  'tripPlanning.confirmHelp':
    'Sprawdź plan powyżej. Zatwierdzenie aktualizuje dzienny harmonogram i przewodnik tej podróży.',
  'tripPlanning.memberConfirmHelp':
    'Możesz proponować zmiany w rozmowie. Plan podróży zatwierdza organizator lub współpracownik.',
  'tripPlanning.confirmedHelp':
    'Ta wersja została zastosowana. Rozmawiajcie dalej i twórzcie nową propozycję, gdy zmienią się plany.',
  'tripPlanning.baselineChanged':
    'Dzienny harmonogram, noclegi lub rezerwacje zmieniły się po przygotowaniu propozycji. Przed zatwierdzeniem wygeneruj aktualną propozycję.',
  'tripPlanning.previousConfirmed':
    'Podczas omawiania tej propozycji zatwierdzonym planem podróży pozostaje wersja {revision}.',
  'tripPlanning.history': 'Zobacz historię wersji',
  'tripPlanning.currentVersion': 'Wróć do aktualnego planu',
  'tripPlanning.historyReadOnly':
    'Czytasz wcześniejszą wersję. Wróć do aktualnego planu, aby wprowadzić zmiany lub go zatwierdzić.',
  'tripPlanning.historyFailed': 'Nie udało się wczytać historii wersji. Spróbuj otworzyć ją ponownie.',
  'tripPlanning.historyEmpty': 'Nie ma jeszcze wcześniejszych wersji.',
  'tripPlanning.refresh': 'Odśwież wspólny plan',
  'tripPlanning.aiUnavailable': 'AI jest niedostępna dla tego konta. Nadal możesz rozmawiać i przeglądać plan.',
  'tripPlanning.privacyTitle': 'Przed użyciem AI',
  'tripPlanning.privacyHelp':
    'Skonfigurowana usługa AI otrzymuje wspólną rozmowę i plan tej podróży, aby przygotować propozycję. Twoje prywatne rozmowy z AI nie są dołączane.',
  'tripPlanning.privacyAccept': 'Zezwól na AI dla moich próśb',
  'tripPlanning.error.load': 'Nie udało się wczytać wspólnego planu. Sprawdź połączenie i spróbuj ponownie.',
  'tripPlanning.error.unavailable': 'Ta podróż jest niedostępna lub nie masz już do niej dostępu.',
  'tripPlanning.error.forbidden': 'Nie masz uprawnień do tej czynności. Odśwież, aby sprawdzić aktualny dostęp.',
  'tripPlanning.error.stale_revision':
    'Ktoś zaktualizował plan podczas Twojej pracy. Wczytano najnowszą wersję; sprawdź ją i spróbuj ponownie.',
  'tripPlanning.error.baseline_changed':
    'Plan podróży zmienił się po przygotowaniu propozycji. Wygeneruj nową propozycję; Twój obecny plan został zachowany.',
  'tripPlanning.error.ai_unavailable':
    'AI jest niedostępna dla tego konta. Sprawdź połączenie z AI w ustawieniach i spróbuj ponownie.',
  'tripPlanning.error.privacy_required': 'Najpierw przeczytaj informację o AI i zezwól na jej użycie dla swoich próśb.',
  'tripPlanning.error.daily_limit': 'Twój dzisiejszy limit AI został wyczerpany. Kontynuuj rozmowę i spróbuj jutro.',
  'tripPlanning.error.rate_limited': 'Zbyt wiele próśb do AI. Poczekaj chwilę i spróbuj ponownie.',
  'tripPlanning.error.busy': 'AI już przygotowuje propozycję dla tej podróży. Odśwież za chwilę.',
  'tripPlanning.error.ai_failed':
    'AI nie zdołała przygotować poprawnej propozycji. Twój obecny plan jest zachowany. Spróbuj z krótszą prośbą.',
  'tripPlanning.memberCount.few': '{count} podróżnych',
  'tripPlanning.memberCount.many': '{count} podróżnych',
  'tripPlanning.discussionRecord': 'Dyskusja w chwili utworzenia propozycji (do wglądu)',
};

export default tripPlanning;
