import React, { FunctionComponent, HTMLAttributes } from 'react';

import './style.scss';

export type TextInputProps = {
  id: string;
  label: string;
  value: string;
  setValue: (value: any) => any;
} & HTMLAttributes<HTMLInputElement>

export const TextInput: FunctionComponent<TextInputProps> = ({
  id,
  label,
  value,
  setValue,
  ...rest
}) => {
  return (
    <div className="text-input">
      <label htmlFor={id}>{label}</label>
      <input
        {...rest}
        id={id}
        type="text"
        defaultValue={value}
        onInput={e => setValue((e.target as HTMLInputElement).value)}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <div className="text-input__validation-errors" />
    </div>
  );
};
