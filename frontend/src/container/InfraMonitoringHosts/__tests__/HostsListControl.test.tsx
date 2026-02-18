import { render, screen } from '@testing-library/react';

import HostsListControls from '../HostsListControls';
import { vi } from 'vitest';

vi.mock('container/QueryBuilder/filters/QueryBuilderSearch', () => ({
	__esModule: true,
	default: (): JSX.Element => (
		<div data-testid="query-builder-search">Search</div>
	),
}));

vi.mock('container/TopNav/DateTimeSelectionV2', () => ({
	__esModule: true,
	default: (): JSX.Element => (
		<div data-testid="date-time-selection">Date Time</div>
	),
}));

describe('HostsListControls', () => {
	const mockHandleFiltersChange = vi.fn();
	const mockFilters = {
		items: [],
		op: 'AND',
	};

	it('renders search and date time filters', () => {
		render(
			<HostsListControls
				handleFiltersChange={mockHandleFiltersChange}
				filters={mockFilters}
				showAutoRefresh={false}
			/>,
		);

		expect(screen.getByTestId('query-builder-search')).toBeInTheDocument();
		expect(screen.getByTestId('date-time-selection')).toBeInTheDocument();
	});
});