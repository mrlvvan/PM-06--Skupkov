import { render, screen } from '@testing-library/react';
import App from './App';

test('renders auth screen title', () => {
  render(<App />);
  expect(screen.getByText(/Лабораторная работа 1/i)).toBeInTheDocument();
});
