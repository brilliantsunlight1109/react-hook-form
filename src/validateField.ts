import getValidRadioValue from './getValidRadioValue';

export default ({ ref, required, maxlength, min, max, pattern }, fields, errorsRef = {}) => {
  const copy = { ...errorsRef };

  if (
    (ref.type === 'checkbox' && required && !ref.checked) ||
    (ref.type === 'select-one' && required && ref.value === '') ||
    (ref.type === 'textarea' && required && ref.value === '') ||
    (ref.type === 'radio' && required && !getValidRadioValue(fields, ref.name).isValid) ||
    (ref.type === 'number' && required && (ref.value === 0 || ref.value === '')) ||
    ((ref.type === 'text' || ref.type === 'password' || ref.type === 'file' || ref.type === 'image') &&
      required &&
      ref.value === '')
  ) {
    copy[ref.name] = {
      required: true,
    };
  }

  // min and max section
  if (((min || max) && ref.type === 'number' && (max && ref.value > max)) || (min && ref.value < min)) {
    copy[ref.name] = {
      ...copy[ref.name],
      ...(ref.value > max ? { max: true } : null),
      ...(ref.value < min ? { min: true } : null),
    };
  }

  if (maxlength && ref.type === 'text' && maxlength && ref.value.length > max) {
    copy[ref.name] = {
      ...copy[ref.name],
      maxlength: true,
    };
  }

  if (pattern && ref.type === 'text' && !pattern.test(ref.value)) {
    copy[ref.name] = {
      ...copy[ref.name],
      pattern: true,
    };
  }

  return copy;
};
