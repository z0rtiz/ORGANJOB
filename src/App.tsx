import React, { useState, useEffect, useRef } from 'react';
import { AppData, TaskItem, Project, Client, PomodoroMode, PomodoroSettings, TimeLog } from './types';
import { loadAppData, saveAppData, defaultPomodoroSettings } from './services/storage';
import { playNotificationSound, requestDesktopNotification } from './utils/audio';
import confetti from 'canvas-confetti';

import { TitleBar } from './components/TitleBar';
import { Sidebar, NavView } from './components/Sidebar';
import { TasksView } from './components/TasksView';
import { ProjectsView } from './components/ProjectsView';
import { ClientsView } from './components/ClientsView';
import { PomodoroTimer } from './components/PomodoroTimer';
import { StatsView } from './components/StatsView';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [currentView, setCurrentView] = useState<NavView>('tasks-today');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  // Pomodoro runtime state
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>('work');
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState<number>(() => data.pomodoroSettings.workDuration * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState<boolean>(false);
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>();
  const [completedPomodorosToday, setCompletedPomodorosToday] = useState<number>(0);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  // Ref to track accumulated seconds for current active session
  const sessionSecondsRef = useRef(0);

  // Save changes to localStorage whenever data changes
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', data.theme);
  }, [data.theme]);

  // Sync initial pomodoros count for today
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const count = data.timeLogs.filter(
      l => l.type === 'pomodoro' && l.startedAt.startsWith(todayStr)
    ).length;
    setCompletedPomodorosToday(count);
  }, [data.timeLogs]);

  // Global Pomodoro Timer Interval Engine
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isPomodoroRunning) {
      interval = setInterval(() => {
        setPomodoroTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer Finished!
            handleTimerComplete();
            return 0;
          }

          // If working on active task, increment task spentSeconds
          if (pomodoroMode === 'work' && activeTaskId) {
            sessionSecondsRef.current += 1;
            setData((prevData) => ({
              ...prevData,
              tasks: prevData.tasks.map((t) =>
                t.id === activeTaskId ? { ...t, spentSeconds: (t.spentSeconds || 0) + 1 } : t
              ),
            }));
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPomodoroRunning, pomodoroMode, activeTaskId, data.pomodoroSettings]);

  const handleTimerComplete = () => {
    setIsPomodoroRunning(false);

    if (data.pomodoroSettings.soundEnabled) {
      playNotificationSound('bell', data.pomodoroSettings.soundVolume);
    }

    if (pomodoroMode === 'work') {
      // Completed work session
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      requestDesktopNotification(
        '¡Pomodoro Completado! 🍅',
        'Excelente trabajo. Tómate unos minutos de descanso.'
      );

      // Create TimeLog
      const activeTask = data.tasks.find((t) => t.id === activeTaskId);
      const newLog: TimeLog = {
        id: `log-${Date.now()}`,
        taskId: activeTaskId || 'unassigned',
        projectId: activeTask?.projectId || (data.projects[0]?.id ?? 'internal'),
        durationSeconds: data.pomodoroSettings.workDuration * 60,
        startedAt: new Date(Date.now() - data.pomodoroSettings.workDuration * 60000).toISOString(),
        endedAt: new Date().toISOString(),
        type: 'pomodoro',
        notes: activeTask ? `Pomodoro en: ${activeTask.title}` : 'Sesión de enfoque general',
      };

      setData((prev) => ({
        ...prev,
        timeLogs: [newLog, ...prev.timeLogs],
      }));

      const newCount = completedPomodorosToday + 1;
      setCompletedPomodorosToday(newCount);

      // Decide next break: Short or Long
      if (newCount % data.pomodoroSettings.longBreakInterval === 0) {
        setPomodoroMode('longBreak');
        setPomodoroTimeLeft(data.pomodoroSettings.longBreakDuration * 60);
      } else {
        setPomodoroMode('shortBreak');
        setPomodoroTimeLeft(data.pomodoroSettings.shortBreakDuration * 60);
      }
    } else {
      // Completed break
      requestDesktopNotification(
        '¡Descanso terminado! ⚡',
        '¿Listo para una nueva sesión de enfoque?'
      );
      setPomodoroMode('work');
      setPomodoroTimeLeft(data.pomodoroSettings.workDuration * 60);
    }
  };

  const handleTogglePomodoro = () => {
    setIsPomodoroRunning((prev) => !prev);
  };

  const handleResetPomodoro = () => {
    setIsPomodoroRunning(false);
    switch (pomodoroMode) {
      case 'work':
        setPomodoroTimeLeft(data.pomodoroSettings.workDuration * 60);
        break;
      case 'shortBreak':
        setPomodoroTimeLeft(data.pomodoroSettings.shortBreakDuration * 60);
        break;
      case 'longBreak':
        setPomodoroTimeLeft(data.pomodoroSettings.longBreakDuration * 60);
        break;
    }
  };

  const handleSwitchPomodoroMode = (mode: PomodoroMode) => {
    setIsPomodoroRunning(false);
    setPomodoroMode(mode);
    switch (mode) {
      case 'work':
        setPomodoroTimeLeft(data.pomodoroSettings.workDuration * 60);
        break;
      case 'shortBreak':
        setPomodoroTimeLeft(data.pomodoroSettings.shortBreakDuration * 60);
        break;
      case 'longBreak':
        setPomodoroTimeLeft(data.pomodoroSettings.longBreakDuration * 60);
        break;
    }
  };

  const handleStartPomodoroForTask = (taskId: string) => {
    setActiveTaskId(taskId);
    setPomodoroMode('work');
    setPomodoroTimeLeft(data.pomodoroSettings.workDuration * 60);
    setIsPomodoroRunning(true);
    setCurrentView('pomodoro');
  };

  // Task actions
  const handleToggleTask = (taskId: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      }),
    }));
  };

  const handleAddTask = (taskData: Omit<TaskItem, 'id' | 'createdAt' | 'spentSeconds'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}`,
      spentSeconds: 0,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  const handleUpdateTask = (task: TaskItem) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === task.id ? task : t)),
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    if (activeTaskId === taskId) {
      setActiveTaskId(undefined);
    }
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
      timeLogs: prev.timeLogs.filter((l) => l.taskId !== taskId),
    }));
  };

  // Project actions
  const handleAddProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  };

  const handleUpdateProject = (project: Project) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === project.id ? project : p)),
    }));
  };

  const handleDeleteProject = (projectId: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== projectId),
      tasks: prev.tasks.filter((t) => t.projectId !== projectId),
      timeLogs: prev.timeLogs.filter((l) => l.projectId !== projectId),
    }));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(undefined);
    }
  };

  // Client actions
  const handleAddClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      clients: [...prev.clients, newClient],
    }));
  };

  const handleUpdateClient = (client: Client) => {
    setData((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => (c.id === client.id ? client : c)),
    }));
  };

  const handleDeleteClient = (clientId: string) => {
    setData((prev) => ({
      ...prev,
      clients: prev.clients.filter((c) => c.id !== clientId),
      projects: prev.projects.map((p) => (p.clientId === clientId ? { ...p, clientId: undefined } : p)),
    }));
    if (selectedClientId === clientId) {
      setSelectedClientId(undefined);
    }
  };

  const activeTask = data.tasks.find((t) => t.id === activeTaskId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Windows 11 TitleBar */}
      <TitleBar
        theme={data.theme === 'light' ? 'light' : 'dark'}
        onToggleTheme={() =>
          setData((prev) => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark',
          }))
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTask={activeTask}
        pomodoroState={{
          isRunning: isPomodoroRunning,
          timeLeft: pomodoroTimeLeft,
          mode: pomodoroMode,
          onToggle: handleTogglePomodoro,
          onOpenPomodoro: () => setCurrentView('pomodoro'),
        }}
      />

      {/* Main Container: Sidebar + Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          selectedClientId={selectedClientId}
          onSelectClient={setSelectedClientId}
          projects={data.projects}
          clients={data.clients}
          tasks={data.tasks}
          onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
          onOpenNewClientModal={() => setIsNewClientModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsOpen(true)}
        />

        <main style={{ flex: 1, background: 'var(--bg-app)', overflow: 'hidden', position: 'relative' }}>
          {(currentView === 'tasks-all' || currentView === 'tasks-today') && (
            <TasksView
              tasks={data.tasks}
              projects={data.projects}
              clients={data.clients}
              activeTaskId={activeTaskId}
              selectedProjectId={selectedProjectId}
              selectedClientId={selectedClientId}
              searchQuery={searchQuery}
              viewFilter={currentView === 'tasks-today' ? 'today' : 'all'}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onStartPomodoroForTask={handleStartPomodoroForTask}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              projects={data.projects}
              clients={data.clients}
              tasks={data.tasks}
              onSelectProject={(projId) => {
                setSelectedProjectId(projId);
                setCurrentView('tasks-all');
              }}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              isCreateModalOpen={isNewProjectModalOpen}
              setIsCreateModalOpen={setIsNewProjectModalOpen}
            />
          )}

          {currentView === 'clients' && (
            <ClientsView
              clients={data.clients}
              projects={data.projects}
              tasks={data.tasks}
              onSelectClient={(cliId) => {
                setSelectedClientId(cliId);
                setCurrentView('tasks-all');
              }}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              isCreateModalOpen={isNewClientModalOpen}
              setIsCreateModalOpen={setIsNewClientModalOpen}
            />
          )}

          {currentView === 'pomodoro' && (
            <div style={{ height: '100%', overflowY: 'auto' }}>
              <PomodoroTimer
                mode={pomodoroMode}
                timeLeft={pomodoroTimeLeft}
                isRunning={isPomodoroRunning}
                onToggle={handleTogglePomodoro}
                onReset={handleResetPomodoro}
                onSwitchMode={handleSwitchPomodoroMode}
                settings={data.pomodoroSettings}
                activeTaskId={activeTaskId}
                onSelectActiveTask={setActiveTaskId}
                tasks={data.tasks}
                projects={data.projects}
                completedPomodorosCount={completedPomodorosToday}
                onSessionComplete={(dur, tId) => {}}
              />
            </div>
          )}

          {currentView === 'stats' && <StatsView data={data} />}
        </main>
      </div>

      {/* Global Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={data.pomodoroSettings}
        onSaveSettings={(newSettings) =>
          setData((prev) => ({
            ...prev,
            pomodoroSettings: newSettings,
          }))
        }
        appData={data}
        onImportData={(imported) => setData(imported)}
        onResetData={() => {
          localStorage.clear();
          setData(loadAppData());
        }}
      />
    </div>
  );
};

export default App;
