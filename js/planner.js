// ========================================
// planner.js — Calendar & Daily Planner
// ========================================

import { state, DYNAMIC_DATA, saveDynamicData } from './state.js';
import { formatDate, formatDateFull, dateKey, daysUntil, isToday, showToast } from './utils.js';
import { openModal, closeModal } from './modals.js';
import { getSyllabusProgress, saveSyllabusProgress, getPlannerTasks, savePlannerTasks } from './state.js';

export function renderPlanner() {
  renderPlannerMockReminder();
  renderMiniCalendar();
  renderPlannerDay();
}

export function renderPlannerMockReminder() {
  const nextMock = (typeof window.getNextMock === 'function') ? window.getNextMock() : null;
  const el = document.getElementById('planner-mock-reminder');
  if (nextMock) {
    const days = daysUntil(nextMock.date);
    el.innerHTML = `<span class="pmr-icon"><span class="material-symbols-rounded icon-sm">track_changes</span></span> Next mock: <strong>${nextMock.subject}</strong> in <strong>${days} days</strong> (${formatDate(nextMock.date)})`;
    el.className = 'planner-mock-reminder glass-card' + (days <= 3 ? ' urgent' : '');
  } else {
    el.innerHTML = '<span class="material-symbols-rounded icon-sm" style="vertical-align:middle; color:var(--success-color);">task_alt</span> All mock tests done!';
  }
}

export function renderMiniCalendar() {
  const date = state.calendarMonth;
  const year = date.getFullYear();
  const month = date.getMonth();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  
  document.getElementById('cal-month-label').textContent = months[month] + ' ' + year;
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay === 0 ? 6 : firstDay - 1; // Monday start
  
  const tasks = getPlannerTasks();
  let html = '';
  
  for (let i = 0; i < startDay; i++) {
    html += '<span class="cal-day empty"></span>';
  }
  
  // Build set of important dates for highlighting
  const mockDates = new Set();
  const examDates = new Set();
  DYNAMIC_DATA.mocks.flatMap(s => s.tests).forEach(m => mockDates.add(m.date));
  DYNAMIC_DATA.finalExams.forEach(e => examDates.add(e.date));
  
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayTasks = tasks[key] || [];
    const done = dayTasks.filter(t => t.done).length;
    const total = dayTasks.length;
    let dotClass = '';
    if (total > 0) {
      dotClass = done === total ? 'day-green' : (done > 0 ? 'day-yellow' : 'day-grey');
    }
    // Highlight mock test and exam dates
    const isMockDay = mockDates.has(key);
    const isExamDay = examDates.has(key);
    const mockClass = isMockDay ? 'day-mock' : '';
    const examClass = isExamDay ? 'day-exam' : '';
    const todayClass = isToday(new Date(year, month, d)) ? 'today' : '';
    const selectedClass = dateKey(state.plannerDate) === key ? 'selected' : '';
    
    // Get tooltip for special days
    let tooltip = '';
    if (isMockDay) {
      const mock = DYNAMIC_DATA.mocks.flatMap(s => s.tests).find(m => m.date === key);
      tooltip = `Mock: ${mock.subject}`;
    }
    if (isExamDay) {
      const exam = DYNAMIC_DATA.finalExams.find(e => e.date === key);
      tooltip = `EXAM: ${exam.subject}`;
    }
    
    html += `<span class="cal-day ${dotClass} ${mockClass} ${examClass} ${todayClass} ${selectedClass}" onclick="selectPlannerDay(${year}, ${month}, ${d})" title="${tooltip}">${d}</span>`;
  }
  
  document.getElementById('cal-days').innerHTML = html;
}

export function changeMonth(delta) {
  state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + delta, 1);
  renderMiniCalendar();
}

export function selectPlannerDay(year, month, day) {
  state.plannerDate = new Date(year, month, day);
  renderPlanner();
}

export function changePlannerDay(delta) {
  state.plannerDate = new Date(state.plannerDate.getTime() + delta * 24 * 60 * 60 * 1000);
  state.calendarMonth = new Date(state.plannerDate);
  renderPlanner();
}

export function renderPlannerDay() {
  const date = state.plannerDate;
  const label = isToday(date) ? 'Today — ' + formatDateFull(date) : formatDateFull(date);
  document.getElementById('planner-day-label').textContent = label;
  
  const tasks = getPlannerTasks();
  const key = dateKey(date);
  const dayTasks = tasks[key] || [];
  
  const primary = dayTasks.filter(t => t.category === 'primary');
  const secondary = dayTasks.filter(t => t.category === 'secondary');
  const quick = dayTasks.filter(t => t.category !== 'primary' && t.category !== 'secondary');
  
  document.getElementById('planner-primary-tasks').innerHTML = renderPlannerTaskList(primary, key);
  document.getElementById('planner-secondary-tasks').innerHTML = renderPlannerTaskList(secondary, key);
  document.getElementById('planner-quick-tasks').innerHTML = renderPlannerTaskList(quick, key);
}

