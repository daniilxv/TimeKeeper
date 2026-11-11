import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './AuthPage.css';

const AuthPage = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку при вводе
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Минимум 8 символов';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Требуется заглавная буква';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Требуется строчная буква';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Требуется цифра';
    }
    
    if (isRegistering && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        await api.post('/register', {
          email: formData.email,
          password: formData.password
        });
        // После регистрации автоматически логинимся
        const formDataLogin = new FormData();
        formDataLogin.append('username', formData.email); // OAuth2 ожидает поле username
        formDataLogin.append('password', formData.password);
        
        const response = await api.post('/token', formDataLogin, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        onLogin(response.data.access_token);
        navigate('/'); // Перенаправление на главную страницу
      } else {
        const formDataLogin = new FormData();
        formDataLogin.append('username', formData.email); // OAuth2 ожидает поле username
        formDataLogin.append('password', formData.password);
        
        const response = await api.post('/token', formDataLogin, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        onLogin(response.data.access_token);
        navigate('/'); // Перенаправление на главную страницу
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Ошибка авторизации');
      if (Array.isArray(error.response?.data?.detail)) {
        setErrorMessage(error.response.data.detail.join(', '));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(prev => !prev);
    setErrors({});
    setErrorMessage('');
    setFormData({ email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <h1>{isRegistering ? 'Регистрация' : 'Вход'}</h1>
            <p>{isRegistering ? 'Создайте новый аккаунт' : 'Войдите в свой аккаунт'}</p>
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Введите email"
                autoComplete="email"
                disabled={isLoading}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                disabled={isLoading}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            {isRegistering && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Подтвердите пароль</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Повторите пароль"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            )}

            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isLoading}
            >
              {isLoading ? 'Подождите...' : (isRegistering ? 'Зарегистрироваться' : 'Войти')}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isRegistering ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
              <button type="button" onClick={toggleMode} className="toggle-link">
                {isRegistering ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
