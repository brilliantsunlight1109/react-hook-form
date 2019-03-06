import { useRef, useState, useEffect } from 'react';
import getValidRadioValue from './getValidRadioValue';
import getFieldValues from './getFieldsValue';
import validateField from './validateField';

export interface RegisterInput {
  ref: {
    name: string,
    checked: boolean,
    value: string | number | boolean,
    type: string,
    addEventListener: (string, any) => void,
    removeEventListener: (string, any) => void,
  };
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  pattern: RegExp;
}

export default function useForm() {
  const fields = useRef({});
  const localErrorMessages = useRef({});
  const [errors, updateErrorMessage] = useState({});

  function validateWithStateUpdate(e: React.ChangeEvent<HTMLInputElement>) {
    const ref = fields.current[e.target.name];
    const error = validateField(ref, fields.current);

    if (Object.keys(error).length) return;

    const copy = { ...localErrorMessages.current };
    delete copy[e.target.name];

    updateErrorMessage({ ...copy });
    localErrorMessages.current = { ...copy };
  }

  function register(data: RegisterInput) {
    if (!data || !data.ref) return;
    if (!data.ref.name && data.ref.name) {
      console.warn('Oops missing the name for field:', data.ref);
      return;
    }
    if (fields.current && fields.current[data.ref.name]) return;

    data.ref.addEventListener('blur', validateWithStateUpdate);
    data.ref.addEventListener('change', validateWithStateUpdate);
    if (!fields.current) fields.current = {};
    fields.current[data.ref.name] = data;
  }

  function select(filedName: string) {
    if (!fields.current) return null;
    const results = getFieldValues(fields.current, filedName);

    // if object need a good flat
    return typeof results === 'object' ? results : results;
  }

  const prepareSubmit = (callback: (Object) => void) => (e: Event) => {
    let localError = {};
    const values = {};
    e.preventDefault();

    Object.values(fields.current).forEach((data: RegisterInput) => {
      const { ref } = data;
      // @ts-ignore:
      if (!document.body.contains(ref) && fields.current) {
        delete fields.current[ref.name];
        return;
      }

      // required section
      localError = validateField(data, fields.current, localError);

      if (localError[ref.name]) return;

      if (ref.type === 'checkbox') {
        values[ref.name] = ref.checked;
      } else if (ref.type === 'radio') {
        values[ref.name] = getValidRadioValue(fields.current, ref.name).value;
      } else {
        values[ref.name] = ref.value;
      }
    });

    updateErrorMessage({ ...localError });
    localErrorMessages.current = { ...localError };

    if (!Object.values(localError).length) callback(values);
  };

  useEffect(
    () => () =>
      Array.isArray(fields.current) &&
      Object.values(fields.current).forEach(({ ref }: any) => {
        ref.removeEventListener('blur', validateWithStateUpdate);
        ref.removeEventListener('change', validateWithStateUpdate);
      }),
    [],
  );

  return {
    register,
    prepareSubmit,
    errors,
    select,
  };
}
