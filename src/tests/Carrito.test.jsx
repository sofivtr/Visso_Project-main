import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Carrito from "../components/Carrito.jsx";

// Mock de sesión y API backend
const mockGetCurrentUser = vi.fn();
vi.mock("../assets/js/session", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

const mockGetCarrito = vi.fn();
const mockUpdateCarritoItem = vi.fn();
const mockRemoveFromCarrito = vi.fn();
const mockCerrarCarrito = vi.fn();
const mockRegionesComunas = vi.fn();
vi.mock("../assets/js/api", () => ({
  Api: {
    getCarrito: (...args) => mockGetCarrito(...args),
    updateCarritoItem: (...args) => mockUpdateCarritoItem(...args),
    removeFromCarrito: (...args) => mockRemoveFromCarrito(...args),
    cerrarCarrito: (...args) => mockCerrarCarrito(...args),
    regionesComunas: (...args) => mockRegionesComunas(...args),
  },
}));

// Mock de clearCart para finalizar compra
const mockClearCart = vi.fn();
vi.mock("../assets/js/carrito", () => ({
  clearCart: (...args) => mockClearCart(...args),
}));

describe("Carrito.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockReturnValue({ id: 1, email: "user@example.com" });
    mockRegionesComunas.mockResolvedValue({ regiones: [] });
  });

  it("estado vacío: muestra mensaje y acciones para continuar", async () => {
    mockGetCarrito.mockResolvedValue({ id: 100, detalles: [] });

    render(
      <MemoryRouter initialEntries={["/carrito"]}>
        <Carrito />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /carrito de compras/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/tu carrito está vacío/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /continuar comprando/i })
    ).toBeInTheDocument();
  });

  it("checkout: botón visible y modal accesible con formulario", async () => {
    mockGetCarrito.mockResolvedValue({
      id: 100,
      detalles: [
        {
          id: 1,
          nombreProducto: "Producto A",
          precioUnitario: 100,
          cantidad: 2,
          producto: {
            imagenUrl: "/images/a.png",
            categoria: { nombre: "Sol" },
          },
        },
        {
          id: 2,
          nombreProducto: "Producto B",
          precioUnitario: 50,
          cantidad: 1,
          producto: {
            imagenUrl: "/images/b.png",
            categoria: { nombre: "Óptica" },
          },
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={["/carrito"]}>
        <Carrito />
      </MemoryRouter>
    );

    const checkoutBtn = await screen.findByRole("button", {
      name: /proceder al pago/i,
    });
    expect(checkoutBtn).toBeInTheDocument();

    const modal = document.getElementById("checkoutModal");
    expect(modal).toBeTruthy();

    expect(
      within(modal).getByRole("heading", {
        name: /finalizar compra/i,
        hidden: true,
      })
    ).toBeInTheDocument();

    // Inputs del formulario presentes (seleccionados por atributos actuales)
    const nombreInput = modal.querySelector('input[name="nombreContacto"]');
    const emailInput = modal.querySelector('input[name="email"]');
    const telefonoInput = modal.querySelector('input[name="telefono"]');
    expect(nombreInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(telefonoInput).toBeTruthy();

    // Resumen de totales dentro del modal
    const modalWithin = within(modal);
    expect(modalWithin.getByText(/^Subtotal:$/i)).toBeInTheDocument();
    expect(modalWithin.getByText(/^Total:$/i)).toBeInTheDocument();
  });
});
