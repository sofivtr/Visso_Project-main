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
  mockUsers.mockReset()
  mockNavigate.mockReset()
  localStorage.clear()
})

// Mock de Api.users()
const mockUsers = vi.fn()
vi.mock('../assets/js/api', () => ({
  Api: {
    users: () => mockUsers(),
    products: vi.fn(),
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
    mockUsers.mockResolvedValueOnce([])
    await submitLogin('no@ex.com', '12345678')
    expect(await screen.findByText(/usuario no encontrado/i)).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('muestra error si la contraseña es incorrecta', async () => {
    mockUsers.mockResolvedValueOnce([{ email: 'test@ex.com', contrasena: 'secret', rol: 'user' }])
    await submitLogin('test@ex.com', 'wrong')
    expect(await screen.findByText(/contraseña incorrecta/i)).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('con credenciales válidas de usuario, navega a /', async () => {
    mockUsers.mockResolvedValueOnce([{ email: 'user@ex.com', contrasena: 'pass', rol: 'user' }])
    await submitLogin('user@ex.com', 'pass')
    expect(mockNavigate).toHaveBeenCalledWith('/')
    const saved = JSON.parse(localStorage.getItem('visso_current_user'))
    expect(saved?.email).toBe('user@ex.com')
  })

  it('con credenciales válidas de admin, navega a /admin', async () => {
    mockUsers.mockResolvedValueOnce([{ email: 'admin@ex.com', contrasena: 'adminpass', rol: 'admin' }])
    await submitLogin('admin@ex.com', 'adminpass')
    expect(mockNavigate).toHaveBeenCalledWith('/admin')
  })
})
