import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider, message } from 'antd';
import { ENVIRONMENT } from 'constants/env';
import { server } from 'mocks-server/server';
import { http, HttpResponse } from 'msw';
import { TelemetryFieldKey } from 'types/api/v5/queryRange';

import '@testing-library/jest-dom';

import { DownloadFormats, DownloadRowCounts } from './constants';
import LogsDownloadOptionsMenu from './LogsDownloadOptionsMenu';
import { Mock, vi } from 'vitest';

// Mock antd message (use async factory to import actual module and preserve other exports)
vi.mock('antd', async () => {
	const actual = await vi.importActual('antd');
	return {
		...actual,
		message: {
			success: vi.fn(),
			error: vi.fn(),
		},
	};
});

const TEST_IDS = {
	DOWNLOAD_BUTTON: 'periscope-btn-download-options',
} as const;

interface TestProps {
	startTime: number;
	endTime: number;
	filter: string;
	columns: TelemetryFieldKey[];
	orderBy: string;
}

const createTestProps = (): TestProps => ({
	startTime: 1631234567890,
	endTime: 1631234567999,
	filter: 'status = 200',
	columns: [
		{
			name: 'http.status',
			fieldContext: 'attribute',
			fieldDataType: 'int64',
		} as TelemetryFieldKey,
	],
	orderBy: 'timestamp:desc',
});

const testRenderContent = (props: TestProps): ReturnType<typeof render> =>
	render(
		<ConfigProvider theme={{ token: { motion: false } }}>
			<LogsDownloadOptionsMenu
				startTime={props.startTime}
				endTime={props.endTime}
				filter={props.filter}
				columns={props.columns}
				orderBy={props.orderBy}
			/>
		</ConfigProvider>,
	);

const testSuccessResponse = (): any =>
	HttpResponse.text('id,value\n1,2\n', {
		status: 200,
		headers: {
			'Content-Type': 'application/octet-stream',
			'Content-Disposition': 'attachment; filename="export.csv"'
		}
	});

