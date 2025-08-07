
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import LoginPage from '../../pages/LoginPage';
import SignUpPage from '../../pages/SignUpPage';
import * as api from '../../services/api';

// Mock API calls
jest.mock('../../services/api', () => ({
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>{ui}</AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

describe('Auth Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  test('should allow a user to log in successfully', async () => {
    (api.login as jest.Mock).mockResolvedValue({ success: true, user: 'testuser' });

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith('testuser', 'password');
      // In a real app, we'd check for navigation to dashboard or user context update
      // For now, we can check if the error message is not displayed
      expect(screen.queryByText(/Invalid username or password/i)).not.toBeInTheDocument();
    });
  });

  test('should display error message on failed login', async () => {
    (api.login as jest.Mock).mockResolvedValue({ success: false, message: 'Invalid credentials' });

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
      target: { value: 'wronguser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith('wronguser', 'wrongpass');
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('should allow a user to sign up successfully and navigate to login', async () => {
    (api.signup as jest.Mock).mockResolvedValue({ success: true });

    renderWithProviders(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: 'newpass' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your employee ID/i), {
      target: { value: 'EMP123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(api.signup).toHaveBeenCalledWith('newuser', 'newpass', 'EMP123');
      expect(screen.getByText(/Sign Up successful! Please log in./i)).toBeInTheDocument();
      // In a real app, we'd check for navigation to login page
    });
  });

  test('should display error message on failed signup', async () => {
    (api.signup as jest.Mock).mockResolvedValue({ success: false, message: 'Username already exists' });

    renderWithProviders(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
      target: { value: 'existinguser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: 'pass' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your employee ID/i), {
      target: { value: 'EMP456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(api.signup).toHaveBeenCalledWith('existinguser', 'pass', 'EMP456');
      expect(screen.getByText(/Username already exists/i)).toBeInTheDocument();
    });
  });

  test('should switch from login to signup form', async () => {
    renderWithProviders(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /Don't have an account\? Sign Up/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter your employee ID/i)).toBeInTheDocument();
    });
  });

  test('should switch from signup to login form', async () => {
    renderWithProviders(<SignUpPage />);
    fireEvent.click(screen.getByRole('button', { name: /Already have an account\? Login/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/Enter your employee ID/i)).not.toBeInTheDocument();
    });
  });
});
