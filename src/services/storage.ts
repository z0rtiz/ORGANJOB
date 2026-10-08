import { AppData, Client, Project, TaskItem, TimeLog, PomodoroSettings } from '../types';

const STORAGE_KEY = 'organjob_app_data_v1';

export const defaultPomodoroSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  soundVolume: 0.8,
};

const initialSampleData: AppData = {
  clients: [
    {
      id: 'client-1',
      name: 'Innovatech SpA',
      company: 'Innovatech Soluciones Digitales',
      email: 'contacto@innovatech.cl',
      phone: '+56 9 8765 4321',
      color: '#0078D4', // Fluent Blue
      notes: 'Cliente de desarrollo de software y consultoría tecnológica.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'client-2',
      name: 'Grupo Alianza Retail',
      company: 'Alianza Retail S.A.',
      email: 'proyectos@alianzaretail.com',
      color: '#107C41', // Fluent Green
      notes: 'Plataforma de comercio electrónico e integraciones.',
      createdAt: new Date().toISOString(),
    },
  ],
  projects: [
    {
      id: 'proj-1',
      clientId: 'client-1',
      name: 'Rediseño Portal Clientes',
      description: 'Implementación de nueva arquitectura frontend y panel interactivo con métricas.',
      color: '#0078D4',
      status: 'active',
      priority: 'high',
      budgetHours: 40,
      deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'proj-2',
      clientId: 'client-2',
      name: 'Integración Pasarela de Pagos',
      description: 'Conexión con Webpay Plus y verificación automática de transacciones.',
      color: '#107C41',
      status: 'active',
      priority: 'medium',
      budgetHours: 25,
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'proj-3',
      name: 'Investigación & Desarrollo Interno',
      description: 'Automatizaciones internas, scripts de productividad y aprendizaje de nuevas librerías.',
      color: '#8764B8', // Fluent Purple
      status: 'active',
      priority: 'low',
      budgetHours: 15,
      createdAt: new Date().toISOString(),
    },
  ],
  tasks: [
    {
      id: 'task-1',
      projectId: 'proj-1',
      title: 'Diseñar wireframes del dashboard principal',
      description: 'Definir disposición de widgets, métricas y navegación principal.',
      completed: true,
      priority: 'high',
      dueDate: new Date().toISOString().split('T')[0],
      estimatedMinutes: 120,
      spentSeconds: 7200,
      checklist: [
        { id: 'c1', text: 'Boceto en papel / pizarra', done: true },
        { id: 'c2', text: 'Estructura en Figma', done: true },
        { id: 'c3', text: 'Revisión y aprobación', done: true },
      ],
      tags: ['Diseño', 'UI/UX'],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      completedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      projectId: 'proj-1',
      title: 'Implementar autenticación y permisos de usuario',
      description: 'Integrar tokens JWT, almacenamiento seguro y middleware de verificación.',
      completed: false,
      priority: 'high',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      estimatedMinutes: 180,
      spentSeconds: 3000,
      checklist: [
        { id: 'c4', text: 'Configurar endpoints de login y refresh', done: true },
        { id: 'c5', text: 'Proteger rutas privadas en frontend', done: false },
        { id: 'c6', text: 'Pruebas de expiración de sesión', done: false },
      ],
      tags: ['Backend', 'Seguridad'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      projectId: 'proj-2',
      title: 'Configurar ambiente de pruebas Webpay Sandbox',
      description: 'Obtener certificados de prueba y validar respuesta de confirmación.',
      completed: false,
      priority: 'medium',
      dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      estimatedMinutes: 90,
      spentSeconds: 1500,
      checklist: [
        { id: 'c7', text: 'Instalar SDK oficial', done: true },
        { id: 'c8', text: 'Simular pago exitoso y rechazado', done: false },
      ],
      tags: ['Integración', 'Pagos'],
      createdAt: new Date().toISOString(),
    },
  ],
  timeLogs: [
    {
      id: 'log-1',
      taskId: 'task-1',
      projectId: 'proj-1',
      durationSeconds: 1500, // 25 min
      startedAt: new Date(Date.now() - 86400000).toISOString(),
      endedAt: new Date(Date.now() - 86400000 + 1500000).toISOString(),
      type: 'pomodoro',
      notes: 'Sesión de bocetos iniciales',
    },
    {
      id: 'log-2',
      taskId: 'task-2',
      projectId: 'proj-1',
      durationSeconds: 1500,
      startedAt: new Date().toISOString(),
      endedAt: new Date(Date.now() + 1500000).toISOString(),
      type: 'pomodoro',
      notes: 'Configuración de endpoints',
    },
  ],
  pomodoroSettings: defaultPomodoroSettings,
  theme: 'dark',
};

export const reconcileTaskTimeLogs = (data: AppData): AppData => {
  const existingLogs = [...data.timeLogs];
  let hasNewLogs = false;

  data.tasks.forEach((task) => {
    if (task.spentSeconds && task.spentSeconds > 0) {
      const loggedSeconds = existingLogs
        .filter((l) => l.taskId === task.id)
        .reduce((sum, l) => sum + l.durationSeconds, 0);

      const unloggedSeconds = task.spentSeconds - loggedSeconds;
      if (unloggedSeconds > 10) {
        // Create reconciling log so statistics reflect all spent time immediately
        const taskDate = task.completedAt || task.dueDate || task.createdAt || new Date().toISOString();
        const newLog: TimeLog = {
          id: `log-sync-${task.id}-${Date.now()}`,
          taskId: task.id,
          projectId: task.projectId,
          durationSeconds: unloggedSeconds,
          startedAt: taskDate,
          endedAt: new Date(new Date(taskDate).getTime() + unloggedSeconds * 1000).toISOString(),
          type: 'manual',
          notes: `Tiempo trabajado en: ${task.title}`,
        };
        existingLogs.unshift(newLog);
        hasNewLogs = true;
      }
    }
  });

  if (hasNewLogs) {
    const updated = { ...data, timeLogs: existingLogs };
    saveAppData(updated);
    return updated;
  }
  return data;
};

export const loadAppData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppData(initialSampleData);
      return initialSampleData;
    }
    const parsed = JSON.parse(raw);
    const loadedData: AppData = {
      clients: parsed.clients || [],
      projects: parsed.projects || [],
      tasks: parsed.tasks || [],
      timeLogs: parsed.timeLogs || [],
      pomodoroSettings: { ...defaultPomodoroSettings, ...(parsed.pomodoroSettings || {}) },
      theme: parsed.theme || 'dark',
    };
    return reconcileTaskTimeLogs(loadedData);
  } catch (error) {
    console.error('Error loading data from localStorage, using defaults', error);
    return initialSampleData;
  }
};