describe('LogsDownloadOptionsMenu', () => {
	const BASE_URL = ENVIRONMENT.baseURL;
	const EXPORT_URL = `${BASE_URL}/api/v1/export_raw_data`;
	let requestSpy: Mock;
	const setupDefaultServer = (): void => {
		server.use(
			http.get(EXPORT_URL, (req) => {
				const params = new URL(req.request.url).searchParams;
				const payload = {
					start: Number(params.get('start')),
					end: Number(params.get('end')),
					filter: params.get('filter'),
					columns: params.getAll('columns'),
					order_by: params.get('order_by'),
					limit: Number(params.get('limit')),
					format: params.get('format'),
				};
				requestSpy(payload);
				return testSuccessResponse();
			}),
		);
	};

	// Mock URL.createObjectURL used by download logic
	const originalCreateObjectURL = URL.createObjectURL;
	const originalRevokeObjectURL = URL.revokeObjectURL;

	beforeEach(() => {
		requestSpy = vi.fn();
		setupDefaultServer();
		(message.success as Mock).mockReset();
		(message.error as Mock).mockReset();
		// jsdom doesn't implement it by default
		((URL as unknown) as {
			createObjectURL: (b: Blob) => string;
		}).createObjectURL = vi.fn(() => 'blob:mock');
		((URL as unknown) as {
			revokeObjectURL: (u: string) => void;
		}).revokeObjectURL = vi.fn();
	});

	beforeAll(() => {
		server.listen();
	});

	afterEach(() => {
		server.resetHandlers();
	});

	afterAll(() => {
		server.close();
		// restore
		URL.createObjectURL = originalCreateObjectURL;
		URL.revokeObjectURL = originalRevokeObjectURL;
	});

	it('renders download button', () => {
		const props = createTestProps();
		testRenderContent(props);

		const button = screen.getByTestId(TEST_IDS.DOWNLOAD_BUTTON);
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('periscope-btn', 'ghost');
	});

	it('shows popover with export options when download button is clicked', () => {
		const props = createTestProps();
		testRenderContent(props);

		fireEvent.click(screen.getByTestId(TEST_IDS.DOWNLOAD_BUTTON));

		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByText('FORMAT')).toBeInTheDocument();
		expect(screen.getByText('Number of Rows')).toBeInTheDocument();
		expect(screen.getByText('Columns')).toBeInTheDocument();
	});

	it('allows changing export format', () => {
		const props = createTestProps();
		testRenderContent(props);
		fireEvent.click(screen.getByTestId(TEST_IDS.DOWNLOAD_BUTTON));

		const csvRadio = screen.getByRole('radio', { name: 'csv' });
		const jsonlRadio = screen.getByRole('radio', { name: 'jsonl' });

		expect(csvRadio).toBeChecked();
		fireEvent.click(jsonlRadio);
		expect(jsonlRadio).toBeChecked();
		expect(csvRadio).not.toBeChecked();
	});

	it('allows changing row limit', () => {
		const props = createTestProps();
		testRenderContent(props);

		fireEvent.click(screen.getByTestId(TEST_IDS.DOWNLOAD_BUTTON));

		const tenKRadio = screen.getByRole('radio', { name: '10k' });
		const fiftyKRadio = screen.getByRole('radio', { name: '50k' });

		expect(tenKRadio).toBeChecked();
		fireEvent.click(fiftyKRadio);
		expect(fiftyKRadio).toBeChecked();
		expect(tenKRadio).not.toBeChecked();
	});

	it('allows changing columns scope', () => {
		const props = createTestProps();
		testRenderContent(props);
		fireEvent.click(screen.getByTestId(TEST_IDS.DOWNLOAD_BUTTON));

		const allColumnsRadio = screen.getByRole('radio', { name: 'All' });
		const selectedColumnsRadio = screen.getByRole('radio', { name: 'Selected' });

		expect(allColumnsRadio).toBeChecked();
		fireEvent.click(selectedColumnsRadio);
		expect(selectedColumnsRadio).toBeChecked();
		expect(allColumnsRadio).not.toBeChecked();
	});

	it('calls downloadExportData with correct parameters when export button is clicked (Selected columns)', async () => {
		const props = createTestProps();
		testRenderContent(props);
		fireEvent.click(screen.getByTestId(TEST_IDS.DOWNLOAD_BUTTON));
		fireEvent.click(screen.getByRole('radio', { name: 'Selected' }));
		fireEvent.click(screen.getByText('Export'));

		await waitFor(() => {
			expect(requestSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					start: props.startTime,
					end: props.endTime,
					columns: ['attribute.http.status:int64'],
					filter: props.filter,
					order_by: props.orderBy,
					format: DownloadFormats.CSV,
					limit: DownloadRowCounts.TEN_K,
				}),
			);
		});
	});

	it('calls downloadExportData with correct parameters when export button is clicked', async () => {
		const props = createTestProps();
		testRenderContent(props);

		fireEvent.click(screen.getByTestId(TEST_IDS.DOWNLOAD_BUTTON));
		fireEvent.click(screen.getByRole('radio', { name: 'All' }));
		fireEvent.click(screen.getByText('Export'));

		await waitFor(() => {
			expect(requestSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					start: props.startTime,
					end: props.endTime,
					columns: [],
					filter: props.filter,
					order_by: props.orderBy,
					format: DownloadFormats.CSV,
					limit: DownloadRowCounts.TEN_K,
				}),
			);
		});
	});

	it('handles successful export with success message', async () => {
		const props = createTestProps();
		testRenderContent(props);

		fireEvent.click(screen.getByTestId(TEST_IDS.DOWNLOAD_BUTTON));
		fireEvent.click(screen.getByText('Export'));

		await waitFor(() => {
			expect(message.success).toHaveBeenCalledWith(
				'Export completed successfully',
			);
		});
	});

	it('handles export failure with error message', async () => {
		// Override handler to return 500 for this test
		server.use(http.get(EXPORT_URL, () => HttpResponse.json(null, { status: 500 })));
		const props = createTestProps();
		testRenderContent(props);

		fireEvent.click(screen.getByTestId(TEST_IDS.DOWNLOAD_BUTTON));
		fireEvent.click(screen.getByText('Export'));

		await waitFor(() => {
			expect(message.error).toHaveBeenCalledWith(
				'Failed to export logs. Please try again.',
			);
		});
	});

	it('handles UI state correctly during export process', async () => {
		vi.useFakeTimers();
		server.use(
			http.get(EXPORT_URL, () => testSuccessResponse()),
		);
		const props = createTestProps();
		testRenderContent(props);

		// Open popover
		await vi.runAllTimersAsync();
		fireEvent.click(screen.getByTestId(TEST_IDS.DOWNLOAD_BUTTON));
		await vi.runAllTimersAsync();
		expect(screen.getByRole('dialog')).toBeInTheDocument();

		// Start export
		fireEvent.click(screen.getByText('Export'));
		await vi.runAllTimersAsync();

		// Check popover is closed after export starts
		// With destroyTooltipOnHide and fake timers, the popover should be removed after animation
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

		// With fake timers and runAllTimersAsync, the async export completes immediately
		// So we verify the button is enabled after export completes
		expect(screen.getByTestId(TEST_IDS.DOWNLOAD_BUTTON)).not.toBeDisabled();

		vi.useRealTimers();
	});

	it('uses filename from Content-Disposition and triggers download click', async () => {
		server.use(
			http.get(EXPORT_URL, () => HttpResponse.text('row\n', {
				status: 200,
				headers: {
					'Content-Type': 'application/octet-stream',
					'Content-Disposition': 'attachment; filename="report.jsonl"'
				}
			})
		));

		const originalCreateElement = document.createElement.bind(document);
		const anchorEl = originalCreateElement('a') as HTMLAnchorElement;
		const setAttrSpy = vi.spyOn(anchorEl, 'setAttribute');
		const clickSpy = vi.spyOn(anchorEl, 'click');
		const removeSpy = vi.spyOn(anchorEl, 'remove');
		const createElSpy = vi
			.spyOn(document, 'createElement')
			.mockImplementation((tagName: any): any =>
				tagName === 'a' ? anchorEl : originalCreateElement(tagName),
			);
		const appendSpy = vi.spyOn(document.body, 'appendChild');

		const props = createTestProps();
		testRenderContent(props);

		fireEvent.click(screen.getByTestId(TEST_IDS.DOWNLOAD_BUTTON));
		fireEvent.click(screen.getByText('Export'));

		await waitFor(() => {
			expect(appendSpy).toHaveBeenCalledWith(anchorEl);
			expect(setAttrSpy).toHaveBeenCalledWith('download', 'report.jsonl');
			expect(clickSpy).toHaveBeenCalled();
			expect(removeSpy).toHaveBeenCalled();
		});
		expect(anchorEl.getAttribute('download')).toBe('report.jsonl');

		createElSpy.mockRestore();
		appendSpy.mockRestore();
	});
});
