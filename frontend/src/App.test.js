import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { demoUser } from './data/mockData';

test('renders the tourist firm home page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /рабочее место туристической фирмы/i })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /авторизоваться/i }).length).toBeGreaterThanOrEqual(1);
});

test('opens the auth placeholder and logs in as the demo leader', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockImplementation((url) => {
    if (String(url).includes('/api/auth/login')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ access_token: 'demo-token', user: demoUser }),
      });
    }
    return Promise.resolve({ ok: false, json: async () => ({}) });
  });

  render(<App />);

  await userEvent.click(screen.getAllByRole('button', { name: /авторизоваться/i })[0]);
  expect(screen.getByRole('heading', { name: /авторизация/i })).toBeInTheDocument();

  await userEvent.type(screen.getByLabelText(/email/i), demoUser.email);
  await userEvent.type(screen.getByLabelText(/пароль/i), 'demo-password');
  // submit the demo login (the form has a primary submit button labeled /войти/i)
  await userEvent.click(screen.getByRole('button', { name: /войти/i }));
  expect(await screen.findByRole('heading', { name: /марина соколова/i })).toBeInTheDocument();

  fetchMock.mockRestore();
});
