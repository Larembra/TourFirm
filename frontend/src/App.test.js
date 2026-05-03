import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders the tourist firm home page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /рабочее место туристической фирмы/i })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /авторизоваться/i }).length).toBeGreaterThanOrEqual(1);
});

test('opens the auth placeholder and logs in as the demo leader', async () => {
  render(<App />);

  await userEvent.click(screen.getAllByRole('button', { name: /авторизоваться/i })[0]);
  expect(screen.getByRole('heading', { name: /авторизация/i })).toBeInTheDocument();

  // submit the demo login (the form has a primary submit button labeled /войти/i)
  await userEvent.click(screen.getByRole('button', { name: /войти/i }));
  expect(screen.getByRole('heading', { name: /марина соколова/i })).toBeInTheDocument();
});
