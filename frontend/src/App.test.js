import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders the tourist firm home page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /рабочее место туристической фирмы/i })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /авторизоваться/i })).toHaveLength(2);
});

test('opens the auth placeholder and logs in as the demo leader', async () => {
  render(<App />);

  await userEvent.click(screen.getAllByRole('button', { name: /авторизоваться/i })[1]);
  expect(screen.getByRole('heading', { name: /авторизация и регистрация/i })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /войти как руководитель/i }));
  expect(screen.getByRole('heading', { name: /марина соколова/i })).toBeInTheDocument();
});
