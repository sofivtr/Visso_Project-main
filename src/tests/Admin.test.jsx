import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Admin from "../components/Admin.jsx";
import { Api } from "../assets/js/api";

// Mock API acorde al backend + JWT
vi.mock("../assets/js/api", () => ({
  Api: {
    users: vi.fn(async () => [
      {
        id: 1,
        nombre: "Juan",
        apellido: "Pérez",
        email: "juan@example.com",
        rol: "usuario",
        activo: true,
      },
      {
        id: 2,
        nombre: "Ana",
        apellido: "López",
        email: "ana@example.com",
        rol: "admin",
        activo: true,
      },
    ]),
    products: vi.fn(async () => [
      {
        id: 1,
        codigoProducto: "P001",
        nombre: "Producto",
        descripcion: "Desc",
        precio: 10000,
        stock: 5,
        categoria: { id: 10, nombre: "Óptica" },
        marca: { id: 20, nombre: "Ray-Ban" },
      },
    ]),
    categories: vi.fn(async () => [
      { id: 10, nombre: "Óptica" },
      { id: 11, nombre: "Sol" },
    ]),
    brands: vi.fn(async () => [
      { id: 20, nombre: "Ray-Ban" },
      { id: 21, nombre: "Oakley" },
    ]),
    getPedidos: vi.fn(async () => []),
    getMensajes: vi.fn(async () => []),
    cambiarEstadoMensaje: vi.fn(async () => ({ ok: true })),
    marcarComoEnviado: vi.fn(async () => ({ ok: true })),
    createUser: vi.fn(async () => ({ id: 3 })),
    updateUser: vi.fn(async () => ({})),
    createProduct: vi.fn(async () => ({ id: 2 })),
    updateProduct: vi.fn(async () => ({})),
    createBrand: vi.fn(async () => ({ id: 22 })),
    updateBrand: vi.fn(async () => ({})),
    createCategory: vi.fn(async () => ({ id: 12 })),
    updateCategory: vi.fn(async () => ({})),
    deleteProduct: vi.fn(async () => {}),
    deleteBrand: vi.fn(async () => {}),
    deleteCategory: vi.fn(async () => {}),
  },
}));

function renderAdmin() {
  return render(
    <MemoryRouter>
      <Admin />
    </MemoryRouter>
  );
}

function createDeferred() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe("Admin - Usuario modal", () => {
  test("muestra errores con datos inválidos en Usuario", async () => {
    const user = userEvent.setup();
    const { container } = renderAdmin();

    await user.click(screen.getByRole("button", { name: /^Usuarios$/i }));
    await user.click(screen.getByRole("button", { name: /agregar usuario/i }));

    const userModal = container.querySelector("#userModal");
    const submitUserBtn = container.querySelector(
      'button[form="userAdminForm"]'
    );
    await user.click(submitUserBtn);

    expect(within(userModal).getByText(/ingrese el nombre/i)).toBeVisible();
    expect(within(userModal).getByText(/rut inválido/i)).toBeVisible();
    expect(within(userModal).getByText(/correo inválido/i)).toBeVisible();
    expect(within(userModal).getByText(/mínimo 8 caracteres/i)).toBeVisible();
  });

  test("valida y formatea correctamente con datos válidos en Usuario", async () => {
    const user = userEvent.setup();
    const { container } = renderAdmin();

    await user.click(screen.getByRole("button", { name: /^Usuarios$/i }));
    await user.click(screen.getByRole("button", { name: /agregar usuario/i }));

    const userModal = container.querySelector("#userModal");
    const nombreInput = userModal.querySelector("#userNombre");
    const apellidoInput = userModal.querySelector("#userApellido");
    const rutInput = userModal.querySelector("#userRut");
    const emailInput = userModal.querySelector("#userEmail");
    const passInput = userModal.querySelector("#userPassword");

    await user.type(nombreInput, "Laura");
    await user.type(apellidoInput, "Gómez");
    await user.type(rutInput, "12345678-5");
    await user.type(emailInput, "laura@example.com");
    await user.type(passInput, "12345678");

    const submitUserBtn = container.querySelector(
      'button[form="userAdminForm"]'
    );
    await user.click(submitUserBtn);

    expect(
      within(userModal).getByText(/usuario guardado con éxito/i)
    ).toBeVisible();
    expect(Api.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ rut: "12.345.678-5" })
    );
  });
});

