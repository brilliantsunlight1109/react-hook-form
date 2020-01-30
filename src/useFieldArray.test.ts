import { act, renderHook } from '@testing-library/react-hooks';
import { useFieldArray } from './useFieldArray';
import { appendId } from './logic/mapIds';
import { reconfigureControl } from './useForm.test';

jest.mock('./logic/generateId', () => ({
  default: () => '1',
}));

describe('useFieldArray', () => {
  it('should return default fields value', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl(),
        name: 'test',
      }),
    );

    expect(result.current.fields).toEqual([]);
  });

  it('should append data into the fields', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          ...reconfigureControl(),
          getValues: () => ({
            test: [],
          }),
        },
        name: 'test',
      }),
    );

    act(() => {
      result.current.append({ test: 'test' });
    });

    expect(result.current.fields).toEqual([{ id: '1', test: 'test' }]);

    act(() => {
      result.current.append({ test: 'test1' });
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: 'test' },
      { id: '1', test: 'test1' },
    ]);

    act(() => {
      result.current.append({});
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: 'test' },
      { id: '1', test: 'test1' },
      { id: '1' },
    ]);

    act(() => {
      result.current.append([{ test: 'test2' }, { test: 'test3' }]);
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: 'test' },
      { id: '1', test: 'test1' },
      { id: '1' },
      { id: '1', test: 'test2' },
      { id: '1', test: 'test3' },
    ]);
  });

  it('should pre-append data into the fields', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          ...reconfigureControl(),
          getValues: () => ({
            test: [],
          }),
        },
        name: 'test',
      }),
    );

    act(() => {
      result.current.prepend({ test: 'test' });
    });

    expect(result.current.fields).toEqual([{ id: '1', test: 'test' }]);

    act(() => {
      result.current.prepend({ test: 'test1' });
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: 'test1' },
      { id: '1', test: 'test' },
    ]);

    act(() => {
      result.current.prepend({});
    });

    expect(result.current.fields).toEqual([
      { id: '1' },
      { id: '1', test: 'test1' },
      { id: '1', test: 'test' },
    ]);

    act(() => {
      result.current.prepend([{ test: 'test2' }, { test: 'test3' }]);
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: 'test2' },
      { id: '1', test: 'test3' },
      { id: '1' },
      { id: '1', test: 'test1' },
      { id: '1', test: 'test' },
    ]);
  });

  it('should prepend error', () => {
    const errorsRef = {
      current: {
        test: [{ test: '1' }, { test: '2' }, { test: '3' }],
      },
    };
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          ...reconfigureControl(),
          getValues: () => ({
            test: [],
          }),
          errorsRef: errorsRef as any,
        },
        name: 'test',
      }),
    );

    act(() => {
      result.current.prepend({ test: 'test2' });
    });

    expect(errorsRef).toEqual({
      current: {
        test: [null, { test: '1' }, { test: '2' }, { test: '3' }],
      },
    });

    act(() => {
      result.current.prepend([{ test: 'test1' }, { test: 'test3' }]);
    });

    expect(errorsRef).toEqual({
      current: {
        test: [null, null, null, { test: '1' }, { test: '2' }, { test: '3' }],
      },
    });
  });

  it('should prepend touched fields', () => {
    const touchedFieldsRef = {
      current: {
        test: [{ test: '1' }, { test: '2' }, { test: '3' }],
      },
    };
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          ...reconfigureControl(),
          getValues: () => ({
            test: [],
          }),
          touchedFieldsRef: touchedFieldsRef as any,
          readFormStateRef: {
            current: {
              touched: true,
            },
          } as any,
        },
        name: 'test',
      }),
    );

    act(() => {
      result.current.prepend({ test: 'test2' });
    });

    expect(touchedFieldsRef).toEqual({
      current: {
        test: [null, { test: '1' }, { test: '2' }, { test: '3' }],
      },
    });

    act(() => {
      result.current.prepend([{ test: 'test1' }, { test: 'test3' }]);
    });

    expect(touchedFieldsRef).toEqual({
      current: {
        test: [null, null, null, { test: '1' }, { test: '2' }, { test: '3' }],
      },
    });
  });

  it('should populate default values into fields', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }] },
          },
        }),
        name: 'test',
      }),
    );

    expect(result.current.fields).toEqual([
      { test: '1', id: '1' },
      { test: '2', id: '1' },
    ]);
  });

  it('should remove field according index', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }] },
          },
          getValues: () => ({
            test: [],
          }),
          fieldsRef: {
            current: {
              'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
              'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
            },
          },
        }),
        name: 'test',
      }),
    );

    act(() => {
      result.current.remove(1);
    });

    expect(result.current.fields).toEqual([{ test: '1', id: '1' }]);
  });

  it('should remove error', () => {
    const errorsRef = {
      current: {
        test: [{ test: '1' }, { test: '2' }, { test: '3' }],
      },
    };
    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }] },
          },
          getValues: () => ({
            test: [],
          }),
          errorsRef: errorsRef as any,
          fieldsRef: {
            current: {
              'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
              'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
            },
          },
        }),
        name: 'test',
      }),
    );

    act(() => {
      result.current.remove(1);
    });

    expect(errorsRef).toEqual({
      current: {
        test: [{ test: '1' }, { test: '3' }],
      },
    });
  });

  it('should remove touched fields', () => {
    const touchedFieldsRef = {
      current: {
        test: [{ test: '1' }, { test: '2' }, { test: '3' }],
      },
    };
    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl({
          getValues: () => ({
            test: [],
          }),
          readFormStateRef: {
            current: {
              touched: true,
            },
          } as any,
          touchedFieldsRef: touchedFieldsRef as any,
          fieldsRef: {
            current: {
              'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
              'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
            },
          },
        }),
        name: 'test',
      }),
    );

    act(() => {
      result.current.remove(1);
    });

    expect(touchedFieldsRef).toEqual({
      current: {
        test: [{ test: '1' }, { test: '3' }],
      },
    });
  });

  it('should remove all fields when index not supplied', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl(),
        name: 'test',
      }),
    );

    act(() => {
      result.current.remove();
    });

    expect(result.current.fields).toEqual([]);
  });

  it('should insert data at index', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }] },
          },
          getValues: () => ({
            test: [],
          }),
          fieldsRef: {
            current: {
              'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
              'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
            },
          },
        }),
        name: 'test',
      }),
    );

    act(() => {
      result.current.insert(1, { test: '3' });
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: '1' },
      { id: '1', test: '3' },
      { id: '1', test: '2' },
    ]);

    act(() => {
      result.current.insert(1, [{ test: '4' }, { test: '5' }]);
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: '1' },
      { id: '1', test: '4' },
      { id: '1', test: '5' },
      { id: '1', test: '3' },
      { id: '1', test: '2' },
    ]);
  });

  it('should insert touched fields', () => {
    const touchedFieldsRef = {
      current: {
        test: [{ test: '1' }, { test: '2' }, { test: '3' }],
      },
    };
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          ...reconfigureControl(),
          readFormStateRef: {
            current: {
              touched: true,
            },
          } as any,
          getValues: () => ({
            test: [],
          }),
          touchedFieldsRef: touchedFieldsRef as any,
          fieldsRef: {
            current: {
              'test[0]': {
                ref: {
                  value: 1,
                  name: 'test[0]',
                },
              },
              'test[1]': {
                ref: {
                  value: 2,
                  name: 'test[1]',
                },
              },
              'test[2]': {
                ref: {
                  value: 3,
                  name: 'test[2]',
                },
              },
            },
          } as any,
        },
        name: 'test',
      }),
    );

    act(() => {
      result.current.insert(1, { test: 'test2' });
    });

    expect(touchedFieldsRef).toEqual({
      current: {
        test: [{ test: '1' }, null, { test: '2' }, { test: '3' }],
      },
    });

    act(() => {
      result.current.insert(1, [{ test: 'test2' }, { test: 'test3' }]);
    });

    expect(touchedFieldsRef).toEqual({
      current: {
        test: [{ test: '1' }, null, null, null, { test: '2' }, { test: '3' }],
      },
    });
  });

  it('should insert error', () => {
    const errorsRef = {
      current: {
        test: [{ test: '1' }, { test: '2' }, { test: '3' }],
      },
    };
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          ...reconfigureControl(),
          getValues: () => ({
            test: [],
          }),
          errorsRef: errorsRef as any,
          fieldsRef: {
            current: {
              'test[0]': {
                ref: {
                  value: 1,
                  name: 'test[0]',
                },
              },
              'test[1]': {
                ref: {
                  value: 2,
                  name: 'test[1]',
                },
              },
              'test[2]': {
                ref: {
                  value: 3,
                  name: 'test[2]',
                },
              },
            },
          } as any,
        },
        name: 'test',
      }),
    );

    act(() => {
      result.current.insert(1, { test: 'test2' });
    });

    expect(errorsRef).toEqual({
      current: {
        test: [{ test: '1' }, null, { test: '2' }, { test: '3' }],
      },
    });

    act(() => {
      result.current.insert(1, [{ test: 'test2' }, { test: 'test3' }]);
    });

    expect(errorsRef).toEqual({
      current: {
        test: [{ test: '1' }, null, null, null, { test: '2' }, { test: '3' }],
      },
    });
  });

  it('should swap data order', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }] },
          },
          getValues: () => ({
            test: [],
          }),
          fieldsRef: {
            current: {
              'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
              'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
            },
          },
        }),
        name: 'test',
      }),
    );

    act(() => {
      result.current.swap(0, 1);
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: '2' },
      { id: '1', test: '1' },
    ]);
  });

  it('should swap errors', () => {
    const errorsRef = {
      current: {
        test: [{ test: '1' }, { test: '2' }, { test: '3' }],
      },
    };

    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }] },
          },
          getValues: () => ({
            test: [],
          }),
          errorsRef: errorsRef as any,
          fieldsRef: {
            current: {
              'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
              'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
            },
          },
        }),
        name: 'test',
      }),
    );

    act(() => {
      result.current.swap(0, 1);
    });

    expect(errorsRef.current).toEqual({
      test: [{ test: '2' }, { test: '1' }, { test: '3' }],
    });
  });

  it('should swap touched fields', () => {
    const touchedFieldsRef = {
      current: {
        test: [{ test: '1' }, { test: '2' }, { test: '3' }],
      },
    };

    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }] },
          },
          getValues: () => ({
            test: [],
          }),
          readFormStateRef: {
            current: {
              touched: true,
            },
          } as any,
          touchedFieldsRef: touchedFieldsRef as any,
          fieldsRef: {
            current: {
              'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
              'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
            },
          },
        }),
        name: 'test',
      }),
    );

    act(() => {
      result.current.swap(0, 1);
    });

    expect(touchedFieldsRef.current).toEqual({
      test: [{ test: '2' }, { test: '1' }, { test: '3' }],
    });
  });

  it('should move into pointed position', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
          },
          getValues: () => ({
            test: [],
          }),
          fieldsRef: {
            current: {
              'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
              'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
              'test[2]': { ref: { name: 'test[2]', value: { test: '3' } } },
            },
          },
        }),
        name: 'test',
      }),
    );

    act(() => {
      result.current.move(2, 0);
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: '3' },
      { id: '1', test: '1' },
      { id: '1', test: '2' },
    ]);
  });

  it('should move errors', () => {
    const errorsRef = {
      current: {
        test: [{ test: '1' }, { test: '2' }, { test: '3' }],
      },
    };

    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
          },
          getValues: () => ({
            test: [],
          }),
          errorsRef: errorsRef as any,
        }),
        name: 'test',
      }),
    );

    act(() => {
      result.current.move(2, 0);
    });

    expect(errorsRef.current).toEqual({
      test: [{ test: '3' }, { test: '1' }, { test: '2' }],
    });
  });

  it('should move touched fields', () => {
    const touchedFieldsRef = {
      current: {
        test: [{ test: '1' }, { test: '2' }, { test: '3' }],
      },
    };

    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
          },
          getValues: () => ({
            test: [],
          }),
          readFormStateRef: {
            current: {
              touched: true,
            },
          } as any,
          touchedFieldsRef: touchedFieldsRef as any,
        }),
        name: 'test',
      }),
    );

    act(() => {
      result.current.move(2, 0);
    });

    expect(touchedFieldsRef.current).toEqual({
      test: [{ test: '3' }, { test: '1' }, { test: '2' }],
    });
  });

  it('should call be able to reset the Field Array', () => {
    const resetFieldArrayFunctionRef = {
      current: {},
    };

    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl({
          resetFieldArrayFunctionRef,
          getValues: () => ({
            test: [],
          }),
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
          },
        }),
        name: 'test',
      }),
    );

    act(() => {
      result.current.append({ test: 'test' });
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: '1' },
      { id: '1', test: '2' },
      { id: '1', test: '3' },
      { id: '1', test: 'test' },
    ]);

    act(() => {
      // @ts-ignore
      resetFieldArrayFunctionRef.current['test']();
    });

    expect(result.current.fields).toEqual([
      { test: '1', id: '1' },
      { test: '2', id: '1' },
      { test: '3', id: '1' },
    ]);
  });
});

test('should append id to the value', () => {
  expect(appendId({ test: 'test' })).toEqual({
    test: 'test',
    id: '1',
  });
});
