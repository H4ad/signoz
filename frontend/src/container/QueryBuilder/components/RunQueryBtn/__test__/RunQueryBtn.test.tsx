// frontend/src/container/QueryBuilder/components/RunQueryBtn/__tests__/RunQueryBtn.test.tsx
import { vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import RunQueryBtn from '../RunQueryBtn';

vi.mock('react-query', async () => {
	const actual = await vi.importActual('react-query');
	return {
		...actual,
		useIsFetching: vi.fn(),
		useQueryClient: vi.fn(),
	};
});
import { useIsFetching, useQueryClient } from 'react-query';

// Mock OS util
vi.mock('utils/getUserOS', () => ({
	getUserOperatingSystem: vi.fn(),
	UserOperatingSystem: { MACOS: 'mac', WINDOWS: 'win', LINUX: 'linux' },
}));
import { getUserOperatingSystem, UserOperatingSystem } from 'utils/getUserOS';

describe('RunQueryBtn', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		(getUserOperatingSystem as ReturnType<typeof vi.fn>).mockReturnValue(
			UserOperatingSystem.MACOS,
		);
		(useIsFetching as ReturnType<typeof vi.fn>).mockReturnValue(0);
		(useQueryClient as ReturnType<typeof vi.fn>).mockReturnValue({
			cancelQueries: vi.fn(),
		});
	});

	test('uses isLoadingQueries prop over useIsFetching', () => {
		// Simulate fetching but prop forces not loading
		(useIsFetching as ReturnType<typeof vi.fn>).mockReturnValue(1);
		const onRun = vi.fn();
		render(<RunQueryBtn onStageRunQuery={onRun} isLoadingQueries={false} />);
		// Should show "Run Query" (not cancel)
		const runBtn = screen.getByRole('button', { name: /run query/i });
		expect(runBtn).toBeInTheDocument();
		expect(runBtn).toBeEnabled();
	});

	test('fallback cancel: uses handleCancelQuery when no key provided', () => {
		(useIsFetching as ReturnType<typeof vi.fn>).mockReturnValue(0);
		const cancelQueries = vi.fn();
		(useQueryClient as ReturnType<typeof vi.fn>).mockReturnValue({
			cancelQueries,
		});

		const onCancel = vi.fn();
		render(<RunQueryBtn isLoadingQueries handleCancelQuery={onCancel} />);

		const cancelBtn = screen.getByRole('button', { name: /cancel/i });
		fireEvent.click(cancelBtn);
		expect(onCancel).toHaveBeenCalledTimes(1);
		expect(cancelQueries).not.toHaveBeenCalled();
	});

	test('renders run state and triggers on click', () => {
		const onRun = vi.fn();
		render(<RunQueryBtn onStageRunQuery={onRun} />);
		const btn = screen.getByRole('button', { name: /run query/i });
		expect(btn).toBeEnabled();
		fireEvent.click(btn);
		expect(onRun).toHaveBeenCalledTimes(1);
	});

	test('disabled when onStageRunQuery is undefined', () => {
		render(<RunQueryBtn />);
		expect(screen.getByRole('button', { name: /run query/i })).toBeDisabled();
	});

	test('shows cancel state and calls handleCancelQuery', () => {
		const onCancel = vi.fn();
		render(<RunQueryBtn isLoadingQueries handleCancelQuery={onCancel} />);
		const cancel = screen.getByRole('button', { name: /cancel/i });
		fireEvent.click(cancel);
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	test('derives loading from queryKey via useIsFetching and cancels via queryClient', () => {
		(useIsFetching as ReturnType<typeof vi.fn>).mockReturnValue(1);
		const cancelQueries = vi.fn();
		(useQueryClient as ReturnType<typeof vi.fn>).mockReturnValue({
			cancelQueries,
		});

		const queryKey = ['GET_QUERY_RANGE', '1h', { some: 'req' }, 1, 2];
		render(<RunQueryBtn queryRangeKey={queryKey} />);

		// Button switches to cancel state
		const cancelBtn = screen.getByRole('button', { name: /cancel/i });
		expect(cancelBtn).toBeInTheDocument();

		// Clicking cancel calls cancelQueries with the key
		fireEvent.click(cancelBtn);
		expect(cancelQueries).toHaveBeenCalledWith(queryKey);
	});

	test('shows Command + CornerDownLeft on mac', () => {
		const { container } = render(
			<RunQueryBtn onStageRunQuery={(): void => {}} />,
		);
		expect(container.querySelector('.lucide-command')).toBeInTheDocument();
		expect(
			container.querySelector('.lucide-corner-down-left'),
		).toBeInTheDocument();
	});

	test('shows ChevronUp + CornerDownLeft on non-mac', () => {
		(getUserOperatingSystem as ReturnType<typeof vi.fn>).mockReturnValue(
			UserOperatingSystem.WINDOWS,
		);
		const { container } = render(
			<RunQueryBtn onStageRunQuery={(): void => {}} />,
		);
		expect(container.querySelector('.lucide-chevron-up')).toBeInTheDocument();
		expect(container.querySelector('.lucide-command')).not.toBeInTheDocument();
		expect(
			container.querySelector('.lucide-corner-down-left'),
		).toBeInTheDocument();
	});

	test('renders custom label when provided', () => {
		const onRun = vi.fn();
		render(<RunQueryBtn onStageRunQuery={onRun} label="Stage & Run Query" />);
		expect(
			screen.getByRole('button', { name: /stage & run query/i }),
		).toBeInTheDocument();
	});
});