describe("Admin - Producto modal", () => {
  test("muestra errores con datos inválidos en Producto", async () => {
    const user = userEvent.setup();
    const { container } = renderAdmin();

    // Cambiar al tab de productos
    await user.click(screen.getByRole("button", { name: /^Productos$/i }));
    await user.click(screen.getByRole("button", { name: /agregar producto/i }));

    // Esperar modal y hacer submit inmediatamente
    const productModal = container.querySelector("#productModal");
    const submitProductBtn = container.querySelector(
      'button[form="productAdminForm"]'
    );
    await user.click(submitProductBtn);

    const nombreError = await within(productModal).findByText(
      /ingrese el nombre/i
    );
    expect(nombreError).toBeVisible();
    const categoriaError = await within(productModal).findByText(
      /seleccione una categoría/i
    );
    expect(categoriaError).toBeVisible();
    const precioError = await within(productModal).findByText(
      /ingrese el precio/i
    );
    expect(precioError).toBeVisible();
  });

  test("valida correctamente con datos válidos en Producto", async () => {
    const user = userEvent.setup();
    const { container } = renderAdmin();

    // Cambiar al tab de productos
    await user.click(screen.getByRole("button", { name: /^Productos$/i }));
    await user.click(screen.getByRole("button", { name: /agregar producto/i }));

    const productModal = container.querySelector("#productModal");
    const nombreInput = productModal.querySelector("#productNombre");
    const categoriaInput = productModal.querySelector("#productCategoria");
    const precioInput = productModal.querySelector("#productPrecio");
    const codigoInput = productModal.querySelector("#productCodigo");
    const marcaInput = productModal.querySelector("#productMarca");
    const imagenInput = productModal.querySelector("#productImagen");

    await user.type(codigoInput, "P002");
    await user.type(nombreInput, "Montura");
    await user.selectOptions(categoriaInput, "10");
    await user.selectOptions(marcaInput, "20");
    await user.type(precioInput, "15000");
    const file = new File(["(imagen)"], "foto.png", { type: "image/png" });
    await user.upload(imagenInput, file);

    const submitProductBtn = container.querySelector(
      'button[form="productAdminForm"]'
    );
    await user.click(submitProductBtn);

    const successMsg = await within(productModal).findByText(
      /producto guardado con éxito/i
    );
    expect(successMsg).toBeVisible();
  });
});

describe("Admin - Tabs y estados", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("muestra Cargando en ambos tabs hasta resolver", async () => {
    const user = userEvent.setup();

    const usersDef = createDeferred();
    const productsDef = createDeferred();
    Api.users.mockImplementation(() => usersDef.promise);
    Api.products.mockImplementation(() => productsDef.promise);
    Api.categories.mockResolvedValueOnce([]);
    Api.brands.mockResolvedValueOnce([]);

    renderAdmin();

    // Ir al tab de usuarios
    await user.click(screen.getByRole("button", { name: /^Usuarios$/i }));
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();

    // Cambiar al tab de productos y aún debe mostrar cargando
    await user.click(screen.getByRole("button", { name: /^Productos$/i }));
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();

    // Resolver ambas promesas
    usersDef.resolve([
      { id: 1, nombre: "Juan", email: "juan@example.com", rol: "user" },
    ]);
    productsDef.resolve([
      { id: 10, nombre: "Producto", categoria: "marcos", precio: 10000 },
    ]);

    // Verificar contador en usuarios
    await user.click(screen.getByRole("button", { name: /^Usuarios$/i }));
    const usuariosText = screen.getByText(/total de usuarios/i);
    const usuariosCount = usuariosText.previousElementSibling;
    expect(usuariosCount).toHaveTextContent("1");

    // Verificar contador en productos
    await user.click(screen.getByRole("button", { name: /^Productos$/i }));
    const productosText = screen.getByText(/total de productos/i);
    const productosCount = productosText.previousElementSibling;
    expect(productosCount).toHaveTextContent("1");
  });

  test("muestra estados vacíos Sin usuarios y Sin productos", async () => {
    const user = userEvent.setup();
    Api.users.mockResolvedValueOnce([]);
    Api.products.mockResolvedValueOnce([]);
    Api.categories.mockResolvedValueOnce([]);
    Api.brands.mockResolvedValueOnce([]);

    renderAdmin();

    // Usuarios vacío (navegar al tab primero)
    await user.click(screen.getByRole("button", { name: /^Usuarios$/i }));
    await screen.findByText(/sin usuarios/i);
    const usuariosText = screen.getByText(/total de usuarios/i);
    const usuariosCount = usuariosText.previousElementSibling;
    expect(usuariosCount).toHaveTextContent("0");

    // Productos vacío
    await user.click(screen.getByRole("button", { name: /^Productos$/i }));
    await screen.findByText(/sin productos/i);
    const productosText = screen.getByText(/total de productos/i);
    const productosCount = productosText.previousElementSibling;
    expect(productosCount).toHaveTextContent("0");
  });
});
