import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './SettingsPage.css';

const SettingsPage = ({ onBack }) => {
  const navigate = useNavigate();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [checkingGoogle, setCheckingGoogle] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkGoogleConnection();
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const response = await api.get('/auth/google/status');
      setGoogleConnected(response.data.connected);
    } catch (err) {
      console.error('Failed to check Google connection:', err);
      setGoogleConnected(false);
    } finally {
      setCheckingGoogle(false);
    }
  };

  const handleConnectGoogle = async () => {
    setError('');
    setSuccess('');
    setConnecting(true);
    try {
      const response = await api.get('/auth/google');
      window.location.href = response.data.url;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Unknown error';
      setError('Ошибка при подключении Google Календаря: ' + errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!window.confirm('Вы уверены, что хотите отключить Google Календарь?')) return;
    
    setError('');
    setSuccess('');
    setDisconnecting(true);
    try {
      await api.post('/auth/google/disconnect');
      setGoogleConnected(false);
      setSuccess('Google Календарь успешно отключен');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Функция отключения пока не реализована на сервере. Обратитесь к разработчику.');
      } else {
        const errorMessage = err.response?.data?.detail || err.message || 'Unknown error';
        setError('Ошибка при отключении: ' + errorMessage);
      }
    } finally {
      setDisconnecting(false);
    }
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/');
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <button className="back-btn" onClick={handleBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Назад
          </button>
          <h1>Настройки</h1>
        </div>

        <div className="settings-section">
          <h2>Google Calendar</h2>
          <p className="section-description">
            Подключите Google Календарь, чтобы видеть свои мероприятия в этом планировщике.
          </p>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon google-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div>
                <h3>Google Календарь</h3>
                <p>{googleConnected ? 'Подключен' : 'Не подключен'}</p>
              </div>
            </div>
            <div className="setting-action">
              {checkingGoogle ? (
                <div className="loading-spinner" />
              ) : googleConnected ? (
                <button 
                  className="btn btn-danger" 
                  onClick={handleDisconnectGoogle}
                  disabled={disconnecting}
                >
                  {disconnecting ? 'Отключение...' : 'Отключить'}
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={handleConnectGoogle}
                  disabled={connecting}
                >
                  {connecting ? 'Подключение...' : 'Подключить'}
                </button>
              )}
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {googleConnected && (
            <div className="connected-info">
              <p>Ваши мероприятия из Google Календаря будут отображаться в календаре с иконкой <span className="google-badge">Google</span>.</p>
              <p>Вы не можете редактировать или удалять эти мероприятия в этом приложении — они синхронизируются только для чтения.</p>
            </div>
          )}
        </div>

        <div className="settings-section">
          <h2>Уведомления</h2>
          <p className="section-description">Настройте уведомления о задачах и событиях.</p>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Email уведомления</h3>
              <p>Получать уведомления на почту</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Push уведомления</h3>
              <p>Получать уведомления в браузере</p>
            </div>
            <label className="toggle">
              <input type="checkbox" />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Внешний вид</h2>
          <p className="section-description">Настройте отображение календаря.</p>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Тема</h3>
              <p>Выберите цветовую схему</p>
            </div>
            <select className="select" defaultValue="system">
              <option value="system">Системная</option>
              <option value="light">Светлая</option>
              <option value="dark">Тёмная</option>
            </select>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Начало недели</h3>
              <p>День, с которого начинается неделя</p>
            </div>
            <select className="select" defaultValue="monday">
              <option value="monday">Понедельник</option>
              <option value="sunday">Воскресенье</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
