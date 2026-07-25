// ========================================
// main.js — Entry Point & Wiring
// ========================================

// ─── Import All Modules ─────────────────
import { state, loadDynamicData, loadState } from './state.js';
import { initTheme } from './theme.js';
import { renderDashboard, updateCountdown, updateCurrentActivity } from './dashboard.js';
import { renderExams } from './exams.js';
import { renderSchedule } from './schedule.js';
import { renderPlanner } from './planner.js';
import { renderSyllabus } from './syllabus.js';
import { populateTrackerSubjects, restoreTrackerState } from './tracker.js';
import { renderTodaysLog } from './journal.js';
import { smartRepairSyllabusData } from './syllabus.js';
import { normalizeForHash, showToast } from './utils.js';
import { closeModal } from './modals.js';
import { getDynamicDataKey, getStorageKey, DYNAMIC_DATA } from './state.js';

// Force side-effect imports (these attach window.* on load)
import './edit-mode.js';

// ─── Tab Navigation ─────────────────────
export function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
  document.querySelector(`.nav-item[data-tab="${tabName}"]`).classList.add('active');
  
  // Refresh content
  if (tabName === 'dashboard') {
    const gs = document.getElementById('group-selector');
    if(gs) gs.value = state.activeGroup;
    const gt = document.getElementById('group-title');
    if(gt) gt.textContent = state.activeGroup === 'group1' ? 'CA Final Group 1' : 'CA Final Group 2';
    renderDashboard();
    if(window.updateOngoingJournalTask) window.updateOngoingJournalTask();
    populateTrackerSubjects();
    restoreTrackerState();
    renderTodaysLog();
    renderTodaysLog();
  }
  if (tabName === 'exams') renderExams();
  if (tabName === 'schedule') renderSchedule();
  if (tabName === 'planner') renderPlanner();
  if (tabName === 'syllabus') renderSyllabus();
  
  window.scrollTo(0, 0);
}

// ─── Initialization ─────────────────────
function init() {
  // Initialize Themes
  initTheme();
  
  // Load dynamic data
  loadDynamicData();
  smartRepairSyllabusData();
  
  // Sync countdown date from the first finalExam entry
  if (DYNAMIC_DATA.finalExams && DYNAMIC_DATA.finalExams.length > 0) {
    if (!DYNAMIC_DATA.exam) DYNAMIC_DATA.exam = {};
    const firstExamDate = DYNAMIC_DATA.finalExams[0].date;
    if (firstExamDate && !firstExamDate.includes('T')) {
      DYNAMIC_DATA.exam.date = firstExamDate + 'T14:00:00+05:30';
    } else if (firstExamDate) {
      DYNAMIC_DATA.exam.date = firstExamDate;
    }
  }
  
  // Load saved schedule preference
  const saved = loadState();
  if (saved.activeSchedule) state.activeSchedule = saved.activeSchedule;
  
  // Render initial tab (updates UI state properly)
  switchTab(state.activeTab);
  
  // Start countdown timer
  setInterval(updateCountdown, 1000);
  
  // Update current activity every minute
  setInterval(updateCurrentActivity, 60000);
}

// Start when DOM ready
document.addEventListener('DOMContentLoaded', init);

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => console.log('SW error:', err));
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });
}

// ─── Cloud Sync Reload ──────────────────
window.reloadAppFromCloud = function(cloudData) {
  if (!cloudData) return;
  
  let newDynamic = cloudData.dynamic || cloudData;
  let newState = cloudData.state || {};
  let newTracker = cloudData.tracker || {};
  
  const trackerState = window.trackerState || {};
  
  const cleanTracker = {
    isRunning: !!newTracker.isRunning,
    isPaused: !!newTracker.isPaused,
    startTime: newTracker.startTime || null,
    pausedTime: newTracker.pausedTime || 0,
    pauseStart: newTracker.pauseStart || null,
    subject: (newTracker.isRunning || newTracker.isPaused) ? (newTracker.subject || '') : '',
    topic: (newTracker.isRunning || newTracker.isPaused) ? (newTracker.topic || '') : '',
    task: (newTracker.isRunning || newTracker.isPaused) ? (newTracker.task || '') : ''
  };

  const cleanLocalTracker = {
    isRunning: !!trackerState.isRunning,
    isPaused: !!trackerState.isPaused,
    startTime: trackerState.startTime || null,
    pausedTime: trackerState.pausedTime || 0,
    pauseStart: trackerState.pauseStart || null,
    subject: (trackerState.isRunning || trackerState.isPaused) ? (trackerState.subject || '') : '',
    topic: (trackerState.isRunning || trackerState.isPaused) ? (trackerState.topic || '') : '',
    task: (trackerState.isRunning || trackerState.isPaused) ? (trackerState.task || '') : ''
  };

  const localHash = JSON.stringify(normalizeForHash(DYNAMIC_DATA)) + JSON.stringify(normalizeForHash(loadState())) + JSON.stringify(normalizeForHash(cleanLocalTracker));
  const cloudHash = JSON.stringify(normalizeForHash(newDynamic)) + JSON.stringify(normalizeForHash(newState)) + JSON.stringify(normalizeForHash(cleanTracker));
  
  if (localHash !== cloudHash) {
    console.log("Cloud data differs. Applying sync...");
    localStorage.setItem(getDynamicDataKey(), JSON.stringify(newDynamic));
    localStorage.setItem(getStorageKey(), JSON.stringify(newState));
    
    if (cleanTracker.isRunning || cleanTracker.isPaused) {
      localStorage.setItem('ca_study_tracker_state', JSON.stringify(cleanTracker));
    } else {
      localStorage.removeItem('ca_study_tracker_state');
    }
    
    // Soft reload to apply changes without refreshing the browser
    loadDynamicData();
    loadState();
    
    // Sync countdown date from the first finalExam entry
    if (DYNAMIC_DATA.finalExams && DYNAMIC_DATA.finalExams.length > 0) {
      if (!DYNAMIC_DATA.exam) DYNAMIC_DATA.exam = {};
      const firstExamDate = DYNAMIC_DATA.finalExams[0].date;
      if (firstExamDate && !firstExamDate.includes('T')) {
        DYNAMIC_DATA.exam.date = firstExamDate + 'T14:00:00+05:30';
      } else if (firstExamDate) {
        DYNAMIC_DATA.exam.date = firstExamDate;
      }
      // Save corrected exam.date back so it overwrites the stale cloud value
      localStorage.setItem(getDynamicDataKey(), JSON.stringify(DYNAMIC_DATA));
    }
    
    // Repair syllabus data if cloud brought in empty/corrupted data
    smartRepairSyllabusData();
    
    restoreTrackerState();
    switchTab(state.activeTab);
    
    showToast("Data synced from cloud! <span class='material-symbols-rounded icon-sm' style='vertical-align:middle'>cloud_done</span>");
  }
};


