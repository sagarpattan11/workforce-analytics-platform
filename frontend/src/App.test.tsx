import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppThemeProvider } from './theme/ThemeContext';
import { AppRoutes } from './routes/AppRoutes';
import { LoadingState } from './components/feedback/LoadingState';
import { EmptyState } from './components/feedback/EmptyState';
import { AccessDeniedState } from './components/feedback/AccessDeniedState';
import { NotFoundPage } from './components/feedback/NotFoundPage';

describe('Workforce Analytics Platform - Day 1 & Day 2 Tests', () => {
  it('renders application with sidebar and dashboard title', () => {
    render(
      <AppThemeProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppRoutes />
        </MemoryRouter>
      </AppThemeProvider>
    );

    // Checks header & sidebar title
    expect(screen.getAllByText(/Workforce/i).length).toBeGreaterThan(0);
    // Checks dashboard page title
    expect(screen.getByText('Workforce Dashboard')).toBeInTheDocument();
  });

  it('renders employee directory route', () => {
    render(
      <AppThemeProvider>
        <MemoryRouter initialEntries={['/employees']}>
          <AppRoutes />
        </MemoryRouter>
      </AppThemeProvider>
    );

    expect(screen.getByText('Employee Directory')).toBeInTheDocument();
  });

  it('renders 403 Access Denied feedback page', () => {
    render(
      <AppThemeProvider>
        <AccessDeniedState />
      </AppThemeProvider>
    );

    expect(screen.getByText(/403 - Access Denied/i)).toBeInTheDocument();
  });

  it('renders 404 Not Found feedback page', () => {
    render(
      <AppThemeProvider>
        <MemoryRouter initialEntries={['/some-unmapped-route']}>
          <NotFoundPage />
        </MemoryRouter>
      </AppThemeProvider>
    );

    expect(screen.getByText(/404 - Page Not Found/i)).toBeInTheDocument();
  });

  it('renders loading feedback component', () => {
    render(
      <AppThemeProvider>
        <LoadingState message="Fetching workforce data..." />
      </AppThemeProvider>
    );

    expect(screen.getByText('Fetching workforce data...')).toBeInTheDocument();
  });

  it('renders empty feedback state component', () => {
    render(
      <AppThemeProvider>
        <EmptyState title="No Employees Found" description="Try adjusting search criteria." />
      </AppThemeProvider>
    );

    expect(screen.getByText('No Employees Found')).toBeInTheDocument();
  });
});
