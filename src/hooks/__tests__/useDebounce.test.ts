import {renderHook, act} from '@testing-library/react-native';
import {useDebounce} from '../useDebounce';

describe('useDebounce', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const {result} = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should update the value after the delay', () => {
    const {result, rerender} = renderHook(
      ({value, delay}) => useDebounce(value, delay),
      {initialProps: {value: 'first', delay: 500}},
    );

    // Update the value
    rerender({value: 'second', delay: 500});

    // Value should still be 'first' before time passes
    expect(result.current).toBe('first');

    // Advance time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('second');
  });

  it('should cancel the previous timer if value changes rapidly', () => {
    const {result, rerender} = renderHook(
      ({value, delay}) => useDebounce(value, delay),
      {initialProps: {value: 'val1', delay: 500}},
    );

    rerender({value: 'val2', delay: 500});

    // Advance only halfway
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Change value again
    rerender({value: 'val3', delay: 500});

    // Advance enough for the original timer to have finished
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // It should NOT have updated to 'val2', still 'val1'
    expect(result.current).toBe('val1');

    // Finish the remaining time for 'val3'
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('val3');
  });
});
