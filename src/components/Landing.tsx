import React, { useState } from 'react';
import { Icons } from './Icons';

interface LandingProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, name: string) => Promise<void>;
}

export const Landing: React.FC<LandingProps> = ({ onLogin, onRegister }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {
        await onLogin(formData.email, formData.password);
      } else {
        await onRegister(formData.email, formData.password, formData.name);
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="logo-large">
              <Icons.Brain />
              <span>EduAction</span>
            </div>
            <h1>Платформа корпоративного онлайн-обучения</h1>
            <p className="hero-subtitle">
              Развивайте навыки ваших сотрудников с помощью персонализированных курсов,
              AI-помощника и системы отслеживания прогресса
            </p>

            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">
                  <Icons.Brain />
                </div>
                <h3>AI-Тьютор</h3>
                <p>Персональный помощник для каждого модуля</p>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Icons.TrendingUp />
                </div>
                <h3>Отслеживание прогресса</h3>
                <p>Детальная аналитика и статистика обучения</p>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Icons.Award />
                </div>
                <h3>Сертификаты</h3>
                <p>Подтверждение навыков после завершения</p>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Icons.Grid />
                </div>
                <h3>Каталог курсов</h3>
                <p>Широкий выбор тем для развития</p>
              </div>
            </div>
          </div>

          <div className="auth-form-container">
            <div className="auth-form-card">
              <div className="auth-tabs">
                <button
                  className={isLoginMode ? 'active' : ''}
                  onClick={() => setIsLoginMode(true)}
                >
                  Вход
                </button>
                <button
                  className={!isLoginMode ? 'active' : ''}
                  onClick={() => setIsLoginMode(false)}
                >
                  Регистрация
                </button>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {!isLoginMode && (
                  <div className="form-group">
                    <label htmlFor="name">
                      <Icons.User />
                      Имя
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Введите ваше имя"
                      value={formData.name}
                      onChange={handleInputChange}
                      required={!isLoginMode}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="email">
                    <Icons.Mail />
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    <Icons.Lock />
                    Пароль
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="error-message">
                    <Icons.AlertCircle />
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    'Загрузка...'
                  ) : (
                    <>
                      {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
                      <Icons.ArrowRight />
                    </>
                  )}
                </button>
              </form>

              <div className="auth-footer">
                {isLoginMode ? (
                  <p>
                    Нет аккаунта?{' '}
                    <button onClick={() => setIsLoginMode(false)}>
                      Зарегистрируйтесь
                    </button>
                  </p>
                ) : (
                  <p>
                    Уже есть аккаунт?{' '}
                    <button onClick={() => setIsLoginMode(true)}>
                      Войдите
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-info">
        <div className="info-content">
          <h2>Почему EduAction?</h2>
          <div className="benefits-list">
            <div className="benefit-item">
              <Icons.CheckCircle />
              <div>
                <h4>Адаптивное обучение</h4>
                <p>Курсы подстраиваются под темп каждого сотрудника</p>
              </div>
            </div>

            <div className="benefit-item">
              <Icons.CheckCircle />
              <div>
                <h4>Экономия времени HR</h4>
                <p>Автоматизация процессов обучения и отчетности</p>
              </div>
            </div>

            <div className="benefit-item">
              <Icons.CheckCircle />
              <div>
                <h4>Измеримые результаты</h4>
                <p>Аналитика эффективности обучения команды</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
