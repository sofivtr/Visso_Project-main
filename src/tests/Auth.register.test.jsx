import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock de useNavigate DEBE declararse antes de importar componentes que lo usen
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { MemoryRouter } from "react-router-dom";
import Auth from "../components/Auth.jsx";

// Mock Api.register y Api.login
const mockRegister = vi.fn();
const mockLogin = vi.fn();
vi.mock("../assets/js/api", () => ({
  Api: {
    register: (...args) => mockRegister(...args),
    login: (...args) => mockLogin(...args),
  },
}));

// Nota: el mock de useNavigate está arriba para que Auth.jsx lo use

beforeEach(() => {
  mockRegister.mockReset();
  mockLogin.mockReset();
  mockNavigate.mockReset();
  // Evitar efectos secundarios por reload de la página en el handler
  try {
    Object.defineProperty(window, "location", {
      value: { reload: vi.fn() },
      configurable: true,
    });
  } catch {}
});

async function renderRegister() {
  render(
    <MemoryRouter>
      <Auth />
    </MemoryRouter>
  );
  // Cambiar a formulario de registro (esperar actualización de estado)
  const showRegister = screen.getByRole("button", { name: /crear cuenta/i });
  await userEvent.click(showRegister);
}

async function fillCommonValidFields() {
  const nombre = screen.getByLabelText(/nombre/i);
  const apellido = screen.getByLabelText(/apellido/i);
  const rut = screen.getByLabelText(/rut/i);
  const email = screen.getByLabelText(/email/i);

  await userEvent.type(nombre, "Test");
  await userEvent.type(apellido, "User");
  await userEvent.clear(rut);
  await userEvent.type(rut, "12.345.678-5");
  await userEvent.clear(email);
  await userEvent.type(email, "test@example.com");
}

describe("Auth - Registro", () => {
  it("muestra error si la contraseña tiene menos de 8 caracteres", async () => {
    await renderRegister();
    await fillCommonValidFields();

    const pass = screen.getByPlaceholderText(/mínimo 8 caracteres/i);
    const pass2 = screen.getByPlaceholderText(/repite la contraseña/i);

    await userEvent.type(pass, "1234567"); // 7 caracteres
    await userEvent.type(pass2, "1234567"); // coincide pero es corta

    const submit = screen.getByRole("button", { name: /registrarse/i });
    await userEvent.click(submit);

    const passError = screen.getByText(/mínimo 8 caracteres/i);
    expect(passError).toBeInTheDocument();
    expect(passError).toBeVisible();
  });

  it("muestra error si las contraseñas no coinciden", async () => {
    await renderRegister();
    await fillCommonValidFields();

    const pass = screen.getByPlaceholderText(/mínimo 8 caracteres/i);
    const pass2 = screen.getByPlaceholderText(/repite la contraseña/i);

    await userEvent.type(pass, "12345678");
    await userEvent.type(pass2, "1234567");

    const submit = screen.getByRole("button", { name: /registrarse/i });
    await userEvent.click(submit);

    const confirmError = screen.getByText(/las contraseñas no coinciden/i);
    expect(confirmError).toBeInTheDocument();
    expect(confirmError).toBeVisible();
  });
});
