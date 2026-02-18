import { dragHandler, dropHandler } from '../utils';
import { vi } from 'vitest';

vi.mock('react-dnd', () => ({
	useDrop: vi.fn().mockImplementation(() => [vi.fn(), vi.fn(), vi.fn()]),
	useDrag: vi.fn().mockImplementation(() => [vi.fn(), vi.fn(), vi.fn()]),
}));

describe('Utils testing of DraggableTableRow component', () => {
	test('Should dropHandler return true', () => {
		const monitor = {
			isOver: vi.fn().mockReturnValueOnce(true),
		} as never;
		const dropDataTruthy = dropHandler(monitor);

		expect(dropDataTruthy).toEqual({ isOver: true });
	});

	test('Should dropHandler return false', () => {
		const monitor = {
			isOver: vi.fn().mockReturnValueOnce(false),
		} as never;
		const dropDataFalsy = dropHandler(monitor);

		expect(dropDataFalsy).toEqual({ isOver: false });
	});

	test('Should dragHandler return true', () => {
		const monitor = {
			isDragging: vi.fn().mockReturnValueOnce(true),
		} as never;
		const dragDataTruthy = dragHandler(monitor);

		expect(dragDataTruthy).toEqual({ isDragging: true });
	});

	test('Should dragHandler return false', () => {
		const monitor = {
			isDragging: vi.fn().mockReturnValueOnce(false),
		} as never;
		const dragDataFalsy = dragHandler(monitor);

		expect(dragDataFalsy).toEqual({ isDragging: false });
	});
});
