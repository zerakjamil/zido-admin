// Extend Jest matchers with jest-dom
import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toBeVisible(): R
      toHaveTextContent(text: string | RegExp): R
      toHaveValue(value: string | number): R
      toBeChecked(): R
    }
  }
}
