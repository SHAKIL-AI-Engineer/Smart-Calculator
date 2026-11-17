import { StrictMode } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { HISTORY_KEY } from '../storage/localHistoryRepository';
afterEach(() => vi.restoreAllMocks());
const display = () => screen.getByLabelText('Calculator display');
const history = () => screen.getByRole('complementary');
describe('complete calculator flows', () => {
  it('calculates via clicks, saves once in StrictMode, restores on remount, and clears', async () => {
    const user = userEvent.setup();
    const view = render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: 'Equals' }));
    expect(display()).toHaveTextContent('3');
    expect(within(history()).getAllByRole('listitem')).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(HISTORY_KEY)!)).toHaveLength(1);
    view.unmount();
    render(<App />);
    expect(within(history()).getByText('= 3')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear history' }));
    expect(within(history()).getByText('A fresh start.')).toBeInTheDocument();
    expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
  });
  it('supports decimal keyboard arithmetic, backspace, sign, clear, and controlled errors', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.keyboard('0.1+0.2{Enter}');
    expect(display()).toHaveTextContent('0.3');
    await user.keyboard('{Escape}12{Backspace}n*3=');
    expect(display()).toHaveTextContent('-3');
    await user.keyboard('{Escape}5/0=');
    expect(screen.getByText('Cannot divide by zero.')).toBeInTheDocument();
    expect(within(history()).getAllByRole('listitem')).toHaveLength(2);
    await user.keyboard('2=');
    expect(display()).toHaveTextContent('2.5');
  });
  it('preserves Enter activation for a focused native button', async () => {
    const user = userEvent.setup();
    render(<App />);
    const one = screen.getByRole('button', { name: '1' });
    one.focus();
    await user.keyboard('{Enter}');
    expect(display()).toHaveTextContent('1');
    expect(
      screen.queryByText('Enter two numbers and choose an operator.'),
    ).not.toBeInTheDocument();
  });
  it('keeps calculating when localStorage fails', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw Error('denied');
    });
    const user = userEvent.setup();
    render(<App />);
    await user.keyboard('2+2=');
    expect(display()).toHaveTextContent('4');
    expect(within(history()).getByText('= 4')).toBeInTheDocument();
    expect(
      screen.getByText(/History storage is unavailable/),
    ).toBeInTheDocument();
  });
  it('switches themes using an accessible control', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Use dark theme' }));
    expect(
      screen.getByRole('button', { name: 'Use light theme' }),
    ).toBeInTheDocument();
  });
});
