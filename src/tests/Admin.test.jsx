import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Admin from '../components/Admin.jsx';
import { Api } from '../assets/js/api';

// Mock API to avoid real network calls
vi.mock('../assets/js/api', () => ({
  Api: {
    users: vi.fn(async () => [
      { id: 1, nombre: 'Juan', email: 'juan@example.com', rol: 'user' },
      { id: 2, nombre: 'Ana', email: 'ana@example.com', rol: 'admin' },
    ]),
    products: vi.fn(async () => [
      { id: 1, nombre: 'Producto', categoria: 'marcos', precio: 10000 },
    ]),
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
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
}

describe('Admin - Usuario modal', () => {
  test('muestra errores con datos inválidos en Usuario', async () => {
    const user = userEvent.setup();
    const { container } = renderAdmin();

    await user.click(screen.getByRole('button', { name: /agregar usuario/i }));

    const userModal = container.querySelector('#userModal');
    const submitUserBtn = container.querySelector('button[form="userAdminForm"]');
    await user.click(submitUserBtn);

    expect(within(userModal).getByText(/ingrese el nombre/i)).toBeVisible();
    expect(within(userModal).getByText(/rut inválido/i)).toBeVisible();
    expect(within(userModal).getByText(/correo inválido/i)).toBeVisible();
    expect(within(userModal).getByText(/formato: 9 1234 5678/i)).toBeVisible();
    expect(within(userModal).getByText(/mínimo 8 caracteres/i)).toBeVisible();
  });

  test('valida y formatea correctamente con datos válidos en Usuario', async () => {
    const user = userEvent.setup();
    const { container } = renderAdmin();

    await user.click(screen.getByRole('button', { name: /agregar usuario/i }));

    const userModal = container.querySelector('#userModal');
    const nombreInput = userModal.querySelector('#userNombre');
    const rutInput = userModal.querySelector('#userRut');
    const emailInput = userModal.querySelector('#userEmail');
    const telInput = userModal.querySelector('#userTelefono');
    const passInput = userModal.querySelector('#userPassword');

    await user.type(nombreInput, 'Laura');
    await user.type(rutInput, '12345678-5');
    await user.type(emailInput, 'laura@example.com');
    await user.type(telInput, '912345678');
    await user.type(passInput, '12345678');

    const submitUserBtn = container.querySelector('button[form="userAdminForm"]');
    await user.click(submitUserBtn);

    expect(within(userModal).getByText(/usuario guardado con éxito/i)).toBeVisible();
    expect(rutInput.value).toBe('12.345.678-5');
    expect(telInput.value).toBe('9 1234 5678');
  });
});

describe('Admin - Producto modal', () => {
  test('muestra errores con datos inválidos en Producto', async () => {
    const user = userEvent.setup();
    const { container } = renderAdmin();

    // Cambiar al tab de productos antes de buscar el botón
    await user.click(screen.getByRole('button', { name: /gestión de productos/i }));
    await user.click(screen.getByRole('button', { name: /agregar producto/i }));

    const productModal = container.querySelector('#productModal');
    const submitProductBtn = container.querySelector('button[form="productAdminForm"]');
    await user.click(submitProductBtn);

    expect(within(productModal).getByText(/ingrese el nombre/i)).toBeVisible();
    expect(within(productModal).getByText(/ingrese la categoría/i)).toBeVisible();
    expect(within(productModal).getByText(/ingrese un precio válido/i)).toBeVisible();
  });

  test('valida correctamente con datos válidos en Producto', async () => {
    const user = userEvent.setup();
    const { container } = renderAdmin();

    // Cambiar al tab de productos antes de buscar el botón
    await user.click(screen.getByRole('button', { name: /gestión de productos/i }));
    await user.click(screen.getByRole('button', { name: /agregar producto/i }));

    const productModal = container.querySelector('#productModal');
    const nombreInput = productModal.querySelector('#productNombre');
    const categoriaInput = productModal.querySelector('#productCategoria');
    const precioInput = productModal.querySelector('#productPrecio');

    await user.type(nombreInput, 'Montura');
    await user.type(categoriaInput, 'marcos');
    await user.type(precioInput, '15000');

    const submitProductBtn = container.querySelector('button[form="productAdminForm"]');
    await user.click(submitProductBtn);

    expect(within(productModal).getByText(/producto guardado con éxito/i)).toBeVisible();
  });
});

describe('Admin - Tabs y estados', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('muestra Cargando en ambos tabs hasta resolver', async () => {
    const user = userEvent.setup();

    const usersDef = createDeferred();
    const productsDef = createDeferred();
    Api.users.mockImplementation(() => usersDef.promise);
    Api.products.mockImplementation(() => productsDef.promise);

    renderAdmin();

    // Por defecto está el tab de usuarios
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();

    // Cambiar al tab de productos y aún debe mostrar cargando
    await user.click(screen.getByRole('button', { name: /gestión de productos/i }));
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();

    // Resolver ambas promesas
    usersDef.resolve([{ id: 1, nombre: 'Juan', email: 'juan@example.com', rol: 'user' }]);
    productsDef.resolve([{ id: 10, nombre: 'Producto', categoria: 'marcos', precio: 10000 }]);

    // Verificar contador en usuarios
    await user.click(screen.getByRole('button', { name: /gestión de usuarios/i }));
    const usuariosText = screen.getByText(/total de usuarios/i);
    const usuariosCount = usuariosText.previousElementSibling;
    expect(usuariosCount).toHaveTextContent('1');

    // Verificar contador en productos
    await user.click(screen.getByRole('button', { name: /gestión de productos/i }));
    const productosText = screen.getByText(/total de productos/i);
    const productosCount = productosText.previousElementSibling;
    expect(productosCount).toHaveTextContent('1');
  });

  test('muestra estados vacíos Sin usuarios y Sin productos', async () => {
    const user = userEvent.setup();
    Api.users.mockResolvedValueOnce([]);
    Api.products.mockResolvedValueOnce([]);

    renderAdmin();

    // Usuarios vacío
    await screen.findByText(/sin usuarios/i);
    const usuariosText = screen.getByText(/total de usuarios/i);
    const usuariosCount = usuariosText.previousElementSibling;
    expect(usuariosCount).toHaveTextContent('0');

    // Productos vacío
    await user.click(screen.getByRole('button', { name: /gestión de productos/i }));
    await screen.findByText(/sin productos/i);
    const productosText = screen.getByText(/total de productos/i);
    const productosCount = productosText.previousElementSibling;
    expect(productosCount).toHaveTextContent('0');
  });
});