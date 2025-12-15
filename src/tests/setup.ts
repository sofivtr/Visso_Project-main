import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// limpia el DOM después de cada test
afterEach(() => {
  cleanup()
})
