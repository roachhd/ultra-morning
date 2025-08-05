// Wellness app data
const wellnessData = {
    quotes: [
        "The greatest wealth is health. - Virgil",
        "Take care of your body. It's the only place you have to live. - Jim Rohn",
        "Wellness is the complete integration of body, mind, and spirit. - Greg Anderson",
        "A healthy outside starts from the inside. - Robert Urich",
        "Your body hears everything your mind says. - Naomi Judd",
        "Self-care is how you take your power back. - Lalah Delia",
        "Health is not about the weight you lose, but about the life you gain. - Dr. Josh Axe",
        "To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear. - Buddha",
        "The groundwork for all happiness is good health. - Leigh Hunt",
        "Investing in your health is the best investment you will ever make. - Unknown"
    ],
    
    prompts: [
        "How do I want to feel when I go to bed tonight?",
        "What are three things I am grateful for today?", 
        "What is one thing I can do today that will make me feel accomplished?",
        "How can I show kindness to myself today?",
        "What activities make me feel most alive?",
        "What am I excited to experience today?",
        "How can I make today 1% better than yesterday?",
        "What does my soul need today?",
        "What are three small things that brought me joy recently?",
        "How can I practice self-compassion today?",
        "What intention do I want to set for this day?",
        "What am I looking forward to today?",
        "What would make today feel meaningful?",
        "How can I nurture my body, mind, and spirit today?",
        "What am I proud of from yesterday?",
        "What challenge can I embrace today as an opportunity for growth?"
    ],
    
    inspiration: [
        "Today is a new day, so rise up and move forward. Each morning brings new potential, but it's up to you to bring it to life.",
        "Every morning is a beautiful morning. - Terri Guillemets",
        "Today is your day to start fresh, to eat right, to train hard, to live healthy, to be proud. - Bonnie Pfiester",
        "The morning sun is calling for you to wake up and chase your dreams.",
        "Make each day your masterpiece. - John Wooden",
        "There is a morning inside you waiting to burst open into light. - Rumi",
        "Each morning we are born again. What we do today is what matters most. - Buddha",
        "Rise up, start fresh, see the bright opportunity in each day. - Unknown",
        "Morning is an important time of day because how you spend your morning can often tell you what kind of day you are going to have. - Lemony Snicket",
        "Every sunrise is an invitation for us to arise and brighten someone's day. - Richelle E. Goodrich"
    ]
};

// App state
let currentTab = 'wellness';
let timerInterval = null;
let timerMinutes = 0;
let timerSeconds = 0;
let timerRunning = false;
let completedSteps = 0;
const totalSteps = 6;

// Utility functions
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function formatTime(minutes, seconds) {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

// Initialize app
function initializeApp() {
    console.log('Initializing Daily Wellness App...');
    
    // Set current date
    const currentDate = new Date();
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = formatDate(currentDate);
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Load saved data
    loadSavedData();
    
    // Initialize content
    refreshContent();
    
    console.log('App initialized successfully!');
}

// Event listeners setup
function setupEventListeners() {
    // Tab navigation
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Refresh buttons
    const refreshButtons = document.querySelectorAll('.refresh-btn');
    refreshButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const type = btn.dataset.type;
            refreshSpecificContent(type);
            
            // Add loading animation
            btn.classList.add('loading');
            setTimeout(() => btn.classList.remove('loading'), 500);
        });
    });

    // Morning routine checkboxes
    const checkboxes = document.querySelectorAll('.step-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', () => toggleStep(checkbox));
    });

    // Timer controls
    const timerStart = document.getElementById('timer-start');
    const timerPause = document.getElementById('timer-pause');
    const timerReset = document.getElementById('timer-reset');
    
    if (timerStart) timerStart.addEventListener('click', startTimer);
    if (timerPause) timerPause.addEventListener('click', pauseTimer);
    if (timerReset) timerReset.addEventListener('click', resetTimer);

    // Timer presets
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.dataset.minutes);
            setTimer(minutes, 0);
        });
    });

    // Journal functionality
    const saveJournalBtn = document.getElementById('save-journal');
    const clearJournalBtn = document.getElementById('clear-journal');
    const journalText = document.getElementById('journal-text');

    if (saveJournalBtn) saveJournalBtn.addEventListener('click', saveJournalEntry);
    if (clearJournalBtn) clearJournalBtn.addEventListener('click', clearJournalEntry);
    if (journalText) {
        journalText.addEventListener('input', () => {
            // Auto-save functionality
            clearTimeout(window.journalSaveTimeout);
            window.journalSaveTimeout = setTimeout(() => {
                saveJournalEntry(true); // Silent save
            }, 2000);
        });
    }
}

// Tab switching
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update nav tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    console.log(`Switched to ${tabName} tab`);
}

// Content refresh functions
function refreshContent() {
    refreshSpecificContent('quote');
    refreshSpecificContent('prompts');
    refreshSpecificContent('inspiration');
    updateJournalPrompts();
}

function refreshSpecificContent(type) {
    switch(type) {
        case 'quote':
            const quoteElement = document.getElementById('daily-quote');
            if (quoteElement) {
                quoteElement.textContent = getRandomItem(wellnessData.quotes);
            }
            break;
            
        case 'prompts':
            const prompts = getRandomItems(wellnessData.prompts, 2);
            const prompt1 = document.getElementById('prompt-1');
            const prompt2 = document.getElementById('prompt-2');
            if (prompt1) prompt1.textContent = prompts[0];
            if (prompt2) prompt2.textContent = prompts[1];
            break;
            
        case 'inspiration':
            const inspirationElement = document.getElementById('daily-inspiration');
            if (inspirationElement) {
                inspirationElement.textContent = getRandomItem(wellnessData.inspiration);
            }
            break;
    }
}

