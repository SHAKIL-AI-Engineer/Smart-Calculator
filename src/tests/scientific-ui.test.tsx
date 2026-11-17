import { StrictMode } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { SCIENTIFIC_KEY } from '../storage/scientificRepository';
afterEach(() => vi.restoreAllMocks());
const expression = () => screen.getByRole('textbox', { name: 'Expression' });
const result = () => screen.getByLabelText('Calculator display');
async function calculate(
  text: string,
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.clear(expression());
  await user.type(expression(), text + '{Enter}');
}
describe('scientific workspace', () => {
  it('evaluates typed expressions and stores one entry in StrictMode', async () => {
    const user = userEvent.setup();
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    await calculate('2+3*4', user);
    expect(result()).toHaveTextContent('14');
    expect(
      screen.getByRole('button', { name: 'Replay 2+3*4' }),
    ).toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem(SCIENTIFIC_KEY)!).history,
    ).toHaveLength(1);
  });
  it('supports DEG/RAD, editable errors, and memory', async () => {
    const user = userEvent.setup();
    render(<App />);
    await calculate('sin(30)', user);
    expect(result()).toHaveTextContent('0.5');
    await user.click(screen.getByRole('button', { name: 'Store in memory' }));
    await user.click(screen.getByRole('button', { name: 'RAD' }));
    await calculate('sin(pi/2)', user);
    expect(result()).toHaveTextContent('1');
    await user.click(screen.getByRole('button', { name: 'All clear' }));
    await user.click(screen.getByRole('button', { name: 'Recall memory' }));
    expect(expression()).toHaveValue('(0.5)');
    await calculate('sqrt(-9)', user);
    expect(
      screen.getByText('Square root requires a non-negative value.'),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Replay sqrt(-9)' }),
    ).not.toBeInTheDocument();
    await calculate('sqrt(9)', user);
    expect(result()).toHaveTextContent('3');
  });
  it('supports keypad functions applied to an existing expression', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '9' }));
    await user.click(screen.getByRole('button', { name: 'Square root' }));
    await user.click(screen.getByRole('button', { name: 'Equals' }));
    expect(result()).toHaveTextContent('3');
  });
  it('searches, pins, replays with Ans context, deletes, and clears history', async () => {
    const user = userEvent.setup();
    render(<App />);
    await calculate('5', user);
    await calculate('Ans+2', user);
    await calculate('99', user);
    await user.click(screen.getByRole('button', { name: 'Pin Ans+2' }));
    await user.click(screen.getByRole('button', { name: 'Pinned' }));
    expect(
      screen.queryByRole('button', { name: 'Replay 99' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Replay Ans+2' }));
    await user.click(screen.getByRole('button', { name: 'Equals' }));
    expect(result()).toHaveTextContent('7');
    await user.click(screen.getByRole('button', { name: 'All' }));
    await user.type(screen.getByRole('searchbox'), '99');
    expect(
      screen.queryByRole('button', { name: 'Replay 5' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete 99' }));
    expect(screen.getByText('No matching calculations')).toBeVisible();
    await user.clear(screen.getByRole('searchbox'));
    await user.click(screen.getByRole('button', { name: 'Clear history' }));
    await user.click(screen.getByRole('button', { name: 'Delete all' }));
    expect(
      JSON.parse(localStorage.getItem(SCIENTIFIC_KEY)!).history,
    ).toHaveLength(0);
  });
  it('persists precision, memory, angle, theme, animation, and history across remount', async () => {
    const user = userEvent.setup();
    const view = render(<App />);
    await calculate('1/3', user);
    await user.click(screen.getByRole('button', { name: 'Store in memory' }));
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Result precision' }),
      '8',
    );
    await user.click(
      screen.getByRole('checkbox', { name: 'Enable animations' }),
    );
    await user.click(screen.getByRole('button', { name: 'Use light theme' }));
    await user.click(screen.getByRole('button', { name: 'RAD' }));
    expect(result()).toHaveTextContent('0.33333333');
    view.unmount();
    render(<App />);
    expect(
      screen.getByRole('button', { name: 'Use dark theme' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'RAD' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      screen.getByRole('button', { name: 'Replay 1/3' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Recall memory' }));
    expect(expression()).toHaveValue('(0.333333333333333333333333)');
  });
  it('keeps calculating with blocked storage', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw Error('denied');
    });
    const user = userEvent.setup();
    render(<App />);
    await calculate('2^3^2', user);
    expect(result()).toHaveTextContent('512');
    expect(screen.getByText(/Browser storage is unavailable/)).toBeVisible();
  });
  it('exports successful records as JSON', async () => {
    const create = vi.fn(() => 'blob:history');
    const revoke = vi.fn();
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }),
    );
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    const user = userEvent.setup();
    render(<App />);
    await calculate('5!', user);
    await user.click(screen.getByRole('button', { name: 'Export ↗' }));
    expect(create).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
