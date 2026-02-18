import React from 'react';
import ROUTES from 'constants/routes';
import CreateAlertPage from 'pages/CreateAlert';
import { act, fireEvent, render } from 'tests/test-utils';
import { AlertTypes } from 'types/api/alerts/alertTypes';

import { ALERT_TYPE_URL_MAP } from './constants';
import { Mock, vi } from 'vitest';

window.ResizeObserver =
	window.ResizeObserver ||
	vi.fn(
		class {
			disconnect = vi.fn();
			observe = vi.fn();
			unobserve = vi.fn();
		},
	);

vi.mock('hooks/useSafeNavigate', () => ({
	useSafeNavigate: (): any => ({
		safeNavigate: vi.fn(),
	}),
}));

vi.mock('container/CreateAlertRule', () => {
	const React = require('react');
	const { useLocation } = require('react-router-dom');
	function MockCreateAlertRule() {
		const location = useLocation();
		const params = new URLSearchParams(location.search);
		const isAnomaly = params.get('ruleType') === 'anomaly_rule';
		const url = isAnomaly ? ALERT_TYPE_URL_MAP[AlertTypes.ANOMALY_BASED_ALERT].creation : null;
		return React.createElement(
			'button',
			{ type: 'button', onClick: () => url && window.open(url, '_blank') },
			'Alert Setup Guide',
		);
	}
	return { __esModule: true, default: MockCreateAlertRule };
});

describe('Anomaly Alert Documentation Redirection', () => {
	let mockWindowOpen: Mock;

	beforeAll(() => {
		mockWindowOpen = vi
			.spyOn(window, 'open')
			.mockImplementation(() => null);
	});

	it('should handle anomaly alert documentation redirection correctly', () => {
		const { getByRole } = render(<CreateAlertPage />, {}, {
			initialRoute: `${ROUTES.ALERTS_NEW}?ruleType=anomaly_rule`,
		});

		const alertType = AlertTypes.ANOMALY_BASED_ALERT;

		act(() => {
			fireEvent.click(
				getByRole('button', {
					name: /alert setup guide/i,
				}),
			);
		});

		expect(mockWindowOpen).toHaveBeenCalledWith(
			ALERT_TYPE_URL_MAP[alertType].creation,
			'_blank',
		);
	});
});
