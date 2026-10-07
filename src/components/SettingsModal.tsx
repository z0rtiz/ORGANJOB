import React, { useState } from 'react';
import { Settings, Volume2, Save, Download, Upload, RotateCcw, ShieldCheck, Check } from 'lucide-react';
import { PomodoroSettings, AppData } from '../types';
import { playNotificationSound } from '../utils/audio';
import { exportDataAsJSON } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PomodoroSettings;
  onSaveSettings: (settings: PomodoroSettings) => void;
  appData: AppData;
  onImportData: (data: AppData) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  appData,
  onImportData,
  onResetData,
}) => {
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>({ ...settings });
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTestSound = () => {
    playNotificationSound('bell', localSettings.soundVolume);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.projects && parsed.tasks) {
          onImportData(parsed);
          setImportSuccess(true);
          setTimeout(() => setImportSuccess(false), 3000);
        } else {
          alert('El archivo no contiene un formato de respaldo válido de OrganJob.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Configuración & Respaldo</h3>
          </div>
          <button
            onClick={onClose}
            className="fluent-btn-ghost"
            style={{ border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '2px 8px' }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
          {/* Section: Pomodoro Settings */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Parámetros de Pomodoro
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Tiempo de Enfoque (minutos)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={localSettings.workDuration}
                  onChange={(e) => setLocalSettings({ ...localSettings, workDuration: Math.max(1, Number(e.target.value)) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Descanso Corto (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.shortBreakDuration}
                  onChange={(e) => setLocalSettings({ ...localSettings, shortBreakDuration: Math.max(1, Number(e.target.value)) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Descanso Largo (minutos)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={localSettings.longBreakDuration}
                  onChange={(e) => setLocalSettings({ ...localSettings, longBreakDuration: Math.max(1, Number(e.target.value)) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Ciclos antes del descanso largo
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={localSettings.longBreakInterval}
                  onChange={(e) => setLocalSettings({ ...localSettings, longBreakInterval: Math.max(1, Number(e.target.value)) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Sound options */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>Sonido al completar ciclo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleTestSound}
                  className="fluent-btn fluent-btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  Probar sonido
                </button>
                <input
                  type="checkbox"
                  checked={localSettings.soundEnabled}
                  onChange={(e) => setLocalSettings({ ...localSettings, soundEnabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

          {/* Section: Data Backup & Restore */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Copia de Seguridad y Privacidad Local
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Tus datos se guardan 100% de forma local en tu computadora. Puedes exportar una copia o restaurarla en cualquier momento.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => exportDataAsJSON(appData)}
                className="fluent-btn fluent-btn-secondary"
                style={{ flex: 1, minWidth: '160px' }}
              >
                <Download size={15} />
                <span>Exportar Respaldo JSON</span>
              </button>

              <label className="fluent-btn fluent-btn-secondary" style={{ flex: 1, minWidth: '160px', cursor: 'pointer', margin: 0 }}>
                <Upload size={15} />
                <span>Restaurar Respaldo</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {importSuccess && (
              <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-success-light)',
                color: '#57d885',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Check size={14} />
                <span>¡Respaldo restaurado exitosamente!</span>
              </div>
            )}
          </div>

          <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

          {/* Section: Microsoft Store & App info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            background: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="var(--accent-primary)" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>OrganJob Desktop Pro</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Versión 1.0.0 • Desarrollado por <a href="mailto:sergio.ortiz@microdatas.com" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>sergio.ortiz@microdatas.com</a>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de restablecer los datos de ejemplo iniciales?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="fluent-btn fluent-btn-danger"
              style={{ padding: '4px 10px', fontSize: '0.72rem' }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
        }}>
          <button
            onClick={onClose}
            className="fluent-btn fluent-btn-secondary"
          >
            Cerrar
          </button>
          <button
            onClick={handleSave}
            className="fluent-btn fluent-btn-primary"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