// ─── Onboarding Tutorial ────────────────
window.startTutorial = function() {
  if (typeof driver === 'undefined' || !window.driver) {
    console.error("Driver.js is not loaded.");
    return;
  }
  
  const driverObj = window.driver.js.driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(0, 0, 0, 0.8)',
    steps: [
      {
        element: '.app-header h1',
        popover: {
          title: 'Select CA Final Group',
          description: 'Tap on the title to switch between CA Final Group 1 and Group 2. Your syllabus, planner, and schedule will update automatically.',
          side: "bottom", align: 'start'
        },
        onHighlightStarted: () => { closeModal(); switchTab('dashboard'); }
      },
      {
        element: '#menuBtn',
        popover: {
          title: 'Settings & Tools',
          description: 'Access the Menu to change Theme colors, Export/Import backups, or turn on Edit Mode.',
          side: "bottom", align: 'end'
        },
        onHighlightStarted: () => { closeModal(); switchTab('dashboard'); }
      },
      {
        element: '#editModeBtn',
        popover: {
          title: 'Edit Mode (Crucial!)',
          description: 'Turn this ON to edit your syllabus subjects, delete wrong logs, or customize planner tasks. Turn it OFF to prevent accidental clicks.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          switchTab('dashboard'); 
          window.openMenuModal(); 
          return new Promise(resolve => setTimeout(resolve, 100)); 
        }
      },
      {
        element: '#study-tracker-card',
        popover: {
          title: 'Live Study Tracker',
          description: 'Select your subject & topic, then hit Start to track your study sessions live. You can also pick directly from today\'s Planner tasks.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { closeModal(); switchTab('dashboard'); }
      },
      {
        element: '#tl-list',
        popover: {
          title: "Today's Log",
          description: 'Your saved sessions appear here. You can also add manual logs if you forgot to start the timer.',
          side: "top", align: 'center'
        },
        onHighlightStarted: () => { closeModal(); switchTab('dashboard'); }
      },
      {
        element: '#tab-planner .planner-actions',
        popover: {
          title: 'Daily Planner',
          description: 'Add your goals for the day. You can even copy unfinished tasks to tomorrow!',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
          switchTab('planner');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '#tab-syllabus .tab-header',
        popover: {
          title: 'Track Syllabus',
          description: 'Mark chapters as done when you finish Concepts, Q-Bank, or Revision Videos.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
          switchTab('syllabus');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '#tab-schedule .schedule-toggle',
        popover: {
          title: 'Master Schedule (Routines)',
          description: 'We have 2 schedules built-in: "Early Morning" for Early Birds, and "Late Night" for Night Owls. Switch between them here!',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
          switchTab('schedule');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '#tab-schedule .tab-header',
        popover: {
          title: 'Macro Timetable',
          description: 'Plan your long-term timeline, including your first pass, revisions, and mock periods down here.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
          switchTab('schedule');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '#tab-exams .tab-header',
        popover: {
          title: 'Mock Exams',
          description: 'Log your mock test scores and analyze your performance across different attempts.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
          switchTab('exams');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '.bottom-nav',
        popover: {
          title: 'Navigation Tabs',
          description: 'Switch between Dashboard, Planner, Syllabus, Timetable, and Exams anytime. You are ready to crush your CA Finals!',
          side: "top", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
          switchTab('dashboard');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    ]
  });
  
  driverObj.drive();
};


// ─── Window Attachments ─────────────────
window.switchTab = switchTab;
