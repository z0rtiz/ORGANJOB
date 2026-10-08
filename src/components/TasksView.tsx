import React, { useState } from 'react';
import {
  Check,
  Plus,
  Calendar,
  Clock,
  Play,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  AlertCircle,
  Tag,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TaskItem, Project, Client, Priority } from '../types';

interface TasksViewProps {
  tasks: TaskItem[];
  projects: Project[];
  clients: Client[];
  activeTaskId?: string;
  selectedProjectId?: string;
  selectedClientId?: string;
  searchQuery: string;
  viewFilter: 'all' | 'today';
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'spentSeconds'>) => void;
  onUpdateTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onStartPomodoroForTask: (taskId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  projects,
  clients,
  activeTaskId,
  selectedProjectId,
  selectedClientId,
  searchQuery,
  viewFilter,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onStartPomodoroForTask,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickProjectId, setQuickProjectId] = useState<string>(selectedProjectId || (projects[0]?.id ?? ''));
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [newChecklistText, setNewChecklistText] = useState('');

  // Keep quickProjectId in sync if selectedProjectId changes
  React.useEffect(() => {
    if (selectedProjectId) {
      setQuickProjectId(selectedProjectId);
    } else if (projects.length > 0 && !quickProjectId) {
      setQuickProjectId(projects[0].id);
    }
  }, [selectedProjectId, projects, quickProjectId]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering logic
  const filteredTasks = tasks.filter(t => {
    // Project filter
    if (selectedProjectId && t.projectId !== selectedProjectId) return false;

    // Client filter
    if (selectedClientId) {
      const proj = projects.find(p => p.id === t.projectId);
      if (!proj || proj.clientId !== selectedClientId) return false;
    }

    // View filter (today vs all)
    if (viewFilter === 'today' && t.dueDate !== todayStr) return false;

    // Status filter
    if (statusFilter === 'pending' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;

    // Priority filter
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const proj = projects.find(p => p.id === t.projectId);
      const matchesTitle = t.title.toLowerCase().includes(q);
      const matchesDesc = (t.description || '').toLowerCase().includes(q);
      const matchesProj = proj ? proj.name.toLowerCase().includes(q) : false;
      const matchesTags = t.tags.some(tag => tag.toLowerCase().includes(q));
      if (!matchesTitle && !matchesDesc && !matchesProj && !matchesTags) return false;
    }

    return true;
  });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const targetProject = quickProjectId || projects[0]?.id;
    if (!targetProject) {
      alert('Debes crear un proyecto antes de añadir tareas.');
      return;
    }

    onAddTask({
      projectId: targetProject,
      title: quickTitle.trim(),
      completed: false,
      priority: 'medium',
      dueDate: viewFilter === 'today' ? todayStr : undefined,
      checklist: [],
      tags: [],
    });

    setQuickTitle('');
  };

  const handleToggle = (task: TaskItem) => {
    onToggleTask(task.id);
    if (!task.completed) {
      // Fire confetti when completing a task
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0078D4', '#107C41', '#FFB900'],
      });
    }
  };

  // Title info for headers
  const getContextTitle = () => {
    if (selectedProjectId) {
      const proj = projects.find(p => p.id === selectedProjectId);
      return proj ? `Proyecto: ${proj.name}` : 'Proyecto';
    }
    if (selectedClientId) {
      const cl = clients.find(c => c.id === selectedClientId);
      return cl ? `Cliente: ${cl.name}` : 'Cliente';
    }
    return viewFilter === 'today' ? 'Mi Día' : 'Todas las Tareas';
  };

  const formatSpentTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) return `${hrs}h ${remMins}m`;
    return `${mins}m`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '24px 32px',
      overflowY: 'auto',
    }}>
      {/* View Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            {getContextTitle()}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea encontrada' : 'tareas encontradas'}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            background: 'var(--bg-surface-elevated)',
            padding: '2px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <button
              onClick={() => setStatusFilter('pending')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: statusFilter === 'pending' ? 'var(--accent-primary)' : 'transparent',
                color: statusFilter === 'pending' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              Pendientes
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: statusFilter === 'completed' ? 'var(--accent-primary)' : 'transparent',
                color: statusFilter === 'completed' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              Completadas
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: statusFilter === 'all' ? 'var(--accent-primary)' : 'transparent',
                color: statusFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              Todas
            </button>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ fontSize: '0.8rem', padding: '5px 8px', height: '30px' }}
          >
            <option value="all">Todas las prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>
      </div>

      {/* Quick Add Task Input Card */}
      <form
        onSubmit={handleQuickAdd}
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          marginBottom: '20px',
        }}
      >
        <Plus size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Agregar una nueva tarea... (Presiona Enter para guardar)"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: 0,
            fontSize: '0.95rem',
            boxShadow: 'none',
          }}
        />

        {!selectedProjectId && projects.length > 0 && (
          <select
            value={quickProjectId}
            onChange={(e) => setQuickProjectId(e.target.value)}
            style={{
              fontSize: '0.8rem',
              padding: '4px 8px',
              maxWidth: '180px',
              height: '32px',
              flexShrink: 0,
            }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}

        <button
          type="submit"
          className="fluent-btn fluent-btn-primary"
          style={{ padding: '6px 14px', fontSize: '0.82rem', height: '32px' }}
          disabled={!quickTitle.trim()}
        >
          Agregar
        </button>
      </form>

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 16px',
            color: 'var(--text-tertiary)',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-subtle)',
          }}>
            <CheckSquare size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ fontWeight: 500, fontSize: '1rem', color: 'var(--text-secondary)' }}>
              No hay tareas en esta vista
            </p>
            <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              Agrega una tarea arriba o ajusta los filtros seleccionados.
            </p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const project = projects.find(p => p.id === task.projectId);
            const client = project?.clientId ? clients.find(c => c.id === project.clientId) : undefined;
            const isPomodoroActive = activeTaskId === task.id;
            const completedSubtasks = task.checklist.filter(c => c.done).length;
            const totalSubtasks = task.checklist.length;

            return (
              <div
                key={task.id}
                className="glass-panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  opacity: task.completed ? 0.6 : 1,
                  borderLeft: `4px solid ${project ? project.color : 'var(--border-subtle)'}`,
                  background: isPomodoroActive ? 'rgba(0, 120, 212, 0.08)' : undefined,
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Left section: checkbox & info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <button
                    onClick={() => handleToggle(task)}
                    style={{
                      background: task.completed ? 'var(--color-success)' : 'transparent',
                      border: `2px solid ${task.completed ? 'var(--color-success)' : 'var(--text-tertiary)'}`,
                      width: '20px',
                      height: '20px',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {task.completed && <Check size={14} color="#ffffff" strokeWidth={3} />}
                  </button>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {task.title}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '0.76rem',
                      color: 'var(--text-secondary)',
                      marginTop: '4px',
                      flexWrap: 'wrap',
                    }}>
                      {/* Project badge */}
                      {project && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: project.color }} />
                          <span style={{ fontWeight: 500 }}>{project.name}</span>
                          {client && <span style={{ color: 'var(--text-tertiary)' }}>({client.name})</span>}
                        </span>
                      )}

                      {/* Due date */}
                      {task.dueDate && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: task.dueDate < todayStr && !task.completed ? '#ff6877' : 'inherit',
                        }}>
                          <Calendar size={12} />
                          <span>{task.dueDate}</span>
                        </span>
                      )}

                      {/* Time spent */}
                      {task.spentSeconds > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)' }}>
                          <Clock size={12} />
                          <span>{formatSpentTime(task.spentSeconds)}</span>
                          {task.estimatedMinutes && (
                            <span style={{ color: 'var(--text-tertiary)' }}>
                              / {Math.round(task.estimatedMinutes / 60)}h est.
                            </span>
                          )}
                        </span>
                      )}

                      {/* Checklist count */}
                      {totalSubtasks > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckSquare size={12} />
                          <span>{completedSubtasks}/{totalSubtasks} subtareas</span>
                        </span>
                      )}

                      {/* Priority */}
                      <span className={`badge badge-${task.priority}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px', flexShrink: 0 }}>
                  {!task.completed && (
                    <button
                      onClick={() => onStartPomodoroForTask(task.id)}
                      className="fluent-btn fluent-btn-secondary"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        height: '28px',
                        background: isPomodoroActive ? 'var(--accent-primary)' : undefined,
                        color: isPomodoroActive ? '#ffffff' : undefined,
                        border: isPomodoroActive ? 'none' : undefined,
                      }}
                      title="Comenzar Pomodoro en esta tarea"
                    >
                      <Play size={12} />
                      <span>{isPomodoroActive ? 'Activo' : 'Pomodoro'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setEditingTask(task)}
                    className="fluent-btn-ghost"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                    }}
                    title="Editar Tarea"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar la tarea "${task.title}"?`)) {
                        onDeleteTask(task.id);
                      }
                    }}
                    className="fluent-btn-ghost"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-tertiary)',
                    }}
                    title="Eliminar Tarea"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-backdrop" onClick={() => setEditingTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Editar Tarea</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="fluent-btn-ghost"
                style={{ border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '2px 8px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Título
                </label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Descripción / Notas
                </label>
                <textarea
                  rows={3}
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Detalles sobre lo que se necesita hacer..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Proyecto
                  </label>
                  <select
                    value={editingTask.projectId}
                    onChange={(e) => setEditingTask({ ...editingTask, projectId: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Prioridad
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                    style={{ width: '100%' }}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={editingTask.dueDate || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Estimación (Minutos)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="15"
                    value={editingTask.estimatedMinutes || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, estimatedMinutes: Number(e.target.value) || undefined })}
                    style={{ width: '100%' }}
                    placeholder="ej: 120"
                  />
                </div>
              </div>

              {/* Spent time adjustment */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Tiempo Real Registrado en esta Tarea
                  </label>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {formatSpentTime(editingTask.spentSeconds || 0)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setEditingTask({ ...editingTask, spentSeconds: (editingTask.spentSeconds || 0) + 15 * 60 })}
                    className="fluent-btn fluent-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    +15 min
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTask({ ...editingTask, spentSeconds: (editingTask.spentSeconds || 0) + 30 * 60 })}
                    className="fluent-btn fluent-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    +30 min
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTask({ ...editingTask, spentSeconds: (editingTask.spentSeconds || 0) + 60 * 60 })}
                    className="fluent-btn fluent-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    +1 hora
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const mins = prompt('Ingresa los minutos totales trabajados en esta tarea:', String(Math.round((editingTask.spentSeconds || 0) / 60)));
                      if (mins !== null) {
                        const val = Math.max(0, Number(mins) || 0);
                        setEditingTask({ ...editingTask, spentSeconds: val * 60 });
                      }
                    }}
                    className="fluent-btn fluent-btn-ghost"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', textDecoration: 'underline' }}
                  >
                    Ajustar minutos
                  </button>
                </div>
              </div>

              {/* Subtasks / Checklist */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Subtareas / Checklist
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                  {editingTask.checklist.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingTask.checklist.map(c => c.id === item.id ? { ...c, done: !c.done } : c);
                          setEditingTask({ ...editingTask, checklist: updated });
                        }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        {item.done ? <CheckSquare size={16} color="var(--color-success)" /> : <Square size={16} color="var(--text-tertiary)" />}
                      </button>
                      <span style={{
                        fontSize: '0.85rem',
                        flex: 1,
                        textDecoration: item.done ? 'line-through' : 'none',
                        color: item.done ? 'var(--text-tertiary)' : 'var(--text-primary)',
                      }}>
                        {item.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingTask.checklist.filter(c => c.id !== item.id);
                          setEditingTask({ ...editingTask, checklist: updated });
                        }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Agregar un item a la lista..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newChecklistText.trim()) {
                          const newItem = { id: `chk-${Date.now()}`, text: newChecklistText.trim(), done: false };
                          setEditingTask({ ...editingTask, checklist: [...editingTask.checklist, newItem] });
                          setNewChecklistText('');
                        }
                      }
                    }}
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newChecklistText.trim()) {
                        const newItem = { id: `chk-${Date.now()}`, text: newChecklistText.trim(), done: false };
                        setEditingTask({ ...editingTask, checklist: [...editingTask.checklist, newItem] });
                        setNewChecklistText('');
                      }
                    }}
                    className="fluent-btn fluent-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>

            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
            }}>
              <button
                onClick={() => setEditingTask(null)}
                className="fluent-btn fluent-btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onUpdateTask(editingTask);
                  setEditingTask(null);
                }}
                className="fluent-btn fluent-btn-primary"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
