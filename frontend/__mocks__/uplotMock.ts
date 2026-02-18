import { vi } from 'vitest';
/* eslint-disable @typescript-eslint/no-unused-vars */

// Mock for uplot library used in tests
export interface MockUPlotInstance {
	setData: vi.Mock;
	setSize: vi.Mock;
	destroy: vi.Mock;
	redraw: vi.Mock;
	setSeries: vi.Mock;
}

export interface MockUPlotPaths {
	spline: vi.Mock;
	bars: vi.Mock;
}

// Create mock instance methods
const createMockUPlotInstance = (): MockUPlotInstance => ({
	setData: vi.fn(),
	setSize: vi.fn(),
	destroy: vi.fn(),
	redraw: vi.fn(),
	setSeries: vi.fn(),
});

// Create mock paths
const mockPaths: MockUPlotPaths = {
	spline: vi.fn(),
	bars: vi.fn(),
};

// Mock static methods
const mockTzDate = vi.fn(
	(date: Date, _timezone: string) => new Date(date.getTime()),
);

// Mock uPlot constructor - this needs to be a proper constructor function
function MockUPlot(
	_options: unknown,
	_data: unknown,
	_target: HTMLElement,
): MockUPlotInstance {
	return createMockUPlotInstance();
}

// Add static methods to the constructor
MockUPlot.tzDate = mockTzDate;
MockUPlot.paths = mockPaths;

// Export the constructor as default
export default MockUPlot;