// Morning routine functionality
function toggleStep(checkbox) {
    const step = checkbox.closest('.routine-step');
    const isCompleted = checkbox.classList.contains('checked');
    
    if (isCompleted) {
        // Uncheck
        checkbox.classList.remove('checked');
        step.classList.remove('completed');
        completedSteps--;
    } else {
        // Check
        checkbox.classList.add('checked');
        step.classList.add('completed');
        completedSteps++;
    }
    
    updateProgress();
    saveRoutineProgress();
}

function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    const percentage = (completedSteps / totalSteps) * 100;
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${completedSteps}/${totalSteps} completed`;
    }
}

// Timer functionality
function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        timerInterval = setInterval(() => {
            if (timerSeconds > 0) {
                timerSeconds--;
            } else if (timerMinutes > 0) {
                timerMinutes--;
                timerSeconds = 59;
            } else {
                // Timer finished
                resetTimer();
                showNotification('Timer finished! Great job!');
                return;
            }
            updateTimerDisplay();
        }, 1000);
        
        updateTimerButtons();
    }
}

function pauseTimer() {
    if (timerRunning) {
        timerRunning = false;
        clearInterval(timerInterval);
        updateTimerButtons();
    }
}

function resetTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    timerMinutes = 0;
    timerSeconds = 0;
    updateTimerDisplay();
    updateTimerButtons();
}

function setTimer(minutes, seconds) {
    resetTimer();
    timerMinutes = minutes;
    timerSeconds = seconds;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const display = document.getElementById('timer-display');
    if (display) {
        display.textContent = formatTime(timerMinutes, timerSeconds);
    }
}

function updateTimerButtons() {
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    
    if (startBtn && pauseBtn) {
        if (timerRunning) {
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'flex';
        } else {
            startBtn.style.display = 'flex';
            pauseBtn.style.display = 'none';
        }
    }
}

// Journal functionality
function updateJournalPrompts() {
    const prompts = getRandomItems(wellnessData.prompts, 2);
    const journalPrompt1 = document.getElementById('journal-prompt-1');
    const journalPrompt2 = document.getElementById('journal-prompt-2');
    
    if (journalPrompt1) journalPrompt1.textContent = prompts[0];
    if (journalPrompt2) journalPrompt2.textContent = prompts[1];
}

function saveJournalEntry(silent = false) {
    const journalText = document.getElementById('journal-text');
    const saveStatus = document.getElementById('save-status');
    
    if (journalText && saveStatus) {
        const content = journalText.value;
        const timestamp = new Date().toISOString();
        
        // Save to localStorage
        const journalData = {
            content: content,
            timestamp: timestamp,
            date: formatDate(new Date())
        };
        
        localStorage.setItem('dailyWellnessJournal', JSON.stringify(journalData));
        
        if (!silent) {
            saveStatus.textContent = 'Journal entry saved successfully!';
            saveStatus.className = 'save-status success';
            
            setTimeout(() => {
                saveStatus.textContent = '';
                saveStatus.className = 'save-status';
            }, 3000);
        }
    }
}

function clearJournalEntry() {
    const journalText = document.getElementById('journal-text');
    const saveStatus = document.getElementById('save-status');
    
    if (confirm('Are you sure you want to clear your journal entry?')) {
        if (journalText) {
            journalText.value = '';
        }
        
        if (saveStatus) {
            saveStatus.textContent = 'Journal cleared.';
            saveStatus.className = 'save-status';
            
            setTimeout(() => {
                saveStatus.textContent = '';
            }, 2000);
        }
    }
}

// Data persistence
function saveRoutineProgress() {
    const progressData = {
        completedSteps: completedSteps,
        date: formatDate(new Date()),
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('dailyWellnessProgress', JSON.stringify(progressData));
}

function loadSavedData() {
    // Load journal data
    const savedJournal = localStorage.getItem('dailyWellnessJournal');
    if (savedJournal) {
        const journalData = JSON.parse(savedJournal);
        const journalText = document.getElementById('journal-text');
        
        // Only load if it's from today
        if (journalData.date === formatDate(new Date()) && journalText) {
            journalText.value = journalData.content;
        }
    }
    
    // Load routine progress
    const savedProgress = localStorage.getItem('dailyWellnessProgress');
    if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        
        // Only load if it's from today
        if (progressData.date === formatDate(new Date())) {
            completedSteps = progressData.completedSteps;
            
            // Update UI to reflect saved progress
            const checkboxes = document.querySelectorAll('.step-checkbox');
            checkboxes.forEach((checkbox, index) => {
                if (index < completedSteps) {
                    checkbox.classList.add('checked');
                    checkbox.closest('.routine-step').classList.add('completed');
                }
            });
            
            updateProgress();
        }
    }
}

// Notification system
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: var(--shadow-medium);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Service Worker Registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for testing (if needed)
window.WellnessApp = {
    switchTab,
    refreshContent,
    toggleStep,
    startTimer,
    pauseTimer,
    resetTimer,
    saveJournalEntry,
    clearJournalEntry
};
