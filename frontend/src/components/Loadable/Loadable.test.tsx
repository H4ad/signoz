import React, { ComponentType, Suspense } from 'react';
import {
	render,
	screen,
	waitForElementToBeRemoved,
} from '@testing-library/react';

import Loadable from './index';
import { vi } from 'vitest';

// Sample component to be loaded lazily
function SampleComponent(): JSX.Element {
	return <div>Sample Component</div>;
}

const loadSampleComponent = (): Promise<{
	default: ComponentType;
}> =>
	new Promise<{ default: ComponentType }>((resolve) => {
		setTimeout(() => {
			resolve({ default: SampleComponent });
		}, 500);
	});

describe('Loadable', () => {
	it('should render the lazily loaded component', async () => {
		const LoadableSampleComponent = Loadable(loadSampleComponent);

		const { container } = render(
			<Suspense fallback={<div>Loading...</div>}>
				<LoadableSampleComponent />
			</Suspense>,
		);

		expect(screen.getByText('Loading...')).toBeInTheDocument();
		await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

		expect(container.querySelector('div')).toHaveTextContent('Sample Component');
	});

	it('should return a lazy component when provided an import function', () => {
		const lazyComponent = Loadable(loadSampleComponent);

		// React.lazy returns a LazyExoticComponent which contains the $$typeof symbol
		expect(lazyComponent).toHaveProperty('$$typeof');
	});
});
