// Smart Study Planner - JavaScript

// State Management
let tasks = JSON.parse(localStorage.getItem("studyTasks")) || []
let currentEditId = null

// DOM Elements
const taskForm = document.getElementById("taskForm")
const editTaskForm = document.getElementById("editTaskForm")
const tasksList = document.getElementById("tasksList")
const emptyState = document.getElementById("emptyState")
const timeline = document.getElementById("timeline")
const editModal = document.getElementById("editModal")
const themeToggle = document.getElementById("themeToggle")
const filterPriority = document.getElementById("filterPriority")
const filterStatus = document.getElementById("filterStatus")
const sortBy = document.getElementById("sortBy")
const clearCompletedBtn = document.getElementById("clearCompleted")

// Motivational Quotes
const quotes = [
  "Success is the sum of small efforts repeated day in and day out.",
  "The expert in anything was once a beginner.",
  "Education is the passport to the future.",
  "Learning is a treasure that will follow its owner everywhere.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Study while others are sleeping; work while others are loafing.",
  "Your future is created by what you do today, not tomorrow.",
  "Don't watch the clock; do what it does. Keep going.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
]

// Initialize App
function init() {
  loadTheme()
  renderTasks()
  updateStats()
  updateProgress()
  renderTimeline()
  setMinDate()

  // Event Listeners
  taskForm.addEventListener("submit", handleAddTask)
  editTaskForm.addEventListener("submit", handleEditTask)
  themeToggle.addEventListener("click", toggleTheme)
  filterPriority.addEventListener("change", renderTasks)
  filterStatus.addEventListener("change", renderTasks)
  sortBy.addEventListener("change", renderTasks)
  clearCompletedBtn.addEventListener("click", clearCompleted)
  document.getElementById("closeModal").addEventListener("click", closeModal)
  document.getElementById("cancelEdit").addEventListener("click", closeModal)

  // Close modal on outside click
  editModal.addEventListener("click", (e) => {
    if (e.target === editModal) closeModal()
  })
}

// Set minimum date to today
function setMinDate() {
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("taskDate").setAttribute("min", today)
  document.getElementById("editTaskDate").setAttribute("min", today)
}

// Theme Management
function loadTheme() {
  const theme = localStorage.getItem("theme") || "light"
  if (theme === "dark") {
    document.body.classList.add("dark-mode")
    themeToggle.querySelector(".theme-icon").textContent = "☀️"
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode")
  const isDark = document.body.classList.contains("dark-mode")
  themeToggle.querySelector(".theme-icon").textContent = isDark ? "☀️" : "🌙"
  localStorage.setItem("theme", isDark ? "dark" : "light")
}

// Task Management
function handleAddTask(e) {
  e.preventDefault()

  const task = {
    id: Date.now(),
    title: document.getElementById("taskTitle").value,
    subject: document.getElementById("taskSubject").value,
    date: document.getElementById("taskDate").value,
    time: document.getElementById("taskTime").value,
    priority: document.getElementById("taskPriority").value,
    description: document.getElementById("taskDescription").value,
    completed: false,
    createdAt: new Date().toISOString(),
  }

  tasks.push(task)
  saveTasks()
  taskForm.reset()
  renderTasks()
  updateStats()
  updateProgress()
  renderTimeline()

  // Show success feedback
  showNotification("Task added successfully! 🎉")
}

function handleEditTask(e) {
  e.preventDefault()

  const taskIndex = tasks.findIndex((t) => t.id === currentEditId)
  if (taskIndex !== -1) {
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      title: document.getElementById("editTaskTitle").value,
      subject: document.getElementById("editTaskSubject").value,
      date: document.getElementById("editTaskDate").value,
      time: document.getElementById("editTaskTime").value,
      priority: document.getElementById("editTaskPriority").value,
      description: document.getElementById("editTaskDescription").value,
    }

    saveTasks()
    closeModal()
    renderTasks()
    updateStats()
    updateProgress()
    renderTimeline()

    showNotification("Task updated successfully! ✅")
  }
}

