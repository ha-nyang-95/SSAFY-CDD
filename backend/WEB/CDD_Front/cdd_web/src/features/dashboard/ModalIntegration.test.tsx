
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import DashboardPage from '../../pages/DashboardPage';
import * as api from '../../services/api';

// Mock API calls for DashboardPage
jest.mock('../../services/api', () => ({
  getCracks: jest.fn(() =>
    Promise.resolve([
      {
        id: 'CRK-001',
        location: 'Beam A',
        severity: 'high',
        length: 10,
        width: 0.5,
        description: 'Test crack description',
      },
    ])
  ),
  getCrackDetail: jest.fn((id) =>
    Promise.resolve({
      id: id,
      location: 'Beam A',
      severity: 'high',
      length: 10,
      width: 0.5,
      description: `Details for ${id}`,
      imageURL: 'https://via.placeholder.com/300x200?text=Crack+Image',
    })
  ),
  getStructures: jest.fn(() => Promise.resolve([])),
  createStructure: jest.fn(() => Promise.resolve({})),
  generateLink: jest.fn(() => Promise.resolve({ link: 'mock-generated-link' })),
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

describe('Modal Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  test('DetailModal opens and displays crack data', async () => {
    renderWithProviders(<DashboardPage />);

    // Switch to 3D Model Visualization view to see crack list
    fireEvent.click(screen.getByRole('button', { name: /3D Model Visualization/i }));

    // Click on a crack item to open the modal
    await waitFor(() => {
      expect(screen.getByText(/Crack ID: CRK-001/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Crack ID: CRK-001/i));

    // Check if modal is open and displays data
    await waitFor(() => {
      expect(screen.getByText(/Crack Details/i)).toBeInTheDocument();
      expect(screen.getByText(/Details for CRK-001/i)).toBeInTheDocument();
      expect(screen.getByText(/Location: Beam A/i)).toBeInTheDocument();
    });

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Crack Details/i)).not.toBeInTheDocument();
    });
  });

  test('CreateStructureModal opens, allows input, generates link, and submits', async () => {
    renderWithProviders(<DashboardPage />);

    // Switch to Structure Management view
    fireEvent.click(screen.getByRole('button', { name: /Structure Management/i }));

    // Click button to open modal
    await waitFor(() => {
      expect(screen.getByText(/Registered Structures/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Create New Structure/i }));

    // Check if modal is open
    await waitFor(() => {
      expect(screen.getByText(/Create New Structure/i)).toBeInTheDocument();
    });

    // Fill in form
    fireEvent.change(screen.getByPlaceholderText(/Enter structure name/i), {
      target: { value: 'New Building' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter location/i), {
      target: { value: 'Test City' },
    });

    // Generate link
    fireEvent.click(screen.getByRole('button', { name: /Generate Link/i }));
    await waitFor(() => {
      expect(screen.getByDisplayValue(/mock-generated-link/i)).toBeInTheDocument();
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create Structure/i }));

    await waitFor(() => {
      expect(api.createStructure).toHaveBeenCalledWith({
        name: 'New Building',
        location: 'Test City',
        link: 'mock-generated-link',
      });
      expect(screen.queryByText(/Create New Structure/i)).not.toBeInTheDocument(); // Modal closes
    });
  });
});
