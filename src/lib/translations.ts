export type Language = 'pl' | 'en' | 'de';

export const translations = {
    pl: {
        nav: {
            auto: 'Auto',
            rower: 'rower',
            shazam: 'shazam',
        },
        cancel: 'Anuluj',
        demoMode: 'Tryb Demo',
        loading: 'Trwa Analiza...',
        loadingAI: 'Trwa Analiza AI...',
        understand: 'Rozumiem',
        dontShow: 'Nie pokazuj tego więcej',
        auto: {
            vehicleData: 'Dane pojazdu',
            vehicleDataSub: 'Wpisz ręcznie parametry, by pomóc diagnozie',
            makeModelPlaceholder: 'Marka i Model (np. Passat B8)',
            yearEnginePlaceholder: 'Rok, Silnik (np. 2017 2.0 TDI)',
            protips: 'Protipy dla lepszych efektów',
            visualTitle: 'Zrób zdjęcie lub nagraj wideo',
            visualSub: 'Rozpoznawanie na podstawie uszkodzeń wizualnych',
            audioListening: 'Nasłuchiwanie...',
            audioTap: 'Dotknij, aby diagnozować',
            audioOpening: 'Otwieranie...',
            audioSubReq: 'Wymagany dostęp do mikrofonu',
            audioSubDemo: 'Symulacja dźwięku silnika (brak mikrofonu)',
            audioSubSrc: 'Zbliż telefon do źródła dźwięku',
            noMic: 'Brak mikrofonu. Uruchomiono tryb demonstracyjny.',
            uploadAudio: 'Wgraj audio',
            uploadVideo: 'Wgraj wideo',
            uploadFiles: 'Wgraj pliki',
            uploadContext: 'Wgraj kontekst',
            status: {
                init: 'Inicjalizacja AI...',
                iso: 'Izolowanie szumów tła...',
                search: 'Przeszukiwanie bazy usterek...',
                dev: 'Opracowywanie diagnozy...'
            }
        },
        bike: {
            section: 'Sekcja Roweru',
            protips: 'Protipy: Jak ująć awarię na zdjęciu/wideo',
            title: 'Zrób zdjęcie kasety / detalu',
            subtitle: 'Szukamy zagiętych zębów, uszkodzeń ramy lub pęknięć. Zrób fotkę makro.',
            gallery: 'Zdjęcie z galerii',
            addContext: 'Dodaj Kontekst',
            targets: [
                'Napęd (Rozciągnięcie, Przeskoki)',
                'Hamulce (Piszczenie, Tracie)',
                'Suport (Trzaski podczas pedałowania)',
                'Przerzutka (Problem zrzucania)',
                'Amortyzator / Łożyska ramy'
            ],
            status: {
                init: 'Inicjalizacja AI...',
                analyze: 'Analiza struktury ze zdjęcia/wideo...',
                check: 'Sprawdzanie stanu zębatki i uszkodzeń...',
                dev: 'Opracowywanie diagnozy rowerowej...'
            }
        },
        shazam: {
            title: 'Sonic Shazam',
            desc: 'Nagraj dźwięk silnika lub dodaj zdjęcie, aby inteligentna baza Sonic rozpoznała, z jakim autem masz do czynienia.',
            listening: 'Słucham...',
            status: {
                init: 'Inicjalizacja AI...',
                isoAudio: 'Izolowanie ścieżki dźwiękowej...',
                isoVisual: 'Analiza zdjęcia i kształtów...',
                search: 'Przeszukiwanie globalnej bazy modeli...',
                identify: 'Identyfikacja...'
            }
        },
        instructions: {
            title: 'Jak poprawnie nagrać pod analizę',
            car: {
                light: 'Otwórz maskę (wyłącz radio i nawiew).',
                video: 'Nagrywaj wideo (Daje diagnozie dodatkowy kontekst z wibracji itp.).',
                secure: 'Zabezpiecz auto (hamulec ręczny, bieg jałowy/P). Uważaj na ruchome elementy silnika!',
                steps: 'Zrób to w 3 krokach: Odpal silnik → poczekaj 5 sekund → lekko dodaj gazu.'
            },
            bike: {
                light: 'Zadbaj o światło. Rób zdjęcie kasety/napędu w dobrze oświetlonym miejscu.',
                video: 'Jeśli nagrywasz wideo kręć korbą ręcznie unikając wiatru i nagraj prosto przerzutkę.',
                stable: 'Utrzymaj stabilność. Oprzyj rower lub postaw go na nóżce. Nie nagrywaj z ręki w trakcie jazdy!'
            }
        },
        settings: {
            title: 'Ustawienia',
            logout: 'Wyloguj się',
            tabs: {
                profile: 'Moje Konto',
                history: 'Historia analiz',
                preferences: 'Preferencje',
                notifications: 'Powiadomienia',
                security: 'Bezpieczeństwo'
            },
            preferences: {
                title: 'Preferencje',
                desc: 'Zarządzaj ustawieniami języka, wyglądu i regionu.',
                langTitle: 'Język aplikacji',
                langDesc: 'Wybierz język, w którym chcesz korzystać z interfejsu.',
                themeTitle: 'Motyw',
                themeDesc: 'Dostosuj wygląd aplikacji do swoich preferencji.',
                themes: { system: 'Systemowy', light: 'Jasny', dark: 'Ciemny', pink: 'Różowy' }
            },
            history: {
                title: 'Historia analiz',
                desc: 'Przeglądaj swoje poprzednie diagnozy i wygenerowane raporty.'
            },
            profile: {
                title: 'Moje Konto',
                desc: 'Zarządzaj swoimi danymi, portfelem i subskrypcją.',
                photoTitle: 'Zdjęcie profilowe',
                photoDesc: 'Zalecany rozmiar to 256x256px. Maksymalnie 2MB.',
                changePhoto: 'Zmień zdjęcie',
                name: 'Imię i nazwisko',
                email: 'Adres email',
                save: 'Zapisz zmiany'
            },
            comingSoon: {
                title: 'Wkrótce dostępne',
                desc: 'Ta sekcja ustawień jest w trakcie przygotowywania i będzie dostępna wkrótce.'
            }
        },
        chat: {
            title: 'Bezpieczne połączenie',
            newDiagnosis: 'Nowa diagnoza',
            today: 'Dzisiaj',
            yesterday: 'Wczoraj',
            last7days: 'Poprzednie 7 dni',
            obdPrompt: 'Wprowadź kod OBD-II (np. P0300)...',
            msgPrompt: 'Napisz wiadomość...',
            micNotSupported: 'Twoja przeglądarka nie obsługuje rozpoznawania mowy.',
            listening: 'Słucham...',
            scanObd: 'Skanuj kod OBD-II',
            moreInfo: 'Więcej informacji',
            lessInfo: 'Zwiń szczegóły'
        },
        context: {
            title: 'Kontekst usterki',
            subtitle: 'Pomóż AI dokładniej zdiagnozować problem',
            mileageBike: 'Przebieg napędu / roweru (Opcjonalnie)',
            mileageCar: 'Przebieg pojazdu (Opcjonalnie)',
            mileageBikePh: 'np. 2000 km na tym łańcuchu...',
            mileageCarPh: 'np. 150 000 km...',
            descTitle: 'Opis problemu',
            descBikePh: 'Np. podczas podjazdu pod górę przeskakuje łańcuch na twardych biegach...',
            descCarPh: 'Np. słychać metaliczne stukanie przy dodawaniu gazu...',
            quickTagsTitle: 'Szybkie tagi (objawy)',
            quickTagsBike: ['Przeskakuje', 'Piszczy/Ociera', 'Trzeszczy przy pedałowaniu', 'Źle zrzuca biegi', 'Miękka klamka', 'Bije na boki'],
            quickTagsCar: ['Stukanie', 'Piszczenie', 'Brak mocy', 'Szarpie', 'Dymi', 'Nierówna praca'],
            whenOccurs: 'Kiedy występuje?',
            whenBike: ['Pod obciążeniem (podjazd)', 'Na sucho', 'Cały czas', 'Przy hamowaniu'],
            whenCar: ['Cały czas', 'Na zimnym silniku', 'Po rozgrzaniu', 'Przy przyspieszaniu'],
            visuals: 'Załączniki wizualne',
            addPhoto: 'Dodaj zdjęcie',
            optional: 'Opcjonalnie',
            cancel: 'Anuluj',
            save: 'Zapisz kontekst'
        },
        report: {
            title: 'Raport Diagnostyczny',
            close: 'Zamknij Raport',
            diagnosis: 'Diagnoza',
            causes: 'Potencjalne Przyczyny',
            solutions: 'Rekomendowane Rozwiązania',
            mechanic: 'Wskazówki dla Mechanika',
            urgent: 'Wykryto problem',
            normal: 'W normie',
            confidence: 'Pewność AI',
            newScan: 'Nowy skan',
            audioAnalysis: 'Analiza próbki audio',
            inputAnalysis: 'Analiza wejściowa',
            aiReasoning: 'Tok rozumowania AI',
            aiAlgorithm: 'Algorytm identyfikacyjny AI',
            recommendedActions: 'Rekomendowane działania',
            bikeWorkshop: 'Warsztat rowerowy: Krok po kroku',
            analysisParams: 'Parametry analizy',
            repairData: 'Dane Naprawcze',
            estimatedTime: 'Szacowany czas naprawy',
            estimatedTimeWorkshop: 'Szacowany czas na stanowisku',
            failureRisk: 'Ryzyko awarii',
            complexity: 'Złożoność',
            critical: 'Krytyczne',
            advanced: 'Zaawansowana',
            obdCodes: 'Powiązane kody OBD-II:',
            toolsNeeded: 'Potrzebne Narzędzia',
            partsCost: 'Kategoria kosztów części:'
        }
    },
    en: {
        nav: {
            auto: 'Auto',
            rower: 'bike',
            shazam: 'shazam',
        },
        cancel: 'Cancel',
        demoMode: 'Demo Mode',
        loading: 'Analyzing...',
        loadingAI: 'AI Analysis in progress...',
        understand: 'I understand',
        dontShow: 'Do not show again',
        auto: {
            vehicleData: 'Vehicle Data',
            vehicleDataSub: 'Enter parameters manually to help diagnosis',
            makeModelPlaceholder: 'Make & Model (e.g. Passat B8)',
            yearEnginePlaceholder: 'Year, Engine (e.g. 2017 2.0 TDI)',
            protips: 'Pro tips for better results',
            visualTitle: 'Take a photo or record video',
            visualSub: 'Recognition based on visual damage',
            audioListening: 'Listening...',
            audioTap: 'Tap to diagnose',
            audioOpening: 'Opening...',
            audioSubReq: 'Microphone access required',
            audioSubDemo: 'Engine sound simulation (no microphone)',
            audioSubSrc: 'Bring phone closer to the sound source',
            noMic: 'No microphone. Demo mode started.',
            uploadAudio: 'Upload audio',
            uploadVideo: 'Upload video',
            uploadFiles: 'Upload files',
            uploadContext: 'Add context',
            status: {
                init: 'Initializing AI...',
                iso: 'Isolating background noise...',
                search: 'Searching fault database...',
                dev: 'Developing diagnosis...'
            }
        },
        bike: {
            section: 'Bike Section',
            protips: 'Pro tips: How to capture the fault',
            title: 'Take a photo of the cassette / detail',
            subtitle: 'Looking for bent teeth, frame damage or cracks. Take a macro shot.',
            gallery: 'Photo from gallery',
            addContext: 'Add Context',
            targets: [
                'Drivetrain (Stretching, Skipping)',
                'Brakes (Squeaking, Rubbing)',
                'Bottom Bracket (Creaking when pedaling)',
                'Derailleur (Shifting problem)',
                'Shock absorber / Frame bearings'
            ],
            status: {
                init: 'Initializing AI...',
                analyze: 'Analyzing structure from photo/video...',
                check: 'Checking chainring condition and damage...',
                dev: 'Developing bike diagnosis...'
            }
        },
        shazam: {
            title: 'Sonic Shazam',
            desc: 'Record engine sound or add a photo so Sonic intelligent database can recognize the car.',
            listening: 'Listening...',
            status: {
                init: 'Initializing AI...',
                isoAudio: 'Isolating audio track...',
                isoVisual: 'Analyzing photo and shapes...',
                search: 'Searching global model database...',
                identify: 'Identifying...'
            }
        },
        instructions: {
            title: 'How to record correctly for analysis',
            car: {
                light: 'Open the hood (turn off radio and AC).',
                video: 'Record a video (Gives diagnosis additional context from vibrations etc.).',
                secure: 'Secure the car (handbrake, neutral/P). Watch out for moving engine parts!',
                steps: 'Do it in 3 steps: Start engine → wait 5 seconds → slightly press gas.'
            },
            bike: {
                light: 'Take care of light. Take a photo of the cassette/drivetrain in a well-lit place.',
                video: 'If recording a video, turn the crank manually avoiding wind and record the derailleur straight.',
                stable: 'Keep stable. Lean the bike or put it on a kickstand. Do not record handheld while riding!'
            }
        },
        settings: {
            title: 'Settings',
            logout: 'Log out',
            tabs: {
                profile: 'Profile',
                history: 'Analysis History',
                preferences: 'Preferences',
                notifications: 'Notifications',
                security: 'Security'
            },
            preferences: {
                title: 'Preferences',
                desc: 'Manage language, appearance and region settings.',
                langTitle: 'App Language',
                langDesc: 'Choose the language for the interface.',
                themeTitle: 'Theme',
                themeDesc: 'Customize the appearance of the app.',
                themes: { system: 'System', light: 'Light', dark: 'Dark', pink: 'Pink' }
            },
            history: {
                title: 'Analysis History',
                desc: 'Browse your previous diagnoses and generated reports.'
            },
            profile: {
                title: 'Profile',
                desc: 'Manage your personal data.',
                photoTitle: 'Profile Photo',
                photoDesc: 'Recommended size is 256x256px. Max 2MB.',
                changePhoto: 'Change photo',
                name: 'Full Name',
                email: 'Email address',
                save: 'Save changes'
            },
            comingSoon: {
                title: 'Coming Soon',
                desc: 'This settings section is under development and will be available soon.'
            }
        },
        chat: {
            title: 'Secure Connection',
            newDiagnosis: 'New diagnosis',
            today: 'Today',
            yesterday: 'Yesterday',
            last7days: 'Last 7 days',
            obdPrompt: 'Enter OBD-II code (e.g. P0300)...',
            msgPrompt: 'Type a message...',
            micNotSupported: 'Your browser does not support speech recognition.',
            listening: 'Listening...',
            scanObd: 'Scan OBD-II code',
            moreInfo: 'More info',
            lessInfo: 'Hide details'
        },
        context: {
            title: 'Fault context',
            subtitle: 'Help AI diagnose the problem more accurately',
            mileageBike: 'Drivetrain / bike mileage (Optional)',
            mileageCar: 'Vehicle mileage (Optional)',
            mileageBikePh: 'e.g. 2000 km on this chain...',
            mileageCarPh: 'e.g. 150 000 km...',
            descTitle: 'Problem description',
            descBikePh: 'E.g. chain skips on hard gears when riding uphill...',
            descCarPh: 'E.g. metallic knocking sound when accelerating...',
            quickTagsTitle: 'Quick tags (symptoms)',
            quickTagsBike: ['Skips', 'Squeaks/Rubs', 'Creaks when pedaling', 'Poor shifting', 'Soft lever', 'Wobbles'],
            quickTagsCar: ['Knocking', 'Squeaking', 'No power', 'Jerking', 'Smoking', 'Uneven run'],
            whenOccurs: 'When does it occur?',
            whenBike: ['Under load (uphill)', 'Dry', 'All the time', 'When braking'],
            whenCar: ['All the time', 'Cold engine', 'Warm engine', 'When accelerating'],
            visuals: 'Visual attachments',
            addPhoto: 'Add photo',
            optional: 'Optional',
            cancel: 'Cancel',
            save: 'Save context'
        },
        report: {
            title: 'Diagnostic Report',
            close: 'Close Report',
            diagnosis: 'Diagnosis',
            causes: 'Potential Causes',
            solutions: 'Recommended Solutions',
            mechanic: 'Tips for Mechanic',
            urgent: 'Problem detected',
            normal: 'Normal',
            confidence: 'AI Confidence',
            newScan: 'New scan',
            audioAnalysis: 'Audio sample analysis',
            inputAnalysis: 'Input analysis',
            aiReasoning: 'AI reasoning process',
            aiAlgorithm: 'AI identification algorithm',
            recommendedActions: 'Recommended actions',
            bikeWorkshop: 'Bike workshop: Step by step',
            analysisParams: 'Analysis parameters',
            repairData: 'Repair Data',
            estimatedTime: 'Estimated repair time',
            estimatedTimeWorkshop: 'Estimated bench time',
            failureRisk: 'Failure risk',
            complexity: 'Complexity',
            critical: 'Critical',
            advanced: 'Advanced',
            obdCodes: 'Related OBD-II codes:',
            toolsNeeded: 'Required Tools',
            partsCost: 'Parts cost category:'
        }
    },
    de: {
        nav: {
            auto: 'Auto',
            rower: 'Fahrrad',
            shazam: 'Shazam',
        },
        cancel: 'Abbrechen',
        demoMode: 'Demo-Modus',
        loading: 'Analyse läuft...',
        loadingAI: 'KI-Analyse läuft...',
        understand: 'Ich verstehe',
        dontShow: 'Nicht mehr anzeigen',
        auto: {
            vehicleData: 'Fahrzeugdaten',
            vehicleDataSub: 'Parameter manuell eingeben, um die Diagnose zu unterstützen',
            makeModelPlaceholder: 'Marke & Modell (z.B. Passat B8)',
            yearEnginePlaceholder: 'Jahr, Motor (z.B. 2017 2.0 TDI)',
            protips: 'Pro-Tipps für bessere Ergebnisse',
            visualTitle: 'Foto oder Video aufnehmen',
            visualSub: 'Erkennung basierend auf sichtbaren Schäden',
            audioListening: 'Zuhören...',
            audioTap: 'Tippen zum Diagnostizieren',
            audioOpening: 'Öffnen...',
            audioSubReq: 'Mikrofonzugriff erforderlich',
            audioSubDemo: 'Motorsound-Simulation (kein Mikrofon)',
            audioSubSrc: 'Bringen Sie das Telefon näher an die Geräuschquelle',
            noMic: 'Kein Mikrofon. Demo-Modus gestartet.',
            uploadAudio: 'Audio hochladen',
            uploadVideo: 'Video hochladen',
            uploadFiles: 'Dateien hochladen',
            uploadContext: 'Kontext hinzufügen',
            status: {
                init: 'KI wird initialisiert...',
                iso: 'Hintergrundgeräusche isolieren...',
                search: 'Fehlerdatenbank wird durchsucht...',
                dev: 'Diagnose wird entwickelt...'
            }
        },
        bike: {
            section: 'Fahrrad-Bereich',
            protips: 'Pro-Tipps: Wie man den Fehler aufnimmt',
            title: 'Foto der Kassette / des Details machen',
            subtitle: 'Wir suchen nach verbogenen Zähnen, Rahmenschäden oder Rissen. Machen Sie eine Makroaufnahme.',
            gallery: 'Foto aus der Galerie',
            addContext: 'Kontext hinzufügen',
            targets: [
                'Antrieb (Dehnung, Überspringen)',
                'Bremsen (Quietschen, Reiben)',
                'Tretlager (Knarren beim Treten)',
                'Schaltwerk (Schaltproblem)',
                'Stoßdämpfer / Rahmenlager'
            ],
            status: {
                init: 'KI wird initialisiert...',
                analyze: 'Struktur aus Foto/Video analysieren...',
                check: 'Kettenblattzustand und Schäden prüfen...',
                dev: 'Fahrraddiagnose wird entwickelt...'
            }
        },
        shazam: {
            title: 'Sonic Shazam',
            desc: 'Nehmen Sie Motorgeräusche auf oder fügen Sie ein Foto hinzu, damit die intelligente Sonic-Datenbank das Auto erkennt.',
            listening: 'Zuhören...',
            status: {
                init: 'KI wird initialisiert...',
                isoAudio: 'Audiospur isolieren...',
                isoVisual: 'Foto und Formen analysieren...',
                search: 'Globale Modelldatenbank durchsuchen...',
                identify: 'Identifizieren...'
            }
        },
        instructions: {
            title: 'So nehmen Sie für die Analyse richtig auf',
            car: {
                light: 'Öffnen Sie die Motorhaube (Radio und Klima aus).',
                video: 'Nehmen Sie ein Video auf (Gibt der Diagnose mehr Kontext durch Vibrationen etc.).',
                secure: 'Sichern Sie das Auto (Handbremse, Neutral/P). Vorsicht vor beweglichen Teilen!',
                steps: '3 Schritte: Motor starten → 5 Sekunden warten → leicht Gas geben.'
            },
            bike: {
                light: 'Sorgen Sie für gutes Licht. Fotografieren Sie die Kassette an einem hellen Ort.',
                video: 'Wenn Sie ein Video aufnehmen, drehen Sie die Kurbel manuell, vermeiden Sie Wind.',
                stable: 'Bleiben Sie stabil. Lehnen Sie das Fahrrad an oder nutzen Sie den Ständer. Nicht während der Fahrt filmen!'
            }
        },
        settings: {
            title: 'Einstellungen',
            logout: 'Abmelden',
            tabs: {
                profile: 'Profil',
                history: 'Analyse-Verlauf',
                preferences: 'Präferenzen',
                notifications: 'Benachrichtigungen',
                security: 'Sicherheit'
            },
            preferences: {
                title: 'Präferenzen',
                desc: 'Verwalten Sie Sprache, Erscheinungsbild und Region.',
                langTitle: 'App-Sprache',
                langDesc: 'Wählen Sie die Sprache für die Benutzeroberfläche.',
                themeTitle: 'Design',
                themeDesc: 'Passen Sie das Erscheinungsbild der App an.',
                themes: { system: 'System', light: 'Hell', dark: 'Dunkel', pink: 'Rosa' }
            },
            history: {
                title: 'Analyse-Verlauf',
                desc: 'Durchsuchen Sie frühere Diagnosen und generierte Berichte.'
            },
            profile: {
                title: 'Profil',
                desc: 'Verwalten Sie Ihre persönlichen Daten.',
                photoTitle: 'Profilfoto',
                photoDesc: 'Empfohlene Größe 256x256px. Max 2MB.',
                changePhoto: 'Foto ändern',
                name: 'Vollständiger Name',
                email: 'E-Mail-Adresse',
                save: 'Änderungen speichern'
            },
            comingSoon: {
                title: 'Demnächst',
                desc: 'Dieser Einstellungsbereich befindet sich in der Entwicklung und ist bald verfügbar.'
            }
        },
        chat: {
            title: 'Sichere Verbindung',
            newDiagnosis: 'Neue Diagnose',
            today: 'Heute',
            yesterday: 'Gestern',
            last7days: 'Letzte 7 Tage',
            obdPrompt: 'OBD-II Code eingeben (z.B. P0300)...',
            msgPrompt: 'Schreiben Sie eine Nachricht...',
            micNotSupported: 'Ihr Browser unterstützt keine Spracherkennung.',
            listening: 'Zuhören...',
            scanObd: 'OBD-II scannen',
            moreInfo: 'Mehr Info',
            lessInfo: 'Details ausblenden'
        },
        context: {
            title: 'Fehlerkontext',
            subtitle: 'Helfen Sie der KI, das Problem genauer zu diagnostizieren',
            mileageBike: 'Antriebs- / Fahrradlaufleistung (Optional)',
            mileageCar: 'Fahrzeuglaufleistung (Optional)',
            mileageBikePh: 'z.B. 2000 km auf dieser Kette...',
            mileageCarPh: 'z.B. 150 000 km...',
            descTitle: 'Problembeschreibung',
            descBikePh: 'Z.B. Kette springt bei schweren Gängen bergauf über...',
            descCarPh: 'Z.B. metallisches Klopfen beim Gasgeben...',
            quickTagsTitle: 'Schnell-Tags (Symptome)',
            quickTagsBike: ['Springt', 'Quietscht/Reibt', 'Knarrt beim Treten', 'Schlechte Schaltung', 'Weicher Hebel', 'Wackelt'],
            quickTagsCar: ['Klopfen', 'Quietschen', 'Keine Leistung', 'Ruckeln', 'Raucht', 'Unrunder Lauf'],
            whenOccurs: 'Wann tritt es auf?',
            whenBike: ['Unter Last (bergauf)', 'Trocken', 'Die ganze Zeit', 'Beim Bremsen'],
            whenCar: ['Die ganze Zeit', 'Kalter Motor', 'Warmer Motor', 'Beim Beschleunigen'],
            visuals: 'Visuelle Anhänge',
            addPhoto: 'Foto hinzufügen',
            optional: 'Optional',
            cancel: 'Abbrechen',
            save: 'Kontext speichern'
        },
        report: {
            title: 'Diagnosebericht',
            close: 'Bericht schließen',
            diagnosis: 'Diagnose',
            causes: 'Mögliche Ursachen',
            solutions: 'Empfohlene Lösungen',
            mechanic: 'Tipps für den Mechaniker',
            urgent: 'Problem erkannt',
            normal: 'Normal',
            confidence: 'KI-Sicherheit',
            newScan: 'Neuer Scan',
            audioAnalysis: 'Audioanalyse',
            inputAnalysis: 'Eingabeanalyse',
            aiReasoning: 'KI-Gedankengang',
            aiAlgorithm: 'KI-Erkennungsalgorithmus',
            recommendedActions: 'Empfohlene Maßnahmen',
            bikeWorkshop: 'Fahrradwerkstatt: Schritt für Schritt',
            analysisParams: 'Analyseparameter',
            repairData: 'Reparaturdaten',
            estimatedTime: 'Geschätzte Reparaturzeit',
            estimatedTimeWorkshop: 'Geschätzte Werkstattzeit',
            failureRisk: 'Ausfallrisiko',
            complexity: 'Komplexität',
            critical: 'Kritisch',
            advanced: 'Erweitert',
            obdCodes: 'Zugehörige OBD-II-Codes:',
            toolsNeeded: 'Benötigte Werkzeuge',
            partsCost: 'Teilekostenkategorie:'
        }
    }
};
