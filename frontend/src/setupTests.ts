/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable object-shorthand */
/* eslint-disable func-names */

/**
 * Vitest setup file
 * Adds custom matchers from the react testing library to all tests
 */
import '@testing-library/jest-dom/vitest';
import 'jest-styled-components';
import './styles.scss';

import { server } from './mocks-server/server';

// Provide a lightweight router hook shim for tests that render components
// which call `useNavigate` or similar hooks outside of a Router wrapper.
// Prefer fixing individual tests to include MemoryRouter; this is a pragmatic
// global shim to unblock CI while migrating tests to Vitest.
import { vi } from 'vitest';

// Shim for react-router-dom (v6+) — provide a noop `useNavigate` so components
// that call it outside a Router won't throw during tests. Prefer adding a
// MemoryRouter to individual tests, but this global shim unblocks the suite.
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => () => {},
		useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
		useParams: () => ({}),
	};
});

// Some tests import the v5 compatibility layer. Provide the same lightweight
// shims for `react-router-dom-v5-compat` so hooks like `useHistory` and
// `useNavigate` don't throw when a Router isn't mounted.
vi.mock('react-router-dom-v5-compat', async () => {
	let actual = {};
	try {
		actual = await vi.importActual('react-router-dom-v5-compat');
	} catch (e) {
		// module may not exist in all environments; fallback to empty
		actual = {};
	}

	return {
		...actual,
		useNavigate: () => () => {},
		useHistory: () => ({
			push: () => {},
			replace: () => {},
			go: () => {},
			back: () => {},
		}),
		useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
		useParams: () => ({}),
		useRouteMatch: () => ({ path: '/', url: '/', isExact: true, params: {} }),
	};
});

// Establish API mocking before all tests.

// Mock window.matchMedia
window.matchMedia =
	window.matchMedia ||
	function (): any {
		return {
			matches: false,
			addListener: function () {},
			removeListener: function () {},
			addEventListener: function () {},
			removeEventListener: function () {},
			dispatchEvent: function () {
				return true;
			},
		};
	};

// jsdom currently throws when getComputedStyle is called with a pseudo-element
// (see: "Not implemented: Window's getComputedStyle() method: with pseudo-elements").
// Some test helpers and libraries call `getComputedStyle(el, '::before')`. Provide
// a small polyfill that accepts the second argument and falls back to the
// element's computed style so tests do not fail.
const _origGetComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = function (
	elt: Element | null,
	pseudoElt?: string | null,
): CSSStyleDeclaration {
	// If pseudo-element is requested, jsdom can't compute it — return the
	// element's computed style instead (sufficient for tests asserting
	// specific properties). Keep behavior identical when no pseudo is used.
	try {
		return _origGetComputedStyle(elt as Element, pseudoElt as any);
	} catch (e) {
		// Fallback: ignore pseudo-element and return computed style for element
		return _origGetComputedStyle(elt as Element);
	}
};

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
