export type Language = 'pl' | 'en' | 'de';

export const translations = {
    pl: {
        // Navigation
        nav: {
            auto: 'Auto',
            rower: 'rower',
            shazam: 'shazam',
        },
        // General
        cancel: 'Anuluj',
        demoMode: 'Tryb Demo',
        loading: 'Trwa Analiza...',
        loadingAI: 'Trwa Analiza AI...',
        // Auto Scanner
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
        // Bike Scanner
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
        // Shazam
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
        }
    }
};
