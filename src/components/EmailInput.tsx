import { Input } from 'antd';
import { InputProps } from 'antd/lib/input';
import React from 'react';

interface EmailInputProps {
  value?: string | number | string[];
  onChange?: (value: string) => void;
  className?: string;
}
/**
 * 邮箱输入框（不允许空格）
 */
const EmailInputWithoutRef: React.ForwardRefRenderFunction<
  Input,
  EmailInputProps & Omit<InputProps, 'onChange'>
> = ({ value = '', onChange, className, ...inputProps }, ref) => {
  /** 处理值变化 */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 只允许输入数字
    e.target.value = e.target.value.replace(/(\s*)/g, '');
    // 如果过滤后和之前值相同，则跳过
    if (e.target.value === value) return;
    // 调用父级的 onChange
    if (onChange) onChange(e.target.value);
  };

  return (
    <Input
      className={className}
      value={value}
      onChange={handleChange}
      {...inputProps}
      ref={ref}
    ></Input>
  );
};
export const EmailInput = React.forwardRef(EmailInputWithoutRef);
