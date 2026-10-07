import React from 'react';
import { Sparkles, Moon, Sun, Search, Play, Pause, Clock } from 'lucide-react';
import { TaskItem, PomodoroMode } from '../types';

interface TitleBarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTask?: TaskItem;
  pomodoroState: {
    isRunning: boolean;
    timeLeft: number;
    mode: PomodoroMode;
    onToggle: () => void;
    onOpenPomodoro: () => void;
  };
}

export const TitleBar: React.FC<TitleBarProps> = ({
  theme,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  activeTask,
  pomodoroState,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header style={{
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      background: 'var(--bg-sidebar)',
      borderBottom: '1px solid var(--border-subtle)',
      WebkitAppRegion: 'drag',
      zIndex: 100,
    } as React.CSSProperties}>
      {/* Brand logo & name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        WebkitAppRegion: 'no-drag',
      } as React.CSSProperties}>
        <img
          src="./icon.png"
          alt="OrganJob Logo"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            objectFit: 'cover',
            boxShadow: '0 2px 8px rgba(0, 120, 212, 0.4)',
          }}
        />
        <div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.3px' }}>OrganJob</span>
          <span style={{
            marginLeft: '6px',
            fontSize: '0.7rem',
            padding: '1px 6px',
            borderRadius: '4px',
            background: 'var(--accent-light)',
            color: 'var(--accent-primary)',
            fontWeight: 600,
          }}>PRO</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '320px',
        position: 'relative',
        WebkitAppRegion: 'no-drag',
      } as React.CSSProperties}>
        <Search size={15} style={{ position: 'absolute', left: '10px', color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          placeholder="Buscar tareas, proyectos, clientes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: '32px',
            paddingRight: '12px',
            fontSize: '0.85rem',
            height: '32px',
            borderRadius: 'var(--radius-full)',
          }}
        />
      </div>

      {/* Quick Pomodoro Pill & Theme Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        WebkitAppRegion: 'no-drag',
      } as React.CSSProperties}>
        {/* Quick Pomodoro bar widget */}
        <div
          onClick={pomodoroState.onOpenPomodoro}
          title="Abrir Pomodoro"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: pomodoroState.isRunning
              ? 'rgba(0, 120, 212, 0.15)'
              : 'var(--bg-surface-elevated)',
            border: `1px solid ${pomodoroState.isRunning ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Clock size={15} style={{ color: pomodoroState.isRunning ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
          <span style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.88rem',
            color: pomodoroState.isRunning ? 'var(--accent-primary)' : 'var(--text-primary)',
          }}>
            {formatTime(pomodoroState.timeLeft)}
          </span>
          {activeTask && (
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              maxWidth: '120px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              • {activeTask.title}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              pomodoroState.onToggle();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
            title={pomodoroState.isRunning ? 'Pausar' : 'Iniciar'}
          >
            {pomodoroState.isRunning ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="fluent-btn-ghost"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title={theme === 'dark' ? 'Cambiar a modo Claro' : 'Cambiar a modo Oscuro'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
};
