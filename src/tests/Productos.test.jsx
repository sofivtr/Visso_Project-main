import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock del módulo de carrito para interceptar addItem
vi.mock("../assets/js/carrito", () => ({
  addItem: vi.fn(),
}));
import * as carrito from "../assets/js/carrito";

// Mock de sesión y API
vi.mock("../assets/js/session", () => ({
  getCurrentUser: () => ({ id: 1, email: "user@ex.com", rol: "usuario" }),
}));
vi.mock("../assets/js/api", () => ({
  Api: {
    products: vi.fn(),
    categories: vi.fn(),
    brands: vi.fn(),
    addToCarrito: vi.fn(async () => ({})),
  },
}));
import { Api } from "../assets/js/api";
import { MemoryRouter } from "react-router-dom";
import Productos from "../components/Productos";

function createDeferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const demoProducts = [
  {
    id: 1,
    nombre: "Lentes de Sol Modelo A",
    categoria: { id: 11, nombre: "Sol" },
    marca: { id: 21, nombre: "RB" },
    precio: 39990,
    imagenUrl: "/images/sol/s1.webp",
    descripcion: "Protección UV",
    stock: 20,
  },
  {
    id: 2,
    nombre: "Lentes Oftálmicos Modelo B",
    categoria: { id: 10, nombre: "Óptica" },
    marca: { id: 22, nombre: "OK" },
    precio: 49990,
    imagenUrl: "/images/optica/o1.webp",
    descripcion: "Marco liviano",
    stock: 10,
  },
  {
    id: 3,
    nombre: "Lentes de Lectura C",
    categoria: { id: 12, nombre: "Lectura" },
    marca: { id: 23, nombre: "LEC" },
    precio: 19990,
    imagenUrl: "/images/lectura/l1.webp",
    descripcion: "Confort diario",
    stock: 5,
  },
];
const demoCategories = [
  { id: 11, nombre: "Sol" },
  { id: 10, nombre: "Óptica" },
  { id: 12, nombre: "Lectura" },
];
const demoBrands = [
  { id: 21, nombre: "RB" },
  { id: 22, nombre: "OK" },
  { id: 23, nombre: "LEC" },
];

describe("Productos - Render, filtros, modal y carrito", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Api.products.mockResolvedValue(demoProducts);
    Api.categories.mockResolvedValue(demoCategories);
    Api.brands.mockResolvedValue(demoBrands);
  });

  function renderProductos(initialSearch = "") {
    return render(
      <MemoryRouter initialEntries={[`/productos${initialSearch}`]}>
        <Productos />
      </MemoryRouter>
    );
  }

  it('muestra estado de "Cargando" y luego la lista de productos', async () => {
    const def = createDeferred();
    Api.products.mockReturnValueOnce(def.promise);
    Api.categories.mockResolvedValueOnce(demoCategories);
    Api.brands.mockResolvedValueOnce(demoBrands);

    renderProductos();

    // Estado de carga inicial
    expect(screen.getByText(/cargando productos/i)).toBeInTheDocument();

    // Resuelve y muestra cards
    def.resolve(demoProducts);
    await waitFor(() => {
      expect(screen.queryByText(/cargando productos/i)).not.toBeInTheDocument();
    });
    // Hay un botón "Ver" por cada producto
    const verButtons = screen.getAllByRole("button", { name: /ver/i });
    expect(verButtons.length).toBe(demoProducts.length);
  });

  it("filtra por categoría usando los botones de filtro", async () => {
    renderProductos();
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /ver/i }).length).toBe(3);
    });

    const user = userEvent.setup();

    // Filtrar: categoría 'Sol'
    await user.click(screen.getByRole("button", { name: /^Sol$/i }));
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /ver/i }).length).toBe(1);
      expect(screen.getByText(/lentes de sol modelo a/i)).toBeInTheDocument();
    });

    // Volver a Todos
    await user.click(screen.getByRole("button", { name: /todos/i }));
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /ver/i }).length).toBe(3);
    });
  });

  it("filtra por búsqueda en el nombre", async () => {
    renderProductos();
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /ver/i }).length).toBe(3);
    });

    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText(/buscar lentes/i);
    await user.type(searchInput, "lectura");

    await waitFor(() => {
      const verButtons = screen.getAllByRole("button", { name: /ver/i });
      expect(verButtons.length).toBe(1);
      expect(screen.getByText(/lentes de lectura c/i)).toBeInTheDocument();
    });
  });

  it("abre el modal, muestra detalles y agrega al carrito con cantidad", async () => {
    renderProductos();
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /ver/i }).length).toBe(3);
    });

    const user = userEvent.setup();

    // Abrir modal del primer producto (Sol)
    const cardVer = screen.getAllByRole("button", { name: /ver/i })[0];
    await user.click(cardVer);

    // Verifica contenido del modal
    const modal = document.getElementById("productModal");
    const titleEl = document.getElementById("modalTitle");
    const priceEl = document.getElementById("modalPrice");
    const catEl = document.getElementById("modalCategory");

    expect(titleEl?.textContent).toMatch(/lentes de sol modelo a/i);
    // Aceptar formatos con $ y dígitos (Intl puede variar)
    expect(priceEl?.textContent).toMatch(/\$\s*\d{1,3}(\.\d{3})*/);
    expect(catEl?.textContent).toMatch(/sol/i);

    // Cambiar cantidad: + + => 3
    const btns = within(modal).getAllByRole("button", { hidden: true });
    const plusBtn = btns.find((b) => b.querySelector(".bi.bi-plus"));
    await user.click(plusBtn);
    await user.click(plusBtn);

    // Agregar al carrito
    const addBtn = within(modal).getByRole("button", {
      name: /agregar al carrito/i,
      hidden: true,
    });
    await user.click(addBtn);

    expect(carrito.addItem).toHaveBeenCalledTimes(1);
    const [prodArg, qtyArg] = carrito.addItem.mock.calls[0];
    expect(qtyArg).toBe(3);
    expect(prodArg).toMatchObject({
      id: 1,
      nombre: expect.any(String),
      categoria: "Sol",
      precio: 39990,
      imagenUrl: expect.any(String),
    });
  });
});
