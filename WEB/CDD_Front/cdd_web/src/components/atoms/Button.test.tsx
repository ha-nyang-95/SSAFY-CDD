
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  test('renders with default variant and size', () => {
    render(<Button>Test Button</Button>);
    const buttonElement = screen.getByText(/Test Button/i);
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveStyle('background-color: #0A3D62'); // primary color
    // Check for default size styles (e.g., padding, font-size) if easily testable
  });

  test('renders with primary variant', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const buttonElement = screen.getByText(/Primary Button/i);
    expect(buttonElement).toHaveStyle('background-color: #0A3D62');
  });

  test('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const buttonElement = screen.getByText(/Secondary Button/i);
    expect(buttonElement).toHaveStyle('background-color: #F1F2F6');
  });

  test('renders with danger variant', () => {
    render(<Button variant="danger">Danger Button</Button>);
    const buttonElement = screen.getByText(/Danger Button/i);
    expect(buttonElement).toHaveStyle('background-color: #E74C3C');
  });

  test('renders with nav variant', () => {
    render(<Button variant="nav">Nav Button</Button>);
    const buttonElement = screen.getByText(/Nav Button/i);
    expect(buttonElement).toHaveStyle('background-color: transparent');
  });

  test('renders with auth variant', () => {
    render(<Button variant="auth">Auth Button</Button>);
    const buttonElement = screen.getByText(/Auth Button/i);
    expect(buttonElement).toHaveStyle('background-color: #0A3D62');
  });

  test('renders with switch-auth variant', () => {
    render(<Button variant="switch-auth">Switch Auth Button</Button>);
    const buttonElement = screen.getByText(/Switch Auth Button/i);
    expect(buttonElement).toHaveStyle('background-color: transparent');
  });

  test('renders with sm size', () => {
    render(<Button size="sm">Small Button</Button>);
    const buttonElement = screen.getByText(/Small Button/i);
    // Check for specific size styles if possible, e.g., font-size or padding
    expect(buttonElement).toHaveStyle('font-size: 0.75rem');
  });

  test('renders with lg size', () => {
    render(<Button size="lg">Large Button</Button>);
    const buttonElement = screen.getByText(/Large Button/i);
    expect(buttonElement).toHaveStyle('font-size: 1.1rem');
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText(/Click Me/i));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
    const buttonElement = screen.getByText(/Disabled Button/i);
    expect(buttonElement).toBeDisabled();
    fireEvent.click(buttonElement);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
