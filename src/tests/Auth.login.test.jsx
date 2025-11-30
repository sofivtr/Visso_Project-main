import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Auth from '../components/Auth.jsx'

// Mock localStorage antes de cada test
beforeEach(() => {
  let store = {}
  const localStorageMock = {
    getItem(key) {
      return store[key] || null
    },
    setItem(key, value) {
      store[key] = value.toString()
    },
    removeItem(key) {
      delete store[key]
    },
    clear() {
      store = {}
    },
  }
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    configurable: true,
    writable: true,
  })

  // Reset mocks y localStorage
  mockLogin.mockReset()
  mockNavigate.mockReset()
  localStorage.clear()
})

// Mock de Api.login()
const mockLogin = vi.fn()
vi.mock('../assets/js/api', () => ({
  Api: {
    login: (...args) => mockLogin(...args),
  }
}))

// Mock de useNavigate para verificar navegación
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

async function submitLogin(email, password) {
  render(
    <MemoryRouter>
      <Auth />
    </MemoryRouter>
  )
  await userEvent.type(screen.getByLabelText(/usuario o email/i), email)
  await userEvent.type(screen.getByLabelText(/contraseña/i), password)
  await userEvent.click(screen.getByRole('button', { name: /ingresar/i }))
}

describe('Auth - Login', () => {
  it('muestra error si el usuario no existe', async () => {
    mockLogin.mockRejectedValueOnce({ response: { data: 'Usuario no encontrado' } })
    await submitLogin('no@ex.com', '12345678')
    expect(await screen.findByText(/usuario no encontrado/i)).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('muestra error si la contraseña es incorrecta', async () => {
    mockLogin.mockRejectedValueOnce({ response: { data: 'Contraseña incorrecta' } })
    await submitLogin('test@ex.com', 'wrong')
    expect(await screen.findByText(/contraseña incorrecta/i)).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('con credenciales válidas de usuario, navega a /', async () => {
    mockLogin.mockResolvedValueOnce({ id: 1, email: 'user@ex.com', rol: 'usuario' })
    await submitLogin('user@ex.com', 'pass')
    expect(mockNavigate).toHaveBeenCalledWith('/')
    const saved = JSON.parse(localStorage.getItem('visso_current_user'))
    expect(saved?.email).toBe('user@ex.com')
  })

  it('con credenciales válidas de admin, navega a /admin', async () => {
    mockLogin.mockResolvedValueOnce({ id: 2, email: 'admin@ex.com', rol: 'admin' })
    await submitLogin('admin@ex.com', 'adminpass')
    expect(mockNavigate).toHaveBeenCalledWith('/admin')
  })
})
