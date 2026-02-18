import { http, HttpResponse } from 'msw';

import commonEnTranslation from '../../public/locales/en/common.json';
import enTranslation from '../../public/locales/en/translation.json';
import { allAlertChannels } from './__mockdata__/alerts';
import { billingSuccessResponse } from './__mockdata__/billing';
import {
	dashboardSuccessResponse,
	getDashboardById,
} from './__mockdata__/dashboards';
import { explorerView } from './__mockdata__/explorer_views';
import { inviteUser } from './__mockdata__/invite_user';
import { licensesSuccessResponse } from './__mockdata__/licenses';
import { membersResponse } from './__mockdata__/members';
import { queryRangeSuccessResponse } from './__mockdata__/query_range';
import { serviceSuccessResponse } from './__mockdata__/services';
import { topLevelOperationSuccessResponse } from './__mockdata__/top_level_operations';
import { traceDetailResponse } from './__mockdata__/tracedetail';

export const handlers = [
	http.post('/api/v3/query_range', () => {
		return HttpResponse.json(queryRangeSuccessResponse, { status: 200 });
	}),

	http.post('/api/v4/query_range', () => {
		return HttpResponse.json(queryRangeSuccessResponse, { status: 200 });
	}),

	http.post('/api/v2/services', () => {
		return HttpResponse.json(
			{ status: 'success', data: serviceSuccessResponse },
			{ status: 200 },
		);
	}),

	http.post('/api/v1/service/top_level_operations', () => {
		return HttpResponse.json(topLevelOperationSuccessResponse, { status: 200 });
	}),

	http.get('/api/v1/user', () => {
		return HttpResponse.json({ status: '200', data: membersResponse }, { status: 200 });
	}),
	http.get(
		'/api/v3/autocomplete/attribute_keys',
		({ request }) => {
			let req = request;
			const metricName = new URL(req.url).searchParams.get('metricName');
			const match = new URL(req.url).searchParams.get('match');

			if (metricName === 'signoz_calls_total' && match === 'resource_') {
				return HttpResponse.json(
					{ status: 'success', data: ['resource_signoz_collector_id'] },
					{ status: 200 },
				);
			}

			return HttpResponse.text('', { status: 500 });
		},
	),

	http.get(
		'/api/v3/autocomplete/attribute_values',
		({ request }) => {
			let req = request;
			// ?metricName=signoz_calls_total&tagKey=resource_signoz_collector_id
			const metricName = new URL(req.url).searchParams.get('metricName');
			const tagKey = new URL(req.url).searchParams.get('tagKey');

			const attributeKey = new URL(req.url).searchParams.get('attributeKey');

			if (attributeKey === 'serviceName') {
				return HttpResponse.json(
					{
						status: 'success',
						data: {
							stringAttributeValues: [
								'customer',
								'demo-app',
								'driver',
								'frontend',
								'mysql',
								'redis',
								'route',
								'go-grpc-otel-server',
								'test',
							],
							numberAttributeValues: null,
							boolAttributeValues: null,
						},
					},
					{ status: 200 },
				);
			}

			if (attributeKey === 'name') {
				return HttpResponse.json(
					{
						status: 'success',
						data: {
							stringAttributeValues: [
								'HTTP GET',
								'HTTP GET /customer',
								'HTTP GET /dispatch',
								'HTTP GET /route',
							],
							numberAttributeValues: null,
							boolAttributeValues: null,
						},
					},
					{ status: 200 },
				);
			}

			if (
				metricName === 'signoz_calls_total' &&
				tagKey === 'resource_signoz_collector_id'
			) {
				return HttpResponse.json(
					{
						status: 'success',
						data: [
							'f38916c2-daf2-4424-bd3e-4907a7e537b6',
							'6d4af7f0-4884-4a37-abd4-6bdbee29fa04',
							'523c44b9-5fe1-46f7-9163-4d2c57ece09b',
							'aa52e8e8-6f88-4056-8fbd-b377394d022c',
							'4d515ba2-065d-4856-b2d8-ddb957c44ddb',
							'fd47a544-1410-4c76-a554-90ef6464da02',
							'bb455f71-3fe1-4761-bbf5-efe2faee18a6',
							'48563680-314e-4117-8a6d-1f0389c95e04',
							'6e866423-7704-4d72-be8b-4695bc36f145',
							'e4886c76-93f5-430f-9076-eef85524312f',
						],
					},
					{ status: 200 },
				);
			}

			return HttpResponse.text('', { status: 500 });
		},
	),
	http.get('/api/v1/loginPrecheck', ({ request }) => {
		let req = request;
		const email = new URL(req.url).searchParams.get('email');
		if (email === 'failEmail@signoz.io') {
			return HttpResponse.text('', { status: 500 });
		}

		return HttpResponse.json(
			{
				status: 'success',
				data: {
					sso: true,
					ssoUrl: '',
					canSelfRegister: false,
					isUser: true,
					ssoError: '',
				},
			},
			{ status: 200 },
		);
	}),

	http.get('/api/v2/licenses', () => {
		return HttpResponse.json(licensesSuccessResponse, { status: 200 });
	}),

	http.get('/api/v1/billing', () => {
		return HttpResponse.json(billingSuccessResponse, { status: 200 });
	}),

	http.get('/api/v1/dashboards', () => {
		return HttpResponse.json(dashboardSuccessResponse, { status: 200 });
	}),

	http.get('/api/v1/dashboards/4', () => {
		return HttpResponse.json(getDashboardById, { status: 200 });
	}),

	http.get('/api/v1/invite', () => {
		return HttpResponse.json(inviteUser, { status: 200 });
	}),
	http.post('/api/v1/invite', () => {
		return HttpResponse.json(inviteUser, { status: 200 });
	}),
	http.put('/api/v1/user/:id', () => {
		return HttpResponse.json(
			{
				data: 'user updated successfully',
			},
			{ status: 200 },
		);
	}),
	http.post('/api/v1/changePassword', () => {
		return HttpResponse.json(
			{
				status: 'error',
				errorType: 'forbidden',
				error: 'invalid credentials',
			},
			{ status: 403 },
		);
	}),

	http.get('/api/v3/autocomplete/aggregate_attributes', () => {
		return HttpResponse.json(
			{
				status: 'success',
				data: { attributeKeys: null },
			},
			{ status: 200 },
		);
	}),

	http.get('/api/v1/explorer/views', () => {
		return HttpResponse.json(explorerView, { status: 200 });
	}),

	http.post('/api/v1/explorer/views', () => {
		return HttpResponse.json(
			{
				status: 'success',
				data: '7731ece1-3fa3-4ed4-8b1c-58b4c28723b2',
			},
			{ status: 200 },
		);
	}),

	http.post('/api/v1/event', () => {
		return HttpResponse.json(
			{
				statusCode: 200,
				error: null,
				payload: 'Event Processed Successfully',
			},
			{ status: 200 },
		);
	}),

	http.get(
		'/api/v1/traces/000000000000000071dc9b0a338729b4',
		() => {
			return HttpResponse.json(traceDetailResponse, { status: 200 });
		},
	),

	http.get('/api/v1/channels', () => {
		return HttpResponse.json(
			{ data: allAlertChannels, status: 'success' },
			{ status: 200 },
		);
	}),
	http.delete('/api/v1/channels/:id', () => {
		return HttpResponse.json(
			{
				status: 'success',
				data: 'notification channel successfully deleted',
			},
			{ status: 200 },
		);
	}),
	http.get('/locales/en/translation.json', () => {
		return HttpResponse.json(enTranslation, { status: 200 });
	}),
	http.get('/locales/en/common.json', () => {
		return HttpResponse.json(commonEnTranslation, { status: 200 });
	}),
	http.get('/locales/en-US/translation.json', () => {
		return HttpResponse.json(enTranslation, { status: 200 });
	}),
	http.get('/locales/en-US/common.json', () => {
		return HttpResponse.json(commonEnTranslation, { status: 200 });
	}),
];
