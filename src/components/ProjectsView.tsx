import React, { useState } from 'react';
import { Plus, FolderKanban, Building2, Clock, Calendar, CheckSquare, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Project, Client, TaskItem, ProjectStatus, Priority } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  clients: Client[];
  tasks: TaskItem[];
  onSelectProject: (projectId: string) => void;
  onAddProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

const PROJECT_COLORS = [
  '#0078D4', // Fluent Blue
  '#107C41', // Fluent Green
  '#8764B8', // Fluent Purple
  '#FF8C00', // Fluent Amber
  '#E81123', // Fluent Red
  '#00B294', // Fluent Teal
  '#68768A', // Slate
];

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  clients,
  tasks,
  onSelectProject,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  // Form state for creating
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    color: PROJECT_COLORS[0],
    status: 'active' as ProjectStatus,
    priority: 'medium' as Priority,
    budgetHours: 20,
    deadline: '',
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAddProject({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      clientId: formData.clientId || undefined,
      color: formData.color,
      status: formData.status,
      priority: formData.priority,
      budgetHours: formData.budgetHours ? Number(formData.budgetHours) : undefined,
      deadline: formData.deadline || undefined,
    });

    setFormData({
      name: '',
      description: '',
      clientId: '',
      color: PROJECT_COLORS[0],
      status: 'active',
      priority: 'medium',
      budgetHours: 20,
      deadline: '',
    });
    setIsCreateModalOpen(false);
  };

  const filteredProjects = projects.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '24px 32px',
      overflowY: 'auto',
    }}>
      {/* View Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Proyectos de Trabajo
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Administra tus proyectos, metas, tiempos presupuestados y clientes asociados.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
            style={{ fontSize: '0.82rem', height: '36px' }}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="on_hold">En Pausa</option>
            <option value="completed">Completados</option>
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="fluent-btn fluent-btn-primary"
            style={{ height: '36px' }}
          >
            <Plus size={16} />
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      {/* Grid of Projects */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px',
      }}>
        {filteredProjects.map(project => {
          const client = clients.find(c => c.id === project.clientId);
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const completedTasksCount = projectTasks.filter(t => t.completed).length;
          const totalTasksCount = projectTasks.length;
          const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

          const totalSpentSeconds = projectTasks.reduce((acc, t) => acc + (t.spentSeconds || 0), 0);
          const totalSpentHours = (totalSpentSeconds / 3600).toFixed(1);

          return (
            <div
              key={project.id}
              className="glass-panel"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `4px solid ${project.color}`,
                cursor: 'pointer',
              }}
              onClick={() => onSelectProject(project.id)}
            >
              <div>
                {/* Header of Card */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ minWidth: 0 }}>
                    {client && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        marginBottom: '4px',
                      }}>
                        <Building2 size={12} style={{ color: client.color }} />
                        <span style={{ fontWeight: 600 }}>{client.name}</span>
                      </div>
                    )}
                    <h3 style={{
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {project.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingProject(project)}
                      className="fluent-btn-ghost"
                      style={{ padding: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                      title="Editar Proyecto"
                    >
                      <Edit2 size={14} color="var(--text-secondary)" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar proyecto "${project.name}" y sus tareas?`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      className="fluent-btn-ghost"
                      style={{ padding: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                      title="Eliminar Proyecto"
                    >
                      <Trash2 size={14} color="var(--text-tertiary)" />
                    </button>
                  </div>
                </div>

                {project.description && (
                  <p style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.4',
                  }}>
                    {project.description}
                  </p>
                )}

                {/* Progress bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <span>Progreso de Tareas</span>
                    <span style={{ fontWeight: 600 }}>{completionPercentage}% ({completedTasksCount}/{totalTasksCount})</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${completionPercentage}%`,
                      height: '100%',
                      background: project.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              </div>

              {/* Footer info: Hours & Deadline */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} style={{ color: 'var(--accent-primary)' }} />
                  <span>
                    <strong>{totalSpentHours}h</strong>
                    {project.budgetHours ? ` / ${project.budgetHours}h` : ' registradas'}
                  </span>
                </div>

                {project.deadline && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} />
                    <span>{project.deadline}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Crear Nuevo Proyecto</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="fluent-btn-ghost"
                style={{ border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '2px 8px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: Rediseño Web Corporativa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Cliente / Empresa (Opcional)
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="">(Sin cliente asociado / Proyecto Interno)</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Objetivos o alcance del proyecto..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Color selector */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Color Identificador
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {PROJECT_COLORS.map(color => (
                    <div
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: color,
                        cursor: 'pointer',
                        border: formData.color === color ? '2px solid #ffffff' : 'none',
                        boxShadow: formData.color === color ? '0 0 0 2px var(--accent-primary)' : 'none',
                        transition: 'transform 0.1s ease',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Horas Presupuestadas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.budgetHours}
                    onChange={(e) => setFormData({ ...formData, budgetHours: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Fecha Límite
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="fluent-btn fluent-btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="fluent-btn fluent-btn-primary"
                >
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="modal-backdrop" onClick={() => setEditingProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Editar Proyecto</h3>
              <button
                onClick={() => setEditingProject(null)}
                className="fluent-btn-ghost"
                style={{ border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '2px 8px' }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateProject(editingProject);
                setEditingProject(null);
              }}
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Cliente
                  </label>
                  <select
                    value={editingProject.clientId || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, clientId: e.target.value || undefined })}
                    style={{ width: '100%' }}
                  >
                    <option value="">(Sin cliente)</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Estado
                  </label>
                  <select
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as ProjectStatus })}
                    style={{ width: '100%' }}
                  >
                    <option value="active">Activo</option>
                    <option value="on_hold">En Pausa</option>
                    <option value="completed">Completado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Horas Presupuestadas
                  </label>
                  <input
                    type="number"
                    value={editingProject.budgetHours || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, budgetHours: Number(e.target.value) || undefined })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Fecha Límite
                  </label>
                  <input
                    type="date"
                    value={editingProject.deadline || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, deadline: e.target.value || undefined })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="fluent-btn fluent-btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="fluent-btn fluent-btn-primary"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
