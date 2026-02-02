"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
              "transition-all duration-200",
              "disabled:bg-gray-100 disabled:cursor-not-allowed",
              icon && "pl-12",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
            "transition-all duration-200",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          rows={4}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
            "transition-all duration-200 appearance-none cursor-pointer",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1.25rem",
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, ...props }, ref) => {
    return (
      <label className={cn("flex items-start gap-3 cursor-pointer", className)}>
        <input
          ref={ref}
          type="checkbox"
          className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
          {...props}
        />
        <div>
          <span className="text-gray-900 font-medium">{label}</span>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

interface RadioGroupProps {
  label?: string;
  name: string;
  options: { value: string; label: string; description?: string }[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
              value === option.value
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-green-200"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="w-5 h-5 text-green-600 focus:ring-green-500"
            />
            <div>
              <span className="font-medium text-gray-900">{option.label}</span>
              {option.description && (
                <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

// Country codes for phone input
const countryCodes = [
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+64", country: "NZ", flag: "🇳🇿", name: "New Zealand" },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+92", country: "PK", flag: "🇵🇰", name: "Pakistan" },
  { code: "+880", country: "BD", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "+966", country: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+20", country: "EG", flag: "🇪🇬", name: "Egypt" },
  { code: "+90", country: "TR", flag: "🇹🇷", name: "Turkey" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "+63", country: "PH", flag: "🇵🇭", name: "Philippines" },
  { code: "+84", country: "VN", flag: "🇻🇳", name: "Vietnam" },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
];

interface PhoneInputProps {
  label?: string;
  error?: string;
  value: string;
  countryCode: string;
  onValueChange: (phone: string) => void;
  onCountryCodeChange: (code: string) => void;
  onBlur?: () => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({
  label,
  error,
  value,
  countryCode,
  onValueChange,
  onCountryCodeChange,
  onBlur,
  required,
  placeholder = "400 000 000",
  className,
}: PhoneInputProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex">
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          className={cn(
            "px-3 py-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:z-10",
            "transition-all duration-200 appearance-none cursor-pointer",
            error && "border-red-500"
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.5rem center",
            backgroundSize: "1rem",
            paddingRight: "2rem",
          }}
        >
          {countryCodes.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.code}
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={cn(
            "flex-1 px-4 py-3 rounded-r-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
            "transition-all duration-200",
            error && "border-red-500 focus:ring-red-500"
          )}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}
