// Lightbox Functions (Global)
function openLightbox(element) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');

    const img = element.querySelector('img');
    lightboxImg.src = img.src;
    lightboxCaption.textContent = img.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// Close lightbox with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});

// App Logic
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    mobileMenuBtn?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                navLinks.classList.remove('active');
            }
        });
    });

    // Active Nav Link
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) current = section.getAttribute('id');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
        });
    });

    // ============================================
    // GALLERY FILTER FUNCTIONALITY
    // ============================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryCards = document.querySelectorAll('.gallery-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            galleryCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'none';
                    card.offsetHeight; // Trigger reflow
                    card.style.animation = 'fadeInCard 0.5s ease forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ============================================
    // ANIMATED STATISTICS COUNTER
    // ============================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;

        const statsSection = document.getElementById('stats');
        if (!statsSection) return;

        const rect = statsSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

        if (isVisible) {
            statsAnimated = true;

            statNumbers.forEach(stat => {
                const target = parseInt(stat.dataset.count);
                const suffix = stat.dataset.suffix || '';
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16);
                let current = 0;

                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        stat.textContent = Math.floor(current) + suffix;
                        requestAnimationFrame(updateCounter);
                    } else {
                        stat.textContent = target + suffix;
                    }
                };

                updateCounter();
            });
        }
    }

    window.addEventListener('scroll', animateStats);
    animateStats(); // Check on load

    // Rules Data
    const rules = [
        { icon: "🚫", title: "Nichts mitnehmen", desc: "Take nothing but pictures - lass alles so, wie du es vorgefunden hast." },
        { icon: "🔒", title: "Kein Einbruch", desc: "Niemals Türen oder Fenster aufbrechen. Verschlossen = draußen bleiben." },
        { icon: "🤫", title: "Orte geheim halten", desc: "Teile keine genauen Standorte öffentlich - schütze die Locations." },
        { icon: "👥", title: "Niemals alleine", desc: "Geh immer mit mindestens einer weiteren Person. Sicherheit geht vor!" },
        { icon: "🔦", title: "Richtige Ausrüstung", desc: "Taschenlampe, feste Schuhe, Handschuhe und geladenes Handy sind Pflicht." },
        { icon: "⚠️", title: "Gefahren erkennen", desc: "Achte auf instabile Böden, Asbest und morsche Strukturen." },
        { icon: "🎨", title: "Kein Vandalismus", desc: "Keine Graffitis, keine Zerstörung - wir sind Entdecker, keine Vandalen." },
        { icon: "📱", title: "Notfallplan haben", desc: "Sag jemandem Bescheid wohin du gehst und hab wichtige Nummern parat." },
        { icon: "🌙", title: "Tageszeit beachten", desc: "Erkunde bevorzugt bei Tageslicht - Gefahren sind dann besser erkennbar." },
        { icon: "🤝", title: "Respekt zeigen", desc: "Respektiere andere Explorer, Anwohner und die Geschichte des Ortes." }
    ];

    // Render Rules
    const rulesGrid = document.getElementById('rulesGrid');
    if (rulesGrid) {
        rulesGrid.innerHTML = rules.map((rule, i) => `
            <div class="rule-card">
                <div class="rule-number">${String(i + 1).padStart(2, '0')}</div>
                <div class="rule-icon">${rule.icon}</div>
                <h3 class="rule-title">${rule.title}</h3>
                <p class="rule-description">${rule.desc}</p>
            </div>
        `).join('');
    }

    // Shuffle Array Function (Fisher-Yates)
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Quiz State
    let quizState = {
        questions: [], currentIndex: 0, score: 0, answers: [],
        settings: { difficulty: 'all', category: 'all', timer: 0, shuffle: true },
        timerInterval: null, startTime: null,
        shuffledAnswers: [] // Stores shuffled answer indices for each question
    };

    // Elements
    const quizOptions = document.getElementById('quizOptions');
    const quizContainer = document.getElementById('quizContainer');
    const quizResults = document.getElementById('quizResults');
    const startBtn = document.getElementById('startQuizBtn');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const restartBtn = document.getElementById('restartQuizBtn');
    const newQuizBtn = document.getElementById('newQuizBtn');

    // Option Buttons
    document.querySelectorAll('.option-buttons').forEach(group => {
        group.addEventListener('click', (e) => {
            if (!e.target.classList.contains('option-btn')) return;
            group.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            const key = Object.keys(e.target.dataset)[0];
            let value = e.target.dataset[key];
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            else if (!isNaN(value)) value = parseInt(value);
            quizState.settings[key] = value;
        });
    });

    // Filter Questions
    function getFilteredQuestions() {
        let filtered = [...quizQuestions];
        if (quizState.settings.difficulty !== 'all') {
            filtered = filtered.filter(q => q.difficulty === quizState.settings.difficulty);
        }
        if (quizState.settings.category !== 'all') {
            const catMap = { basics: 'Grundlagen', safety: 'Sicherheit', history: 'Geschichte', legal: 'Rechtliches', practice: 'Praxis' };
            filtered = filtered.filter(q => q.category === catMap[quizState.settings.category] || q.category.toLowerCase() === quizState.settings.category);
        }
        if (quizState.settings.shuffle) {
            filtered.sort(() => Math.random() - 0.5);
        }
        return filtered;
    }

    // Start Quiz
    function startQuiz() {
        quizState.questions = getFilteredQuestions();
        if (quizState.questions.length === 0) {
            alert('Keine Fragen für diese Einstellungen gefunden!');
            return;
        }
        quizState.currentIndex = 0;
        quizState.score = 0;
        quizState.answers = new Array(quizState.questions.length).fill(null);
        quizState.startTime = Date.now();

        // Create shuffled answer indices for each question
        quizState.shuffledAnswers = quizState.questions.map(q => {
            const indices = q.answers.map((_, i) => i);
            return shuffleArray(indices);
        });

        quizOptions.style.display = 'none';
        quizContainer.style.display = 'block';
        quizResults.style.display = 'none';

        document.getElementById('quizTimer').style.display = quizState.settings.timer > 0 ? 'flex' : 'none';
        renderQuestion();
    }

    // Render Question
    function renderQuestion() {
        const q = quizState.questions[quizState.currentIndex];
        document.getElementById('questionCategory').textContent = q.category;
        document.getElementById('questionText').textContent = q.question;
        document.getElementById('progressText').textContent = `${quizState.currentIndex + 1}/${quizState.questions.length}`;
        document.getElementById('progressFill').style.width = `${((quizState.currentIndex + 1) / quizState.questions.length) * 100}%`;
        document.getElementById('scoreValue').textContent = quizState.score;

        const grid = document.getElementById('answersGrid');
        const userAnswer = quizState.answers[quizState.currentIndex];

        // Get shuffled answer indices for this question
        const shuffledIndices = quizState.shuffledAnswers[quizState.currentIndex];

        grid.innerHTML = shuffledIndices.map((originalIndex, displayPosition) => {
            const ans = q.answers[originalIndex];
            let classes = 'answer-btn';
            if (userAnswer !== null) {
                classes += ' disabled';
                if (originalIndex === q.correct) classes += ' correct';
                else if (originalIndex === userAnswer && userAnswer !== q.correct) classes += ' wrong';
            }
            return `<button class="${classes}" data-index="${originalIndex}">${ans}</button>`;
        }).join('');

        // Feedback
        const feedback = document.getElementById('quizFeedback');
        if (userAnswer !== null) {
            const isCorrect = userAnswer === q.correct;
            feedback.style.display = 'block';
            feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`;
            document.getElementById('feedbackIcon').textContent = isCorrect ? '✓' : '✗';
            document.getElementById('feedbackText').textContent = isCorrect ? 'Richtig!' : 'Falsch!';
            document.getElementById('feedbackExplanation').textContent = q.explanation;
        } else {
            feedback.style.display = 'none';
        }

        // Navigation
        prevBtn.disabled = quizState.currentIndex === 0;
        nextBtn.textContent = quizState.currentIndex === quizState.questions.length - 1 ? 'Ergebnis' : 'Weiter';

        // Timer
        if (quizState.settings.timer > 0 && userAnswer === null) startTimer();

        // Answer Click
        grid.querySelectorAll('.answer-btn:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.index)));
        });
    }

    // Select Answer
    function selectAnswer(index) {
        if (quizState.answers[quizState.currentIndex] !== null) return;
        clearInterval(quizState.timerInterval);

        quizState.answers[quizState.currentIndex] = index;
        if (index === quizState.questions[quizState.currentIndex].correct) {
            quizState.score++;
        }
        renderQuestion();
    }

    // Timer
    function startTimer() {
        clearInterval(quizState.timerInterval);
        let time = quizState.settings.timer;
        document.getElementById('timerDisplay').textContent = time;

        quizState.timerInterval = setInterval(() => {
            time--;
            document.getElementById('timerDisplay').textContent = time;
            if (time <= 0) {
                clearInterval(quizState.timerInterval);
                if (quizState.answers[quizState.currentIndex] === null) {
                    selectAnswer(-1); // Timeout
                }
            }
        }, 1000);
    }

    // Show Results
    function showResults() {
        clearInterval(quizState.timerInterval);
        quizContainer.style.display = 'none';
        quizResults.style.display = 'block';

        const total = quizState.questions.length;
        const correct = quizState.score;
        const percentage = Math.round((correct / total) * 100);
        const elapsed = Math.floor((Date.now() - quizState.startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;

        document.getElementById('finalScore').textContent = correct;
        document.getElementById('maxScore').textContent = total;
        document.getElementById('resultsPercentage').textContent = `${percentage}% richtig`;

        let icon = '🏆', title = 'Perfekt!', msg = 'Du bist ein echter Urbex-Profi!';
        if (percentage < 50) { icon = '📚'; title = 'Weiter üben!'; msg = 'Lies dir die Regeln nochmal durch!'; }
        else if (percentage < 75) { icon = '👍'; title = 'Gut gemacht!'; msg = 'Du kennst dich schon gut aus!'; }
        else if (percentage < 100) { icon = '🎉'; title = 'Super!'; msg = 'Fast perfekt - sehr beeindruckend!'; }

        document.getElementById('resultsIcon').textContent = icon;
        document.getElementById('resultsTitle').textContent = title;
        document.getElementById('resultsMessage').textContent = msg;
    }

    // Event Listeners
    startBtn?.addEventListener('click', startQuiz);
    nextBtn?.addEventListener('click', () => {
        if (quizState.currentIndex < quizState.questions.length - 1) {
            quizState.currentIndex++;
            renderQuestion();
        } else {
            showResults();
        }
    });
    prevBtn?.addEventListener('click', () => {
        if (quizState.currentIndex > 0) {
            quizState.currentIndex--;
            renderQuestion();
        }
    });
    restartBtn?.addEventListener('click', startQuiz);
    newQuizBtn?.addEventListener('click', () => {
        quizResults.style.display = 'none';
        quizOptions.style.display = 'block';
    });
});

