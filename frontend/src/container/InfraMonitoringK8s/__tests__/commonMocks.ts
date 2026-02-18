import * as appContextHooks from 'providers/App/App';
import * as timezoneHooks from 'providers/Timezone';
import { LicenseEvent } from 'types/api/licensesV3/getActive';
import { Mock, vi } from 'vitest';

const setupCommonMocks = (): void => {
	global.IntersectionObserver = vi.fn(class {
		observe = vi.fn();
		unobserve = vi.fn();
		disconnect = vi.fn();
	} as any);
	global.ResizeObserver = vi.fn(
		class {
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
		},
	);

	vi.mock('react-redux', async () => ({
		...(await vi.importActual('react-redux')),
		useSelector: vi.fn(() => ({
			globalTime: {
				selectedTime: {
					startTime: 1713734400000,
					endTime: 1713738000000,
				},
				maxTime: 1713738000000,
				minTime: 1713734400000,
			},
		})),
	}));

	vi.mock('uplot', () => ({
		paths: {
			spline: vi.fn(),
			bars: vi.fn(),
		},
		default: vi.fn(() => ({
			paths: {
				spline: vi.fn(),
				bars: vi.fn(),
			},
		})),
	}));

	vi.mock('react-router-dom-v5-compat', async () => ({
		...(await vi.importActual('react-router-dom-v5-compat')),
		useSearchParams: vi.fn().mockReturnValue([
			{
				get: vi.fn(),
				entries: vi.fn(() => []),
				set: vi.fn(),
			},
			vi.fn(),
		]),
		useNavigationType: (): any => 'PUSH',
	}));

	vi.mock('lib/getMinMax', () => ({
		__esModule: true,
		default: vi.fn().mockImplementation(() => ({
			minTime: 1713734400000,
			maxTime: 1713738000000,
		})),
		isValidShortHandDateTimeFormat: vi.fn().mockReturnValue(true),
	}));

	vi.spyOn(appContextHooks, 'useAppContext').mockReturnValue({
		user: {
			role: 'admin',
		},
		activeLicenseV3: {
			event_queue: {
				created_at: '0',
				event: LicenseEvent.NO_EVENT,
				scheduled_at: '0',
				status: '',
				updated_at: '0',
			},
			license: {
				license_key: 'test-license-key',
				license_type: 'trial',
				org_id: 'test-org-id',
				plan_id: 'test-plan-id',
				plan_name: 'test-plan-name',
				plan_type: 'trial',
				plan_version: 'test-plan-version',
			},
		},
	} as any);

	vi.spyOn(timezoneHooks, 'useTimezone').mockReturnValue({
		timezone: {
			offset: 0,
		},
		browserTimezone: {
			offset: 0,
		},
	} as any);

	vi.mock('hooks/useSafeNavigate', () => ({
		useSafeNavigate: (): any => ({
			safeNavigate: vi.fn(),
		}),
	}));
};

export default setupCommonMocks;
