// This module provides a compatibility layer for the custom history object
// that was used with React Router v5. In v6, we use the useNavigate hook instead.
// This module is kept for backward compatibility during migration.

import type { NavigateFunction } from 'react-router-dom';

let navigateFunction: NavigateFunction | null = null;

export function setNavigate(navigate: NavigateFunction): void {
	navigateFunction = navigate;
}

export function getNavigate(): NavigateFunction | null {
	return navigateFunction;
}

const history = {
	push: (path: string, state?: unknown): void => {
		if (navigateFunction) {
			navigateFunction(path, { state });
		} else {
			window.location.href = path;
		}
	},
	replace: (path: string, state?: unknown): void => {
		if (navigateFunction) {
			navigateFunction(path, { replace: true, state });
		} else {
			window.location.replace(path);
		}
	},
	go: (n: number): void => {
		window.history.go(n);
	},
	goBack: (): void => {
		window.history.back();
	},
	goForward: (): void => {
		window.history.forward();
	},
	get location(): Location {
		return window.location;
	},
	listen: (): (() => void) => {
		// Return a no-op cleanup function
		return (): void => {};
	},
	createHref: (location: {
		pathname: string;
		search?: string;
		hash?: string;
	}): string => {
		const { pathname, search = '', hash = '' } = location;
		return `${pathname}${search}${hash}`;
	},
};

export default history;
