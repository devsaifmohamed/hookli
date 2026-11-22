import { ChangeEvent, useState } from "react";

interface UseFormValues<T = any> {
  // Define your form field types here (e.g., string, number, boolean, etc.)
  [key: string]: string | number | boolean;
}

/**
 * Controlled form state with one change handler.
 *
 * @category state
 * @keywords form, form fields, inputs, onChange handler, controlled inputs, reset form
 * @param initialState - Initial field values. Keys must match the name attribute of each input.
 * @returns handleChange - One change handler for every named input, textarea and select.
 *
 * @example Usage
 * ```tsx
 * import { useForm } from "hookli";
 *
 * export function Demo() {
 *   const { values, handleChange, resetForm } = useForm({ name: "", email: "" });
 *
 *   return (
 *     <form onSubmit={(e) => e.preventDefault()}>
 *       <input name="name" value={values.name} onChange={handleChange} />
 *       <input name="email" type="email" value={values.email} onChange={handleChange} />
 *       <button type="button" onClick={resetForm}>Reset</button>
 *     </form>
 *   );
 * }
 * ```
 */
export const useForm = <T extends UseFormValues>(
  initialState: T
): {
  values: T;
  handleChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  resetForm: () => void;
} => {
  // State to store form values with type assertion for clarity
  const [values, setValues] = useState<T>(initialState);

  // Generic handleChange function
  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;

    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  // Reset form to initial values
  const resetForm = () => {
    setValues(initialState);
  };

  return { values, handleChange, resetForm };
};