function toggleTaskComplete(id) {
  const task = tasks.find((t) => t.id === id)
  if (task) {
    task.completed = !task.completed
    saveTasks()
    renderTasks()
    updateStats()
    updateProgress()
    renderTimeline()
  }
}

function deleteTask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter((t) => t.id !== id)
    saveTasks()
    renderTasks()
    updateStats()
    updateProgress()
    renderTimeline()

    showNotification("Task deleted! 🗑️")
  }
}

function editTask(id) {
  const task = tasks.find((t) => t.id === id)
  if (task) {
    currentEditId = id
    document.getElementById("editTaskTitle").value = task.title
    document.getElementById("editTaskSubject").value = task.subject
    document.getElementById("editTaskDate").value = task.date
    document.getElementById("editTaskTime").value = task.time
    document.getElementById("editTaskPriority").value = task.priority
    document.getElementById("editTaskDescription").value = task.description

    editModal.classList.add("show")
  }
}

function closeModal() {
  editModal.classList.remove("show")
  currentEditId = null
}

function clearCompleted() {
  const completedCount = tasks.filter((t) => t.completed).length
  if (completedCount === 0) {
    showNotification("No completed tasks to clear!")
    return
  }

  if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
    tasks = tasks.filter((t) => !t.completed)
    saveTasks()
    renderTasks()
    updateStats()
    updateProgress()
    renderTimeline()

    showNotification("Completed tasks cleared! 🧹")
  }
}

// Render Functions
function renderTasks() {
  let filteredTasks = [...tasks]

  // Apply filters
  const priorityFilter = filterPriority.value
  const statusFilter = filterStatus.value

  if (priorityFilter !== "all") {
    filteredTasks = filteredTasks.filter((t) => t.priority === priorityFilter)
  }

  if (statusFilter === "completed") {
    filteredTasks = filteredTasks.filter((t) => t.completed)
  } else if (statusFilter === "pending") {
    filteredTasks = filteredTasks.filter((t) => !t.completed)
  }

  // Apply sorting
  const sortOption = sortBy.value
  filteredTasks.sort((a, b) => {
    if (sortOption === "date") {
      return new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time)
    } else if (sortOption === "priority") {
      const priorityOrder = { high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    } else if (sortOption === "subject") {
      return a.subject.localeCompare(b.subject)
    }
    return 0
  })

  // Render tasks
  if (filteredTasks.length === 0) {
    tasksList.innerHTML = ""
    emptyState.classList.add("show")
  } else {
    emptyState.classList.remove("show")
    tasksList.innerHTML = filteredTasks.map((task) => createTaskHTML(task)).join("")

    // Add event listeners
    filteredTasks.forEach((task) => {
      const checkbox = document.querySelector(`[data-checkbox="${task.id}"]`)
      const editBtn = document.querySelector(`[data-edit="${task.id}"]`)
      const deleteBtn = document.querySelector(`[data-delete="${task.id}"]`)

      if (checkbox) checkbox.addEventListener("change", () => toggleTaskComplete(task.id))
      if (editBtn) editBtn.addEventListener("click", () => editTask(task.id))
      if (deleteBtn) deleteBtn.addEventListener("click", () => deleteTask(task.id))
    })
  }
}

function createTaskHTML(task) {
  const dueDate = new Date(task.date + " " + task.time)
  const formattedDate = dueDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const formattedTime = dueDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const isOverdue = !task.completed && new Date() > dueDate

  return `
        <div class="task-item ${task.completed ? "completed" : ""} priority-${task.priority}">
            <div class="task-header">
                <div class="task-main">
                    <div class="task-title-row">
                        <input 
                            type="checkbox" 
                            class="task-checkbox" 
                            ${task.completed ? "checked" : ""} 
                            data-checkbox="${task.id}"
                        >
                        <h3 class="task-title">${task.title}</h3>
                    </div>
                    <div class="task-meta">
                        <span class="task-badge subject">📚 ${task.subject}</span>
                        <span class="task-badge date ${isOverdue ? "overdue" : ""}">
                            📅 ${formattedDate} ⏰ ${formattedTime}
                        </span>
                        <span class="task-badge priority priority-${task.priority}">
                            ${task.priority.toUpperCase()}
                        </span>
                    </div>
                    ${task.description ? `<p class="task-description">${task.description}</p>` : ""}
                </div>
                <div class="task-actions">
                    <button class="task-btn edit" data-edit="${task.id}" title="Edit task">✏️</button>
                    <button class="task-btn delete" data-delete="${task.id}" title="Delete task">🗑️</button>
                </div>
            </div>
        </div>
    `
}

