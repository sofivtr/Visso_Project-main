import { describe, it, expect } from 'vitest'
import {
  normalizarRut,
  validarRut,
  formatearRut,
  validarEmail,
  validarTelefonoChile,
  formatearTelefonoChile,
  setFieldError,
} from '../assets/js/validaciones'

// Utilidades de RUT
describe('validaciones de RUT', () => {
  it('normalizarRut elimina separadores y pone K en mayúscula', () => {
    expect(normalizarRut('12.345.678-9')).toBe('123456789')
    expect(normalizarRut('12.345.678-k')).toBe('12345678K')
  })

  it('validarRut acepta RUTs válidos', () => {
    // 12.345.678-5 es válido
    expect(validarRut('12.345.678-5')).toBe(true)
    // 1.234.567-4 también es válido
    expect(validarRut('1.234.567-4')).toBe(true)
  })

  it('validarRut rechaza RUTs inválidos (DV incorrecto, largo inválido y dígitos repetidos)', () => {
    expect(validarRut('12.345.678-9')).toBe(false) // DV incorrecto
    expect(validarRut('123456-7')).toBe(false) // largo inválido
    expect(validarRut('11.111.111-1')).toBe(false) // dígitos repetidos
  })

  it('formatearRut aplica puntos y guión correctamente', () => {
    expect(formatearRut('123456785')).toBe('12.345.678-5')
    expect(formatearRut('1234567k')).toBe('1.234.567-K')
  })
})

// Email
describe('validación de email', () => {
  it('valida emails correctos', () => {
    expect(validarEmail('usuario@dominio.com')).toBe(true)
    expect(validarEmail('user.name+tag@domain.co')).toBe(true)
  })
  it('rechaza emails incorrectos', () => {
    expect(validarEmail('usuario@dominio')).toBe(false)
    expect(validarEmail('usuario')).toBe(false)
  })
})

// Teléfono Chile
describe('validación y formateo de teléfono Chile', () => {
  it('valida formatos aceptados', () => {
    expect(validarTelefonoChile('912345678')).toBe(true)
    expect(validarTelefonoChile('9 1234 5678')).toBe(true)
  })
  it('rechaza formatos inválidos', () => {
    expect(validarTelefonoChile('812345678')).toBe(false) // no empieza con 9
    expect(validarTelefonoChile('91234567')).toBe(false) // 8 dígitos
    expect(validarTelefonoChile('9123456789')).toBe(false) // 10 dígitos
  })
  it('formatea correctamente a "9 1234 5678"', () => {
    expect(formatearTelefonoChile('912345678')).toBe('9 1234 5678')
    // Si no comienza con 9 o no tiene 9 dígitos, no cambia
    expect(formatearTelefonoChile('812345678')).toBe('812345678')
    expect(formatearTelefonoChile('91234567')).toBe('91234567')
  })
})

// setFieldError
describe('setFieldError', () => {
  it('muestra y oculta mensaje de error en el DOM', () => {
    const input = document.createElement('input')
    const error = document.createElement('div')

    setFieldError(input, error, 'Mensaje')
    expect(error.textContent).toBe('Mensaje')
    expect(error.style.display).toBe('block')
    expect(input.classList.contains('is-invalid')).toBe(true)

    setFieldError(input, error, '')
    expect(error.textContent).toBe('')
    expect(error.style.display).toBe('none')
    expect(input.classList.contains('is-invalid')).toBe(false)
  })
})