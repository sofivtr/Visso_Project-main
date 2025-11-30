import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Auth from '../components/Auth.jsx'

async function renderRegister() {
  render(
    <MemoryRouter>
      <Auth />
    </MemoryRouter>
  )
  // Cambiar a formulario de registro (esperar actualización de estado)
  const showRegister = screen.getByRole('button', { name: /crear cuenta/i })
  await userEvent.click(showRegister)
}

async function fillCommonValidFields() {
  const rut = screen.getByLabelText(/rut/i)
  const email = screen.getByLabelText(/email/i)
  const tel = screen.getByLabelText(/teléfono/i)

  await userEvent.clear(rut)
  await userEvent.type(rut, '12.345.678-5')
  await userEvent.clear(email)
  await userEvent.type(email, 'test@example.com')
  await userEvent.clear(tel)
  await userEvent.type(tel, '912345678')
}

describe('Auth - Registro', () => {
  it('muestra error si la contraseña tiene menos de 8 caracteres', async () => {
    await renderRegister()
    await fillCommonValidFields()

    const pass = screen.getByPlaceholderText(/mínimo 8 caracteres/i)
    const pass2 = screen.getByPlaceholderText(/repite la contraseña/i)

    await userEvent.type(pass, '1234567') // 7 caracteres
    await userEvent.type(pass2, '1234567') // coincide pero es corta

    const submit = screen.getByRole('button', { name: /registrarse/i })
    await userEvent.click(submit)

    const passError = screen.getByText(/mínimo 8 caracteres/i)
    expect(passError).toBeInTheDocument()
    expect(passError).toBeVisible()
  })

  it('muestra error si las contraseñas no coinciden', async () => {
    await renderRegister()
    await fillCommonValidFields()

    const pass = screen.getByPlaceholderText(/mínimo 8 caracteres/i)
    const pass2 = screen.getByPlaceholderText(/repite la contraseña/i)

    await userEvent.type(pass, '12345678')
    await userEvent.type(pass2, '1234567')

    const submit = screen.getByRole('button', { name: /registrarse/i })
    await userEvent.click(submit)

    const confirmError = screen.getByText(/las contraseñas no coinciden/i)
    expect(confirmError).toBeInTheDocument()
    expect(confirmError).toBeVisible()
  })

  it('con datos válidos, vuelve al formulario de login', async () => {
    await renderRegister()
    await fillCommonValidFields()

    const pass = screen.getByPlaceholderText(/mínimo 8 caracteres/i)
    const pass2 = screen.getByPlaceholderText(/repite la contraseña/i)

    await userEvent.type(pass, '12345678')
    await userEvent.type(pass2, '12345678')

    const submit = screen.getByRole('button', { name: /registrarse/i })
    await userEvent.click(submit)

    // Al finalizar, setIsRegister(false) muestra el login
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
  })
})