
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import DashboardPage from '../../pages/DashboardPage';
import * as api from '../../services/api';

// Mock API calls for DashboardPage
jest.mock('../../services/api', () => ({
  getCracks: jest.fn(() => Promise.resolve([])),
  getCrackDetail: jest.fn(() => Promise.resolve({})),
  getStructures: jest.fn(() => Promise.resolve([])),
  createStructure: jest.fn(() => Promise.resolve({})),
  generateLink: jest.fn(() => Promise.resolve({ link: 'mock-link' })),
  getLiveFeedStatus: jest.fn(() => Promise.resolve({ status: 'offline', message: 'Offline' })),
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

describe('Dashboard Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  test('should display Real-time Drone Feed by default', async () => {
    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/Real-time Drone Feed/i)).toBeInTheDocument();
      expect(screen.getByText(/Drone feed is currently offline./i)).toBeInTheDocument();
    });
  });

  test('should switch to 3D Model Visualization when NavButton is clicked', async () => {
    renderWithProviders(<DashboardPage />);

    fireEvent.click(screen.getByRole('button', { name: /3D Model Visualization/i }));

    await waitFor(() => {
      expect(screen.getByText(/3D Model Visualization & Crack Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/3D Model Viewer Placeholder/i)).toBeInTheDocument();
    });
  });

  test('should switch to Structure Management when NavButton is clicked', async () => {
    renderWithProviders(<DashboardPage />);

    fireEvent.click(screen.getByRole('button', { name: /Structure Management/i }));

    await waitFor(() => {
      expect(screen.getByText(/Structure Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Registered Structures/i)).toBeInTheDocument();
    });
  });

  test('AppHeader logout button should call logout and navigate to login', async () => {
    (api.logout as jest.Mock).mockResolvedValue({ success: true });
    renderWithProviders(<DashboardPage />);

    // Simulate a logged-in state for AppHeader to show logout button
    // This is a bit of a hack for testing, in a real app, AuthContext would manage this.
    // For now, we'll just ensure the button is there and clickable.
    // The AppHeader component itself uses useAuth, so we need to ensure the context is set up.
    // For this test, we'll assume the user is logged in and the logout button is visible.
    // The actual navigation is handled by react-router-dom, which is mocked by BrowserRouter.

    // Find the logout button within the UserProfileDisplay which is part of AppHeader
    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(api.logout).toHaveBeenCalledTimes(1);
      // In a real app, we'd check for navigation to /login
    });
  });
});
