import React from 'react';
import {
  BarChart3,
  Clock,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Building2,
  FolderKanban,
  Download,
  Flame,
} from 'lucide-react';
import { AppData } from '../types';
import { exportTimeLogsCSV } from '../services/storage';

interface StatsViewProps {
  data: AppData;
}

export const StatsView: React.FC<StatsViewProps> = ({ data }) => {
  const { timeLogs, tasks, projects, clients } = data;

  // Helper to get local YYYY-MM-DD
  const getLocalDateKey = (dateInput: string | Date | number): string => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Reconcile in-memory: if tasks have spentSeconds that weren't yet logged, include them as effective logs
  const effectiveLogs = [...timeLogs];
  tasks.forEach((task) => {
    if (task.spentSeconds && task.spentSeconds > 0) {
      const loggedSeconds = timeLogs
        .filter((l) => l.taskId === task.id)
        .reduce((sum, l) => sum + l.durationSeconds, 0);

      const unlogged = task.spentSeconds - loggedSeconds;
      if (unlogged > 10) {
        const d = task.completedAt || task.dueDate || task.createdAt || new Date().toISOString();
        effectiveLogs.push({
          id: `eff-${task.id}`,
          taskId: task.id,
          projectId: task.projectId,
          durationSeconds: unlogged,
          startedAt: d,
          endedAt: new Date(new Date(d).getTime() + unlogged * 1000).toISOString(),
          type: 'manual',
          notes: task.title,
        });
      }
    }
  });

  // Time calculations using local dates
  const now = new Date();
  const todayKey = getLocalDateKey(now);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  // Start of week (Monday)
  const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday).getTime();
  
  // Start of month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let secondsToday = 0;
  let secondsThisWeek = 0;
  let secondsThisMonth = 0;
  let pomodorosToday = 0;

  effectiveLogs.forEach(log => {
    const logTime = new Date(log.startedAt).getTime();
    const logDateKey = getLocalDateKey(log.startedAt);

    if (logDateKey === todayKey || logTime >= startOfToday) {
      secondsToday += log.durationSeconds;
      if (log.type === 'pomodoro') pomodorosToday += 1;
    }
    if (logTime >= startOfWeek) {
      secondsThisWeek += log.durationSeconds;
    }
    if (logTime >= startOfMonth) {
      secondsThisMonth += log.durationSeconds;
    }
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Last 7 days breakdown for SVG Bar Chart (using local day keys)
  const daysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
    const targetKey = getLocalDateKey(d);
    const dayLabel = d.toLocaleDateString('es-ES', { weekday: 'short' });

    const totalDaySeconds = effectiveLogs
      .filter(l => getLocalDateKey(l.startedAt) === targetKey)
      .reduce((acc, l) => acc + l.durationSeconds, 0);

    return {
      date: targetKey,
      label: dayLabel.toUpperCase(),
      hours: Number((totalDaySeconds / 3600).toFixed(2)),
    };
  });

  const maxDayHours = Math.max(...daysData.map(d => d.hours), 4);

  // Time by Project breakdown
  const projectMap = new Map(projects.map(p => [p.id, p]));
  const projectTimeMap: Record<string, number> = {};
  
  effectiveLogs.forEach(log => {
    projectTimeMap[log.projectId] = (projectTimeMap[log.projectId] || 0) + log.durationSeconds;
  });

  const totalLoggedSeconds = Object.values(projectTimeMap).reduce((a, b) => a + b, 0);

  const projectDistribution = projects
    .map(proj => {
      const secs = projectTimeMap[proj.id] || 0;
      return {
        id: proj.id,
        name: proj.name,
        color: proj.color,
        hours: Number((secs / 3600).toFixed(1)),
        percent: totalLoggedSeconds > 0 ? Math.round((secs / totalLoggedSeconds) * 100) : 0,
      };
    })
    .filter(item => item.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  // Time by Client breakdown
  const clientMap = new Map(clients.map(c => [c.id, c]));
  const clientTimeMap: Record<string, number> = {};
  
  effectiveLogs.forEach(log => {
    const proj = projectMap.get(log.projectId);
    const clientId = proj?.clientId || 'internal';
    clientTimeMap[clientId] = (clientTimeMap[clientId] || 0) + log.durationSeconds;
  });

  const clientDistribution = Object.entries(clientTimeMap)
    .map(([clientId, secs]) => {
      const client = clientMap.get(clientId);
      return {
        id: clientId,
        name: client ? client.name : 'Interno / Sin Cliente',
        color: client?.color || '#8764B8',
        hours: Number((secs / 3600).toFixed(1)),
        percent: totalLoggedSeconds > 0 ? Math.round((secs / totalLoggedSeconds) * 100) : 0,
      };
    })
    .sort((a, b) => b.hours - a.hours);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '24px 32px',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Estadísticas & Rendimiento
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Monitorea el tiempo invertido en cada tarea, proyecto y cliente para medir tu productividad.
          </p>
        </div>

        <button
          onClick={() => exportTimeLogsCSV(data)}
          className="fluent-btn fluent-btn-secondary"
          style={{ height: '36px' }}
          title="Descargar informe detallado para facturar a clientes"
        >
          <Download size={15} />
          <span>Exportar a CSV / Excel</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* KPI 1 */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>Hoy</span>
            <Clock size={16} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {(secondsToday / 3600).toFixed(1)} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>hrs</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {pomodorosToday} pomodoros completados
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>Esta Semana</span>
            <Calendar size={16} color="#107C41" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {(secondsThisWeek / 3600).toFixed(1)} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>hrs</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Registradas en los últimos 7 días
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>Este Mes</span>
            <TrendingUp size={16} color="#8764B8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {(secondsThisMonth / 3600).toFixed(1)} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>hrs</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Total mensual acumulado
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>Completitud Tareas</span>
            <CheckCircle2 size={16} color="#FF8C00" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {completionRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {completedTasks} de {totalTasks} tareas hechas
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Weekly Productivity Bar Chart */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>
            Horas de Trabajo (Últimos 7 días)
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Evolución diaria de concentración y tiempo de tareas
          </p>

          <div style={{
            height: '180px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '12px',
            paddingTop: '20px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            {daysData.map(day => {
              const heightPercent = maxDayHours > 0 ? (day.hours / maxDayHours) * 100 : 0;
              return (
                <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                    {day.hours > 0 ? `${day.hours}h` : ''}
                  </span>
                  <div style={{
                    width: '100%',
                    maxWidth: '38px',
                    height: `${Math.max(heightPercent, 4)}%`,
                    background: day.hours > 0 ? 'linear-gradient(180deg, #0078D4 0%, #005A9E 100%)' : 'var(--bg-surface-elevated)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease',
                  }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '8px' }}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time by Project breakdown */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>
            Distribución por Proyecto
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Proporción de tiempo dedicado
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '200px', overflowY: 'auto' }}>
            {projectDistribution.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center', margin: 'auto' }}>
                Aún no has registrado sesiones de tiempo en proyectos.
              </p>
            ) : (
              projectDistribution.map(item => (
                <div key={item.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                      {item.name}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong>{item.hours}h</strong> ({item.percent}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)' }}>
                    <div style={{
                      width: `${item.percent}%`,
                      height: '100%',
                      background: item.color,
                      borderRadius: 'var(--radius-full)',
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Distribution by Client and Recent Logs Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '20px' }}>
        {/* Client Distribution Card */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>
            Distribución por Cliente
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Horas para facturación y reporte de servicios
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {clientDistribution.map(item => (
              <div key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong>{item.hours}h</strong> ({item.percent}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)' }}>
                  <div style={{
                    width: `${item.percent}%`,
                    height: '100%',
                    background: item.color,
                    borderRadius: 'var(--radius-full)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Session Time Logs Table */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>
            Últimas Sesiones Registradas
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Historial de registros de Pomodoro y tiempos
          </p>

          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {effectiveLogs.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px' }}>
                Sin registros de tiempo aún.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {effectiveLogs.slice(-8).reverse().map(log => {
                  const proj = projectMap.get(log.projectId);
                  const task = tasks.find(t => t.id === log.taskId);
                  const minutes = Math.round(log.durationSeconds / 60);
                  const dateStr = new Date(log.startedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={log.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {task?.title || 'Tarea'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                          {proj?.name || 'Proyecto'} • {dateStr}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-primary)', flexShrink: 0 }}>
                        +{minutes} min
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
