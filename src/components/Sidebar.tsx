import React from 'react';
import {
  CheckSquare,
  FolderKanban,
  Building2,
  Timer,
  BarChart3,
  Settings,
  Plus,
  Calendar,
  Layers,
} from 'lucide-react';
import { Project, Client, TaskItem } from '../types';

export type NavView = 'tasks-all' | 'tasks-today' | 'projects' | 'clients' | 'pomodoro' | 'stats';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  selectedProjectId?: string;
  onSelectProject: (projectId?: string) => void;
  selectedClientId?: string;
  onSelectClient: (clientId?: string) => void;
  projects: Project[];
  clients: Client[];
  tasks: TaskItem[];
  onOpenNewProjectModal: () => void;
  onOpenNewClientModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  selectedProjectId,
  onSelectProject,
  selectedClientId,
  onSelectClient,
  projects,
  clients,
  tasks,
  onOpenNewProjectModal,
  onOpenNewClientModal,
  onOpenSettingsModal,
}) => {
  const pendingTasksCount = tasks.filter(t => !t.completed).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasksCount = tasks.filter(t => !t.completed && t.dueDate === todayStr).length;

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 52px)',
      userSelect: 'none',
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      {/* Primary Navigation Section */}
      <div style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          onClick={() => {
            onSelectView('tasks-today');
            onSelectProject(undefined);
            onSelectClient(undefined);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: currentView === 'tasks-today' && !selectedProjectId && !selectedClientId ? 'var(--bg-sidebar-active)' : 'transparent',
            border: 'none',
            color: currentView === 'tasks-today' && !selectedProjectId && !selectedClientId ? 'var(--accent-primary)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'background 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} style={{ color: '#0078D4' }} />
            <span>Mi Día</span>
          </div>
          {todayTasksCount > 0 && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-light)',
              color: 'var(--accent-primary)',
            }}>
              {todayTasksCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            onSelectView('tasks-all');
            onSelectProject(undefined);
            onSelectClient(undefined);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: currentView === 'tasks-all' && !selectedProjectId && !selectedClientId ? 'var(--bg-sidebar-active)' : 'transparent',
            border: 'none',
            color: currentView === 'tasks-all' && !selectedProjectId && !selectedClientId ? 'var(--accent-primary)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'background 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckSquare size={18} style={{ color: '#107C41' }} />
            <span>Todas las Tareas</span>
          </div>
          {pendingTasksCount > 0 && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
            }}>
              {pendingTasksCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            onSelectView('pomodoro');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: currentView === 'pomodoro' ? 'var(--bg-sidebar-active)' : 'transparent',
            border: 'none',
            color: currentView === 'pomodoro' ? 'var(--accent-primary)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'background 0.15s ease',
          }}
        >
          <Timer size={18} style={{ color: '#E81123' }} />
          <span>Pomodoro Timer</span>
        </button>

        <button
          onClick={() => {
            onSelectView('stats');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: currentView === 'stats' ? 'var(--bg-sidebar-active)' : 'transparent',
            border: 'none',
            color: currentView === 'stats' ? 'var(--accent-primary)' : 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'background 0.15s ease',
          }}
        >
          <BarChart3 size={18} style={{ color: '#8764B8' }} />
          <span>Estadísticas & Horas</span>
        </button>
      </div>

      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 12px' }} />

      {/* Projects Section */}
      <div style={{ padding: '10px 10px 4px 10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 8px',
          color: 'var(--text-tertiary)',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          <span
            onClick={() => {
              onSelectView('projects');
              onSelectProject(undefined);
            }}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FolderKanban size={13} />
            <span>Proyectos ({projects.length})</span>
          </span>
          <button
            onClick={onOpenNewProjectModal}
            className="fluent-btn-ghost"
            style={{
              padding: '2px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
            title="Nuevo Proyecto"
          >
            <Plus size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
          {projects.slice(0, 8).map(project => {
            const projectPending = tasks.filter(t => t.projectId === project.id && !t.completed).length;
            const isSelected = selectedProjectId === project.id;
            return (
              <button
                key={project.id}
                onClick={() => {
                  onSelectView('tasks-all');
                  onSelectProject(project.id);
                  onSelectClient(undefined);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--bg-sidebar-active)' : 'transparent',
                  border: 'none',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 600 : 400,
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: project.color,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {project.name}
                  </span>
                </div>
                {projectPending > 0 && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                    {projectPending}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 12px' }} />

      {/* Clients Section */}
      <div style={{ padding: '4px 10px', flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 8px',
          color: 'var(--text-tertiary)',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          <span
            onClick={() => {
              onSelectView('clients');
              onSelectClient(undefined);
            }}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Building2 size={13} />
            <span>Clientes ({clients.length})</span>
          </span>
          <button
            onClick={onOpenNewClientModal}
            className="fluent-btn-ghost"
            style={{
              padding: '2px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
            title="Nuevo Cliente"
          >
            <Plus size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
          {clients.map(client => {
            const isSelected = selectedClientId === client.id;
            const clientProjectsCount = projects.filter(p => p.clientId === client.id).length;
            return (
              <button
                key={client.id}
                onClick={() => {
                  onSelectView('tasks-all');
                  onSelectClient(client.id);
                  onSelectProject(undefined);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--bg-sidebar-active)' : 'transparent',
                  border: 'none',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 600 : 400,
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '2px',
                    background: client.color,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {client.name}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                  {clientProjectsCount} proj
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Settings */}
      <div style={{
        padding: '10px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-sidebar)',
      }}>
        <button
          onClick={onOpenSettingsModal}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <Settings size={17} />
          <span>Configuración & Datos</span>
        </button>
      </div>
    </aside>
  );
};
