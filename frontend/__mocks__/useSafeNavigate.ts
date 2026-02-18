import { vi } from 'vitest';
// Mock for useSafeNavigate hook to avoid React Router version conflicts in tests
interface SafeNavigateOptions {
	replace?: boolean;
	state?: unknown;
}

interface SafeNavigateTo {
	pathname?: string;
	search?: string;
	hash?: string;
}

type SafeNavigateToType = string | SafeNavigateTo;

interface UseSafeNavigateReturn {
	safeNavigate: vi.MockedFunction<
		(to: SafeNavigateToType, options?: SafeNavigateOptions) => void
	>;
}

export const useSafeNavigate = (): UseSafeNavigateReturn => ({
	safeNavigate: vi.fn(
		(to: SafeNavigateToType, options?: SafeNavigateOptions) => {
			console.log(`Mock safeNavigate called with:`, to, options);
		},
	) as vi.MockedFunction<
		(to: SafeNavigateToType, options?: SafeNavigateOptions) => void
	>,
});