export function renderPlannerTaskList(tasks, dayKey) {
  if (tasks.length === 0) return '<div class="empty-tasks">No tasks yet — tap "+ Add Task"</div>';
  
  return tasks.map((task, idx) => `
    <div class="planner-task ${task.done ? 'task-done' : ''}" onclick="togglePlannerTask('${dayKey}', ${task.originalIndex})">
      <span class="task-check">${task.done ? '<span class="material-symbols-rounded icon-sm">check_box</span>' : '<span class="material-symbols-rounded icon-sm">check_box_outline_blank</span>'}</span>
      <div class="task-info">
        <div class="task-name">${task.name}</div>
        ${task.subject ? '<div class="task-subject">' + task.subject + '</div>' : ''}
      </div>
      <button class="task-delete" onclick="event.stopPropagation(); deletePlannerTask('${dayKey}', ${task.originalIndex})"><span class="material-symbols-rounded icon-sm">delete</span></button>
    </div>
  `).join('');
}

export function togglePlannerTask(dayKey, taskIndex) {
  const tasks = getPlannerTasks();
  if (tasks[dayKey] && tasks[dayKey][taskIndex]) {
    const task = tasks[dayKey][taskIndex];
    task.done = !task.done;
    
    // Auto-sync to syllabus
    if (task.chapterId && task.activityType) {
      const progress = getSyllabusProgress();
      if (!progress[task.chapterId]) progress[task.chapterId] = {};
      progress[task.chapterId][task.activityType] = task.done;
      saveSyllabusProgress(progress);
    }
    
    savePlannerTasks(tasks);
    renderPlanner();
  }
}

export function deletePlannerTask(dayKey, taskIndex) {
  const tasks = getPlannerTasks();
  if (tasks[dayKey]) {
    tasks[dayKey].splice(taskIndex, 1);
    // Re-index
    tasks[dayKey].forEach((t, i) => t.originalIndex = i);
    savePlannerTasks(tasks);
    renderPlanner();
    showToast('Task deleted! <span class="material-symbols-rounded icon-sm">delete</span>');
  }
}

export function openAddTaskModal() {
  const flattenSubjects = (list) => {
    let res = [];
    (list || []).forEach(s => {
      if (s.type === 'folder' && s.children) res = res.concat(s.children);
      else res.push(s);
    });
    return res;
  };
  const subjects = flattenSubjects(DYNAMIC_DATA.syllabusSubjects).map(s => ({ value: s.id, label: s.name }));
  
  openModal('<span class="material-symbols-rounded icon-sm">add</span> Add Task', '<div class="form-group"><label>Date</label><input type="date" id="task-date" value="' + dateKey(state.plannerDate) + '"></div><div class="form-group"><label>Category</label><select id="task-category" onchange="onTaskCategoryChange()"><option value="primary">Primary Subject</option><option value="secondary">Secondary Subject</option><option value="quick">Quick Task</option></select></div><div id="task-study-fields"><div class="form-group"><label>Subject</label><select id="task-subject" onchange="onTaskSubjectChange()"><option value="">— Select —</option>' + subjects.map(s => '<option value="' + s.value + '">' + s.label + '</option>').join('') + '</select></div><div class="form-group" id="task-chapter-group" style="display:none;"><label>Chapter</label><select id="task-chapter" onchange="onTaskChapterChange()"><option value="">— Select —</option></select></div><div class="form-group" id="task-activity-group" style="display:none;"><label>Activity</label><select id="task-activity" onchange="onTaskChapterChange()"><option value="">— Select —</option><option value="conceptBook">Book (Concepts)</option><option value="questionBank">Question Bank</option><option value="revisionVideo">Revision Video</option></select></div></div><div class="form-group"><label>Task Description</label><input type="text" id="task-name" placeholder="e.g. Complete pending questions"></div><button class="btn-primary" onclick="addPlannerTask()">Add Task <span class="material-symbols-rounded icon-sm">check_circle</span></button>');
}

export function onTaskCategoryChange() {
  const cat = document.getElementById('task-category').value;
  const fields = document.getElementById('task-study-fields');
  if (fields) {
    if (cat === 'quick') {
      fields.style.display = 'none';
    } else {
      fields.style.display = 'block';
    }
  }
}

