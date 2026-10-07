import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, Flame, Volume2, VolumeX, ListTodo } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PomodoroMode, PomodoroSettings, TaskItem, Project } from '../types';
import { playNotificationSound, requestDesktopNotification } from '../utils/audio';

interface PomodoroTimerProps {
  mode: PomodoroMode;
  timeLeft: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSwitchMode: (mode: PomodoroMode) => void;
  settings: PomodoroSettings;
  activeTaskId?: string;
  onSelectActiveTask: (taskId?: string) => void;
  tasks: TaskItem[];
  projects: Project[];
  completedPomodorosCount: number;
  onSessionComplete: (durationSeconds: number, taskId?: string) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  mode,
  timeLeft,
  isRunning,
  onToggle,
  onReset,
  onSwitchMode,
  settings,
  activeTaskId,
  onSelectActiveTask,
  tasks,
  projects,
  completedPomodorosCount,
}) => {
  const [soundMuted, setSoundMuted] = useState(!settings.soundEnabled);

  // Total duration in seconds for current mode
  const getTotalSeconds = () => {
    switch (mode) {
      case 'work':
        return settings.workDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
    }
  };

  const totalSeconds = getTotalSeconds();
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));

  // Format mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const activeTask = tasks.find(t => t.id === activeTaskId);
  const activeProject = activeTask ? projects.find(p => p.id === activeTask.projectId) : undefined;

  // Visual mode properties
  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return '#0078D4'; // Fluent Focus Blue
      case 'shortBreak':
        return '#107C41'; // Fluent Rest Green
      case 'longBreak':
        return '#8764B8'; // Fluent Deep Rest Purple
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'work':
        return 'Enfoque & Trabajo';
      case 'shortBreak':
        return 'Descanso Corto';
      case 'longBreak':
        return 'Descanso Largo';
    }
  };

  // Keyboard shortcut: Space to toggle play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  return (
    <div style={{
      maxWidth: '650px',
      margin: '0 auto',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Mode Switcher Tabs */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-surface-elevated)',
        padding: '4px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '28px',
        gap: '4px',
      }}>
        <button
          onClick={() => onSwitchMode('work')}
          style={{
            padding: '8px 20px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            background: mode === 'work' ? 'var(--accent-primary)' : 'transparent',
            color: mode === 'work' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          Pomodoro ({settings.workDuration}m)
        </button>
        <button
          onClick={() => onSwitchMode('shortBreak')}
          style={{
            padding: '8px 20px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            background: mode === 'shortBreak' ? 'var(--color-success)' : 'transparent',
            color: mode === 'shortBreak' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          Descanso Corto ({settings.shortBreakDuration}m)
        </button>
        <button
          onClick={() => onSwitchMode('longBreak')}
          style={{
            padding: '8px 20px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            background: mode === 'longBreak' ? 'var(--color-purple)' : 'transparent',
            color: mode === 'longBreak' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          Descanso Largo ({settings.longBreakDuration}m)
        </button>
      </div>

      {/* Main SVG Circular Progress Timer */}
      <div style={{
        position: 'relative',
        width: '280px',
        height: '280px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle track */}
          <circle
            cx="140"
            cy="140"
            r="120"
            stroke="var(--border-subtle)"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Dynamic Progress Circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            stroke={getModeColor()}
            strokeWidth="10"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progressPercent / 100)}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease',
            }}
          />
        </svg>

        {/* Center Timer Display */}
        <div style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: getModeColor(),
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '4px',
          }}>
            {getModeTitle()}
          </span>
          <h1 style={{
            fontSize: '3.6rem',
            fontWeight: 700,
            fontFamily: 'monospace',
            letterSpacing: '-2px',
            color: 'var(--text-primary)',
            lineHeight: 1,
            margin: '4px 0',
          }}>
            {timeFormatted}
          </h1>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            {isRunning ? 'Presiona Espacio para pausar' : 'Presiona Espacio para iniciar'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <button
          onClick={onReset}
          className="fluent-btn fluent-btn-secondary"
          style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}
          title="Reiniciar temporizador"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={onToggle}
          className="fluent-btn fluent-btn-primary"
          style={{
            padding: '12px 32px',
            borderRadius: 'var(--radius-full)',
            fontSize: '1.1rem',
            background: getModeColor(),
            boxShadow: `0 4px 18px ${getModeColor()}44`,
          }}
        >
          {isRunning ? (
            <>
              <Pause size={20} />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play size={20} />
              <span>Comenzar</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            if (mode === 'work') onSwitchMode('shortBreak');
            else onSwitchMode('work');
          }}
          className="fluent-btn fluent-btn-secondary"
          style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}
          title="Saltar al siguiente ciclo"
        >
          <SkipForward size={18} />
        </button>

        <button
          onClick={() => setSoundMuted(!soundMuted)}
          className="fluent-btn-ghost"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
          }}
          title={soundMuted ? 'Activar sonido' : 'Silenciar sonido'}
        >
          {soundMuted ? <VolumeX size={18} color="var(--text-tertiary)" /> : <Volume2 size={18} color="var(--accent-primary)" />}
        </button>
      </div>

      {/* Active Task Card Selector */}
      <div className="glass-panel" style={{ width: '100%', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ListTodo size={17} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Tarea Vinculada al Pomodoro:
            </span>
          </div>
          {activeTask && (
            <button
              onClick={() => onSelectActiveTask(undefined)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Desvincular
            </button>
          )}
        </div>

        {activeTask ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            borderLeft: `4px solid ${activeProject ? activeProject.color : 'var(--accent-primary)'}`,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {activeTask.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {activeProject ? activeProject.name : 'Sin Proyecto'} • Tiempo registrado:{' '}
                {Math.round(activeTask.spentSeconds / 60)} min
              </div>
            </div>
            <span className={`badge badge-${activeTask.priority}`}>
              {activeTask.priority}
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value=""
              onChange={(e) => onSelectActiveTask(e.target.value || undefined)}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              <option value="">Selecciona una tarea para registrar el tiempo invertido...</option>
              {tasks.filter(t => !t.completed).map(task => {
                const proj = projects.find(p => p.id === task.projectId);
                return (
                  <option key={task.id} value={task.id}>
                    {task.title} ({proj ? proj.name : 'Sin Proyecto'})
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* Daily streak & session stats badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '12px 24px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={18} style={{ color: '#FF8C00' }} />
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Pomodoros Hoy</span>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{completedPomodorosCount}</div>
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Tiempo de Enfoque</span>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              {(completedPomodorosCount * (settings.workDuration / 60)).toFixed(1)} hrs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
