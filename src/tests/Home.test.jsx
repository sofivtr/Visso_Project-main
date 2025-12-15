import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Home from "../components/Home.jsx";
import { vi } from "vitest";

// Mock de API para el formulario de contacto
const mockEnviarMensaje = vi.fn(async () => ({}));
vi.mock("../assets/js/api", () => ({
  Api: {
    enviarMensaje: (...args) => mockEnviarMensaje(...args),
  },
}));

// Mock básico de localStorage para Contacto.jsx
beforeEach(() => {
  let store = {};
  const localStorageMock = {
    getItem(key) {
      return store[key] ?? null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
  Object.defineProperty(global, "localStorage", {
    value: localStorageMock,
    configurable: true,
    writable: true,
  });
  mockEnviarMensaje.mockReset();
});

describe("Home.jsx", () => {
  test("CTA de hero y CTA de catálogo apuntan a /productos", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const heroLink = screen.getByRole("link", { name: /ver productos/i });
    expect(heroLink).toHaveAttribute(
      "href",
      expect.stringContaining("/productos")
    );

    const tiendaCTA = screen.getByRole("link", {
      name: /ver todos los productos/i,
    });
    expect(tiendaCTA).toHaveAttribute(
      "href",
      expect.stringContaining("/productos")
    );
  });

  test("Formulario de contacto: no envía si el mensaje es demasiado corto", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const nombre = screen.getByLabelText(/tu nombre/i);
    const email = screen.getByLabelText(/tu email/i);
    const asunto = screen.getByLabelText(/^asunto$/i);
    const mensaje = screen.getByLabelText(/^mensaje/i);

    await user.type(nombre, "Juan Pérez");
    await user.type(email, "juan@example.com");
    await user.selectOptions(asunto, "Consulta General");
    await user.type(mensaje, "hola"); // menos de 10

    const enviar = screen.getByRole("button", { name: /Enviar Mensaje/i });
    await user.click(enviar);

    expect(mockEnviarMensaje).not.toHaveBeenCalled();
  });

  test("Formulario de contacto: éxito con datos válidos", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const nombre = screen.getByLabelText(/tu nombre/i);
    const email = screen.getByLabelText(/tu email/i);
    const asunto = screen.getByLabelText(/^asunto$/i);
    const mensaje = screen.getByLabelText(/^mensaje/i);

    await user.type(nombre, "Juan Pérez");
    await user.type(email, "juan@example.com");
    await user.selectOptions(asunto, "Consulta General");
    await user.type(
      mensaje,
      "Este es un mensaje válido que supera diez caracteres"
    );

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const enviar = screen.getByRole("button", { name: /Enviar Mensaje/i });
    await user.click(enviar);

    expect(mockEnviarMensaje).toHaveBeenCalledWith({
      nombre: "Juan Pérez",
      email: "juan@example.com",
      asunto: "Consulta General",
      mensaje: expect.stringMatching(/supera diez caracteres/i),
    });
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringMatching(/Mensaje enviado con éxito/i)
    );
    alertSpy.mockRestore();
  });
});