export function onTaskSubjectChange() {
  const subj = document.getElementById('task-subject').value;
  const chapterGroup = document.getElementById('task-chapter-group');
  const activityGroup = document.getElementById('task-activity-group');
  const chapterSelect = document.getElementById('task-chapter');
  
  if (!subj) {
    chapterGroup.style.display = 'none';
    activityGroup.style.display = 'none';
    return;
  }
  
  let chapters = [];
  const flattenSubjects = (list) => {
    let res = [];
    (list || []).forEach(s => {
      if (s.type === 'folder' && s.children) res = res.concat(s.children);
      else res.push(s);
    });
    return res;
  };
  const flatSubjects = flattenSubjects(DYNAMIC_DATA.syllabusSubjects);
  const subjectObj = flatSubjects.find(s => s.id === subj);
  
  if (subjectObj && subjectObj.chapters) {
    chapters = subjectObj.chapters;
  }
  
  if (chapters.length > 0) {
    chapterGroup.style.display = 'block';
    chapterSelect.innerHTML = '<option value="">— Select Chapter —</option>' + 
      chapters.map(c => '<option value="' + c.id + '">' + c.name + '</option>').join('');
      
    if (subjectObj && (subjectObj.type === 'ibs' || subj.toLowerCase().startsWith('ibs-'))) {
      activityGroup.style.display = 'none';
    } else {
      activityGroup.style.display = 'block';
    }
  } else {
    chapterGroup.style.display = 'none';
    activityGroup.style.display = 'none';
  }
}

export function onTaskChapterChange() {
  const chapterSelect = document.getElementById('task-chapter');
  const chapterId = chapterSelect.value;
  const chapterName = chapterSelect.options[chapterSelect.selectedIndex]?.text;
  
  const activitySelect = document.getElementById('task-activity');
  const activity = activitySelect.value;
  const activityName = activitySelect.options[activitySelect.selectedIndex]?.text;
  
  const taskName = document.getElementById('task-name');
  
  if (chapterId) {
    // Strip emojis for cleaner task name
    const cleanActivity = activityName ? activityName.replace(/[^a-zA-Z\\s\\(\\)]/g, '').trim() : '';
    taskName.value = chapterName + (cleanActivity ? ` — ${cleanActivity}` : '');
  }
}

export function addPlannerTask() {
  const name = document.getElementById('task-name').value.trim();
  const category = document.getElementById('task-category').value;
  const subject = document.getElementById('task-subject').value;
  
  const chapterId = document.getElementById('task-chapter') ? document.getElementById('task-chapter').value : '';
  let activityType = document.getElementById('task-activity') ? document.getElementById('task-activity').value : '';
  
  // For IBS subjects (no activity dropdown), implicitly set activity to 'done'
  if (subject && subject.toLowerCase().startsWith('ibs-') && chapterId) {
    activityType = 'done';
  }
  
  if (category !== 'quick') {
    if (!subject) { showToast('Please select a Subject! <span class="material-symbols-rounded icon-sm">warning</span>'); return; }
    if (!chapterId) { showToast('Please select a Chapter! <span class="material-symbols-rounded icon-sm">warning</span>'); return; }
    if (!activityType) { showToast('Please select an Activity! <span class="material-symbols-rounded icon-sm">warning</span>'); return; }
  } else {
    // If it's a quick task, clear out subject/chapter/activity if any were selected before changing category
    document.getElementById('task-subject').value = '';
    if (document.getElementById('task-chapter')) document.getElementById('task-chapter').value = '';
    if (document.getElementById('task-activity')) document.getElementById('task-activity').value = '';
  }
  
  if (!name) { showToast('Please enter a task name! <span class="material-symbols-rounded icon-sm">warning</span>'); return; }
  
  const tasks = getPlannerTasks();
  const key = dateKey(state.plannerDate);
  if (!tasks[key]) tasks[key] = [];
  
  tasks[key].push({
    name,
    category,
    subject,
    chapterId,
    activityType,
    done: false,
    originalIndex: tasks[key].length
  });
  
  savePlannerTasks(tasks);
  closeModal();
  renderPlanner();
  showToast('Task added! <span class="material-symbols-rounded icon-sm">check_circle</span>');
}

export function copyToTomorrow() {
  const tasks = getPlannerTasks();
  const todayKey = dateKey(state.plannerDate);
  const tomorrowDate = new Date(state.plannerDate.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowKey = dateKey(tomorrowDate);
  
  const todayTasks = tasks[todayKey] || [];
  if (todayTasks.length === 0) { showToast('No tasks to copy! Add tasks first.'); return; }
  
  tasks[tomorrowKey] = todayTasks.map((t, i) => ({ ...t, done: false, originalIndex: i }));
  savePlannerTasks(tasks);
  showToast('Copied to tomorrow!');
}

// ─── Window Attachments ─────────────────
window.renderPlanner = renderPlanner;
window.changeMonth = changeMonth;
window.selectPlannerDay = selectPlannerDay;
window.changePlannerDay = changePlannerDay;
window.togglePlannerTask = togglePlannerTask;
window.deletePlannerTask = deletePlannerTask;
window.openAddTaskModal = openAddTaskModal;
window.onTaskCategoryChange = onTaskCategoryChange;
window.onTaskSubjectChange = onTaskSubjectChange;
window.onTaskChapterChange = onTaskChapterChange;
window.addPlannerTask = addPlannerTask;
window.copyToTomorrow = copyToTomorrow;
