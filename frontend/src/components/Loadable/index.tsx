import * as React from 'react';
import { lazyRetry } from 'utils/lazyWithRetries';

function Loadable(importPath: {
	(): LoadableProps;
}): React.LazyExoticComponent<LazyComponent> {
	// use React.lazy so tests that spy on React.lazy observe the call
	return React.lazy(() => lazyRetry(() => importPath()));
}

type LazyComponent = ComponentType<Record<string, unknown>>;

type LoadableProps = Promise<{
	default: LazyComponent;
}>;

export default Loadable;