export const saveAppData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to localStorage', error);
  }
};

export const exportDataAsJSON = (data: AppData): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `organjob-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportTimeLogsCSV = (data: AppData): void => {
  const headers = ['Fecha', 'Cliente', 'Proyecto', 'Tarea', 'Tipo', 'Duración (minutos)', 'Horas (decimal)', 'Notas'];
  
  const clientMap = new Map(data.clients.map(c => [c.id, c.name]));
  const projectMap = new Map(data.projects.map(p => [p.id, p]));
  const taskMap = new Map(data.tasks.map(t => [t.id, t.title]));

  const rows = data.timeLogs.map(log => {
    const proj = projectMap.get(log.projectId);
    const clientName = proj?.clientId ? clientMap.get(proj.clientId) || 'Sin Cliente' : 'Interno';
    const projName = proj?.name || 'Proyecto Desconocido';
    const taskTitle = taskMap.get(log.taskId) || 'Tarea Desconocida';
    const minutes = Math.round(log.durationSeconds / 60);
    const hours = (log.durationSeconds / 3600).toFixed(2);
    const date = new Date(log.startedAt).toLocaleDateString();
    
    return [
      `"${date}"`,
      `"${clientName.replace(/"/g, '""')}"`,
      `"${projName.replace(/"/g, '""')}"`,
      `"${taskTitle.replace(/"/g, '""')}"`,
      `"${log.type}"`,
      minutes,
      hours,
      `"${(log.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `organjob-registro-horas-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
