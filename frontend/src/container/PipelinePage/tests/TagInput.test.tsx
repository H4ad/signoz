import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import i18n from 'ReactI18';
import store from 'store';

import TagInput from '../components/TagInput';
import { vi } from 'vitest';

describe('Pipeline Page', () => {
	it('should render TagInput section', () => {
		const { asFragment } = render(
			<MemoryRouter>
				<Provider store={store}>
					<I18nextProvider i18n={i18n}>
						<TagInput setTagsListData={vi.fn()} tagsListData={[]} placeHolder="" />
					</I18nextProvider>
				</Provider>
			</MemoryRouter>,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});