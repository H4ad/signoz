import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import store from 'store';

import MetricsTreemap from '../MetricsTreemap';
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

const mockData = [
	{
		metric_name: 'Metric 1',
		percentage: 0.5,
		total_value: 15,
	},
	{
		metric_name: 'Metric 2',
		percentage: 0.6,
		total_value: 10,
	},
];

describe('MetricsTreemap', () => {
	it('renders treemap with data correctly', () => {
		render(
			<MemoryRouter>
				<Provider store={store}>
					<MetricsTreemap
						isLoading={false}
						isError={false}
						data={{
							status: 'success',
							data: {
								timeseries: [mockData[0]],
								samples: [mockData[1]],
							},
						}}
						openMetricDetails={vi.fn()}
						viewType={TreemapViewType.SAMPLES}
						setHeatmapView={vi.fn()}
					/>
				</Provider>
			</MemoryRouter>,
		);

		expect(screen.getByText('Proportion View')).toBeInTheDocument();
	});

	it('shows loading state', () => {
		render(
			<MemoryRouter>
				<Provider store={store}>
					<MetricsTreemap
						isLoading
						isError={false}
						data={{
							status: 'success',
							data: {
								timeseries: [mockData[0]],
								samples: [mockData[1]],
							},
						}}
						openMetricDetails={vi.fn()}
						viewType={TreemapViewType.SAMPLES}
						setHeatmapView={vi.fn()}
					/>
				</Provider>
			</MemoryRouter>,
		);

		expect(
			screen.getByTestId('metrics-treemap-loading-state'),
		).toBeInTheDocument();
	});

	it('shows error state', () => {
		render(
			<MemoryRouter>
				<Provider store={store}>
					<MetricsTreemap
						isLoading={false}
						isError
						data={{
							status: 'success',
							data: {
								timeseries: [mockData[0]],
								samples: [mockData[1]],
							},
						}}
						openMetricDetails={vi.fn()}
						viewType={TreemapViewType.SAMPLES}
						setHeatmapView={vi.fn()}
					/>
				</Provider>
			</MemoryRouter>,
		);

		expect(screen.getByTestId('metrics-treemap-error-state')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Error fetching metrics. If the problem persists, please contact support.',
			),
		).toBeInTheDocument();
	});

	it('shows empty state when no data', () => {
		render(
			<MemoryRouter>
				<Provider store={store}>
					<MetricsTreemap
						isLoading={false}
						isError={false}
						data={null}
						openMetricDetails={vi.fn()}
						viewType={TreemapViewType.SAMPLES}
						setHeatmapView={vi.fn()}
					/>
				</Provider>
			</MemoryRouter>,
		);

		expect(screen.getByTestId('metrics-treemap-empty-state')).toBeInTheDocument();
		expect(screen.getByText('No metrics found')).toBeInTheDocument();
	});
});