function renderTimeline() {
  const sortedTasks = [...tasks].sort((a, b) => {
    return new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time)
  })

  if (sortedTasks.length === 0) {
    timeline.innerHTML = '<p style="text-align: center; color: var(--text-color);">No tasks scheduled yet.</p>'
    return
  }

  timeline.innerHTML = sortedTasks
    .map((task) => {
      const dueDate = new Date(task.date + " " + task.time)
      const formattedDate = dueDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      return `
            <div class="timeline-item ${task.completed ? "completed" : ""}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${formattedDate}</div>
                    <div class="timeline-title">${task.title}</div>
                    <div class="timeline-subject">${task.subject}</div>
                </div>
            </div>
        `
    })
    .join("")
}

function updateStats() {
  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const pending = total - completed
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  document.getElementById("totalTasks").textContent = total
  document.getElementById("completedTasks").textContent = completed
  document.getElementById("pendingTasks").textContent = pending
  document.getElementById("progressPercent").textContent = `${progress}%`
}

function updateProgress() {
  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const progress = total > 0 ? (completed / total) * 100 : 0

  // Update progress circle
  const circle = document.getElementById("progressCircle")
  const circumference = 2 * Math.PI * 90 // radius = 90
  const offset = circumference - (progress / 100) * circumference
  circle.style.strokeDashoffset = offset

  // Update progress text
  document.getElementById("progressValue").textContent = `${Math.round(progress)}%`
  document.getElementById("progressTotal").textContent = total
  document.getElementById("progressCompleted").textContent = completed
  document.getElementById("progressRemaining").textContent = total - completed

  // Update motivational quote based on progress
  const quoteElement = document.getElementById("motivationalQuote")
  if (progress === 100 && total > 0) {
    quoteElement.textContent = "🎉 Amazing! You've completed all your tasks! Keep up the great work!"
  } else if (progress >= 75) {
    quoteElement.textContent = "🌟 You're almost there! Just a little more to go!"
  } else if (progress >= 50) {
    quoteElement.textContent = "💪 Great progress! You're halfway through!"
  } else if (progress >= 25) {
    quoteElement.textContent = "🚀 Good start! Keep the momentum going!"
  } else {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    quoteElement.textContent = randomQuote
  }
}

// Local Storage
function saveTasks() {
  localStorage.setItem("studyTasks", JSON.stringify(tasks))
}

// Notification System
function showNotification(message) {
  // Simple console notification (can be enhanced with toast notifications)
  console.log(message)

  // You can add a toast notification library here for better UX
  // For now, we'll use a simple alert-style approach
  const notification = document.createElement("div")
  notification.textContent = message
  notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease"
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// Add animation styles
const style = document.createElement("style")
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
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
            transform: translateX(400px);
            opacity: 0;
        }
    }
`
document.head.appendChild(style)

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", init)

// Check for overdue tasks and show reminders
function checkReminders() {
  const now = new Date()
  tasks.forEach((task) => {
    if (!task.completed) {
      const dueDate = new Date(task.date + " " + task.time)
      const timeDiff = dueDate - now
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      // Show reminder if task is due within 1 hour
      if (hoursDiff > 0 && hoursDiff <= 1 && !task.reminderShown) {
        showNotification(`⏰ Reminder: "${task.title}" is due soon!`)
        task.reminderShown = true
        saveTasks()
      }
    }
  })
}

// Check reminders every minute
setInterval(checkReminders, 60000)
