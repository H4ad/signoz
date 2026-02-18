import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { useSearchParams } from 'react-router-dom-v5-compat';
import { MetricType } from 'api/metricsExplorer/getMetricsList';
import ROUTES from 'constants/routes';
import * as useGetMetricsListHooks from 'hooks/metricsExplorer/useGetMetricsList';
import * as useGetMetricsTreeMapHooks from 'hooks/metricsExplorer/useGetMetricsTreeMap';
import store from 'store';
import { render, screen } from 'tests/test-utils';

import Summary from '../Summary';
import { TreemapViewType } from '../types';

vi.mock('d3-hierarchy', () => ({
	stratify: vi.fn().mockReturnValue({
		id: vi.fn().mockReturnValue({
			parentId: vi.fn().mockReturnValue(
				vi.fn().mockReturnValue({
					sum: vi.fn().mockReturnValue({
						descendants: vi.fn().mockReturnValue([]),
						eachBefore: vi.fn().mockReturnValue([]),
					}),
				}),
			),
		}),
	}),
	treemapBinary: vi.fn(),
}));

vi.mock('react-use', () => ({
	useWindowSize: vi.fn().mockReturnValue({ width: 1000, height: 1000 }),
}));

vi.mock('react-router-dom-v5-compat', async () => {
	const actual = await vi.importActual<any>('react-router-dom-v5-compat');
	return {
		...actual,
		useNavigate: vi.fn(),
		useLocation: (): { pathname: string } => ({
			pathname: `${ROUTES.METRICS_EXPLORER_BASE}`,
		}),
		useSearchParams: vi.fn(),
		useNavigationType: (): any => 'PUSH',
	};
});
vi.mock('react-router-dom', async () => ({
	...(await vi.importActual<any>('react-router-dom')),
	useLocation: (): { pathname: string } => ({
		pathname: `${ROUTES.METRICS_EXPLORER_BASE}`,
	}),
}));

const queryClient = new QueryClient();
const mockMetricName = 'test-metric';
vi.spyOn(useGetMetricsListHooks, 'useGetMetricsList').mockReturnValue({
	data: {
		payload: {
			status: 'success',
			data: {
				metrics: [
					{
						metric_name: mockMetricName,
						description: 'description for a test metric',
						type: MetricType.GAUGE,
						unit: 'count',
						lastReceived: '1715702400',
						[TreemapViewType.TIMESERIES]: 100,
						[TreemapViewType.SAMPLES]: 100,
					},
				],
			},
		},
	},
	isError: false,
	isLoading: false,
} as any);
vi.spyOn(useGetMetricsTreeMapHooks, 'useGetMetricsTreeMap').mockReturnValue({
	data: {
		payload: {
			status: 'success',
			data: {
				[TreemapViewType.TIMESERIES]: [
					{
						metric_name: mockMetricName,
						percentage: 100,
						total_value: 100,
					},
				],
				[TreemapViewType.SAMPLES]: [
					{
						metric_name: mockMetricName,
						percentage: 100,
					},
				],
			},
		},
	},
	isError: false,
	isLoading: false,
} as any);
const mockSetSearchParams = vi.fn();

describe('Summary', () => {
	it('persists inspect modal open state across page refresh', () => {
		(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
			new URLSearchParams({
				isInspectModalOpen: 'true',
				selectedMetricName: 'test-metric',
			}),
			mockSetSearchParams,
		]);

		render(
			<QueryClientProvider client={queryClient}>
				<Provider store={store}>
					<Summary />
				</Provider>
			</QueryClientProvider>,
		);

		expect(screen.queryByText('Proportion View')).not.toBeInTheDocument();
	});

	it('persists metric details modal state across page refresh', () => {
		(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
			new URLSearchParams({
				isMetricDetailsOpen: 'true',
				selectedMetricName: mockMetricName,
			}),
			mockSetSearchParams,
		]);

		render(
			<QueryClientProvider client={queryClient}>
				<Provider store={store}>
					<Summary />
				</Provider>
			</QueryClientProvider>,
		);

		expect(screen.queryByText('Proportion View')).not.toBeInTheDocument();
	});
});
