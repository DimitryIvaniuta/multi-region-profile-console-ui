import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  readonly label: string;
  readonly error?: string | undefined;
  readonly hint?: string | undefined;
};

export const Field = ({ label, error, hint, id, ...props }: FieldProps) => {
  const inputId = id ?? (props.name ?? label).replace(/\s+/g, '-').toLowerCase();
  const descriptionId = `${inputId}-description`;
  return (
    <label className="field" htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <input id={inputId} className={error ? 'field__input field__input--error' : 'field__input'} aria-describedby={descriptionId} {...props} />
      <span id={descriptionId} className={error ? 'field__error' : 'field__hint'}>{error ?? hint ?? ' '}</span>
    </label>
  );
};

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  readonly label: string;
  readonly error?: string | undefined;
  readonly hint?: string | undefined;
  readonly children: ReactNode;
};

export const SelectField = ({ label, error, hint, id, children, ...props }: SelectFieldProps) => {
  const selectId = id ?? (props.name ?? label).replace(/\s+/g, '-').toLowerCase();
  const descriptionId = `${selectId}-description`;
  return (
    <label className="field" htmlFor={selectId}>
      <span className="field__label">{label}</span>
      <select id={selectId} className={error ? 'field__input field__input--error' : 'field__input'} aria-describedby={descriptionId} {...props}>
        {children}
      </select>
      <span id={descriptionId} className={error ? 'field__error' : 'field__hint'}>{error ?? hint ?? ' '}</span>
    </label>
  );
};
