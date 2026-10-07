import React, { useState } from 'react';
import { Plus, Building2, Mail, Phone, FolderKanban, Clock, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Client, Project, TaskItem } from '../types';

interface ClientsViewProps {
  clients: Client[];
  projects: Project[];
  tasks: TaskItem[];
  onSelectClient: (clientId: string) => void;
  onAddClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

const CLIENT_COLORS = [
  '#0078D4', // Fluent Blue
  '#107C41', // Fluent Green
  '#8764B8', // Fluent Purple
  '#FF8C00', // Fluent Amber
  '#00B294', // Fluent Teal
  '#E81123', // Fluent Red
];

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  projects,
  tasks,
  onSelectClient,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    color: CLIENT_COLORS[0],
    notes: '',
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAddClient({
      name: formData.name.trim(),
      company: formData.company.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      color: formData.color,
      notes: formData.notes.trim() || undefined,
    });

    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      color: CLIENT_COLORS[0],
      notes: '',
    });
    setIsCreateModalOpen(false);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Directorio de Clientes & Empresas
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Gestiona tus clientes para agrupar proyectos y llevar el control de horas dedicadas.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="fluent-btn fluent-btn-primary"
          style={{ height: '36px' }}
        >
          <Plus size={16} />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Grid of Clients */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px',
      }}>
        {clients.map(client => {
          const clientProjects = projects.filter(p => p.clientId === client.id);
          const clientProjectIds = new Set(clientProjects.map(p => p.id));
          const clientTasks = tasks.filter(t => clientProjectIds.has(t.projectId));
          const clientSpentSeconds = clientTasks.reduce((acc, t) => acc + (t.spentSeconds || 0), 0);
          const clientHours = (clientSpentSeconds / 3600).toFixed(1);

          return (
            <div
              key={client.id}
              className="glass-panel"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${client.color}`,
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-md)',
                      background: `${client.color}22`,
                      color: client.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {client.name}
                      </h3>
                      {client.company && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                          {client.company}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => setEditingClient(client)}
                      className="fluent-btn-ghost"
                      style={{ padding: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                      title="Editar Cliente"
                    >
                      <Edit2 size={14} color="var(--text-secondary)" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar cliente "${client.name}"? Los proyectos quedarán sin cliente asignado.`)) {
                          onDeleteClient(client.id);
                        }
                      }}
                      className="fluent-btn-ghost"
                      style={{ padding: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                      title="Eliminar Cliente"
                    >
                      <Trash2 size={14} color="var(--text-tertiary)" />
                    </button>
                  </div>
                </div>

                {/* Contact information */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {client.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.notes && (
                    <p style={{
                      marginTop: '4px',
                      fontSize: '0.78rem',
                      color: 'var(--text-tertiary)',
                      background: 'var(--bg-surface-elevated)',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      {client.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer info: Projects & Hours count */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                    <FolderKanban size={14} />
                    <strong>{clientProjects.length}</strong> proj.
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-primary)' }}>
                    <Clock size={14} />
                    <strong>{clientHours}h</strong> registradas
                  </span>
                </div>

                <button
                  onClick={() => onSelectClient(client.id)}
                  className="fluent-btn fluent-btn-ghost"
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.76rem',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--accent-primary)',
                  }}
                >
                  <span>Ver tareas</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Client Modal */}
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Crear Nuevo Cliente / Empresa</h3>
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
                  Nombre del Cliente o Razón Social *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: Innovatech SpA"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Empresa o Giro (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej: Soluciones de Software y Consultoría"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Color selector */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Color Identificador
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {CLIENT_COLORS.map(color => (
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
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Notas Adicionales
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles de facturación, condiciones, acuerdos..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%' }}
                />
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
                  Crear Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="modal-backdrop" onClick={() => setEditingClient(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Editar Cliente</h3>
              <button
                onClick={() => setEditingClient(null)}
                className="fluent-btn-ghost"
                style={{ border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '2px 8px' }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateClient(editingClient);
                setEditingClient(null);
              }}
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  required
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Empresa
                </label>
                <input
                  type="text"
                  value={editingClient.company || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value || undefined })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingClient.email || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value || undefined })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={editingClient.phone || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value || undefined })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Notas
                </label>
                <textarea
                  rows={2}
                  value={editingClient.notes || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value || undefined })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
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
