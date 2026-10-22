import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Lock, Mail, User, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { login, register: registerUser } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setAuthError(null);
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setAuthError(null);
      await registerUser(data.fullName, data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Registration failed.');
    }
  };

  const fillCredentials = (email: string, pass: string) => {
    loginForm.setValue('email', email);
    loginForm.setValue('password', pass);
    setAuthError(null);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <CheckSquare size={36} className="text-primary" />
          </div>
          <h1>Task & Team Portal</h1>
          <p className="auth-subtitle">
            {isRegistering ? 'Create your account to get started' : 'Sign in to access your projects & tasks'}
          </p>
        </div>

        {authError && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{authError}</span>
          </div>
        )}

        {!isRegistering ? (
          <>
            {/* Quick Demo Fill Buttons */}
            <div className="demo-credentials">
              <span className="demo-label">Quick Demo Login:</span>
              <div className="demo-buttons">
                <button
                  type="button"
                  className="btn-demo"
                  onClick={() => fillCredentials('admin@taskmanager.com', 'Admin@123')}
                >
                  Admin User
                </button>
                <button
                  type="button"
                  className="btn-demo"
                  onClick={() => fillCredentials('john@taskmanager.com', 'Member@123')}
                >
                  John (Member)
                </button>
              </div>
            </div>

            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="form">
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="name@company.com"
                    className={`form-input has-icon ${loginForm.formState.errors.email ? 'is-invalid' : ''}`}
                    {...loginForm.register('email')}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <span className="error-message">{loginForm.formState.errors.email.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className={`form-input has-icon ${loginForm.formState.errors.password ? 'is-invalid' : ''}`}
                    {...loginForm.register('password')}
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <span className="error-message">{loginForm.formState.errors.password.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="form">
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="John Doe"
                  className={`form-input has-icon ${registerForm.formState.errors.fullName ? 'is-invalid' : ''}`}
                  {...registerForm.register('fullName')}
                />
              </div>
              {registerForm.formState.errors.fullName && (
                <span className="error-message">{registerForm.formState.errors.fullName.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="name@company.com"
                  className={`form-input has-icon ${registerForm.formState.errors.email ? 'is-invalid' : ''}`}
                  {...registerForm.register('email')}
                />
              </div>
              {registerForm.formState.errors.email && (
                <span className="error-message">{registerForm.formState.errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reg-pass">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="reg-pass"
                  type="password"
                  placeholder="Minimum 6 characters"
                  className={`form-input has-icon ${registerForm.formState.errors.password ? 'is-invalid' : ''}`}
                  {...registerForm.register('password')}
                />
              </div>
              {registerForm.formState.errors.password && (
                <span className="error-message">{registerForm.formState.errors.password.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reg-conf">Confirm Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="reg-conf"
                  type="password"
                  placeholder="Re-enter password"
                  className={`form-input has-icon ${registerForm.formState.errors.confirmPassword ? 'is-invalid' : ''}`}
                  {...registerForm.register('confirmPassword')}
                />
              </div>
              {registerForm.formState.errors.confirmPassword && (
                <span className="error-message">{registerForm.formState.errors.confirmPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={registerForm.formState.isSubmitting}
            >
              {registerForm.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          {isRegistering ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setIsRegistering(false);
                  setAuthError(null);
                }}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setIsRegistering(true);
                  setAuthError(null);
                }}
              >
                Register
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
