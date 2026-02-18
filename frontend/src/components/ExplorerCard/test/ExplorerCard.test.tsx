import { render, screen } from '@testing-library/react';
import ROUTES from 'constants/routes';
import { PreferenceContextProvider } from 'providers/preferences/context/PreferenceContextProvider';
import MockQueryClientProvider from 'providers/test/MockQueryClientProvider';
import { DataSource } from 'types/common/queryBuilder';

import { viewMockData } from '../__mock__/viewData';
import ExplorerCard from '../ExplorerCard';
import { vi } from 'vitest';

const historyReplace = vi.fn();

// eslint-disable-next-line sonarjs/no-duplicate-string
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useLocation: (): { pathname: string } => ({
			pathname: `${process.env.FRONTEND_API_ENDPOINT}/${ROUTES.TRACES_EXPLORER}/`,
		}),
		useHistory: (): any => ({
			...(actual as any).useHistory(),
			replace: historyReplace,
		}),
	};
});

vi.mock('hooks/useSafeNavigate', () => ({
	useSafeNavigate: (): any => ({
		safeNavigate: vi.fn(),
	}),
}));

vi.mock('hooks/queryBuilder/useGetPanelTypesQueryParam', () => ({
	useGetPanelTypesQueryParam: vi.fn(() => 'mockedPanelType'),
}));

vi.mock('hooks/saveViews/useGetAllViews', () => ({
	useGetAllViews: vi.fn(() => ({
		data: { data: { data: viewMockData } },
		isLoading: false,
		error: null,
		isRefetching: false,
		refetch: vi.fn(),
	})),
}));

vi.mock('hooks/saveViews/useUpdateView', () => ({
	useUpdateView: vi.fn(() => ({
		mutateAsync: vi.fn(),
	})),
}));

vi.mock('hooks/saveViews/useDeleteView', () => ({
	useDeleteView: vi.fn(() => ({
		mutateAsync: vi.fn(),
	})),
}));

// Mock usePreferenceSync
vi.mock('providers/preferences/sync/usePreferenceSync', () => ({
	usePreferenceSync: (): any => ({
		preferences: {
			columns: [],
			formatting: {
				maxLines: 1,
				format: 'table',
				fontSize: 'small',
				version: 1,
			},
		},
		loading: false,
		error: null,
		updateColumns: vi.fn(),
		updateFormatting: vi.fn(),
	}),
}));

describe('ExplorerCard', () => {
	it('renders a card with a title and a description', () => {
		render(
			<MockQueryClientProvider>
				<PreferenceContextProvider>
					<ExplorerCard sourcepage={DataSource.TRACES}>child</ExplorerCard>
				</PreferenceContextProvider>
			</MockQueryClientProvider>,
		);
		expect(screen.queryByText('Query Builder')).not.toBeInTheDocument();
	});

	it('renders a save view button', () => {
		render(
			<MockQueryClientProvider>
				<PreferenceContextProvider>
					<ExplorerCard sourcepage={DataSource.TRACES}>child</ExplorerCard>
				</PreferenceContextProvider>
			</MockQueryClientProvider>,
		);
		expect(screen.queryByText('Save view')).not.toBeInTheDocument();
	});
});