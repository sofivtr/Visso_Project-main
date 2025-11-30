import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock del módulo de carrito para interceptar addItem
vi.mock('../assets/js/carrito', () => ({
  addItem: vi.fn(),
}));
import * as carrito from '../assets/js/carrito';

// Spy sobre la API de productos
import { Api } from '../assets/js/api';
import Productos from '../components/Productos';

function createDeferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

const demoProducts = [
  { id: 1, nombre: 'Lentes de Sol Modelo A', categoria: 'sol', precio: 39990, imagenKey: '1', descripcion: 'Protección UV' },
  { id: 2, nombre: 'Lentes Oftálmicos Modelo B', categoria: 'oftalmicos', precio: 49990, imagenKey: '2', descripcion: 'Marco liviano' },
  { id: 3, nombre: 'Lentes de Lectura C', categoria: 'lectura', precio: 19990, imagenKey: '3', descripcion: 'Confort diario' },
];

describe('Productos - Render, filtros, modal y carrito', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Api, 'products').mockResolvedValue(demoProducts);
  });

  it('muestra estado de "Cargando" y luego la lista de productos', async () => {
    const def = createDeferred();
    Api.products.mockReturnValueOnce(def.promise);

    render(<Productos />);

    // Estado de carga inicial
    expect(screen.getByText(/cargando productos/i)).toBeInTheDocument();

    // Resuelve y muestra cards
    def.resolve(demoProducts);
    await waitFor(() => {
      expect(screen.queryByText(/cargando productos/i)).not.toBeInTheDocument();
    });
    // Hay un botón "Ver" por cada producto
    const verButtons = screen.getAllByRole('button', { name: /ver/i });
    expect(verButtons.length).toBe(demoProducts.length);
  });

  it('filtra por categoría usando los botones de filtro', async () => {
    render(<Productos />);
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /ver/i }).length).toBe(3);
    });

    const user = userEvent.setup();

    // Filtrar: Gafas de Sol (categoria 'sol')
    await user.click(screen.getByRole('button', { name: /gafas de sol/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /ver/i }).length).toBe(1);
      expect(screen.getByText(/lentes de sol modelo a/i)).toBeInTheDocument();
    });

    // Volver a Todos
    await user.click(screen.getByRole('button', { name: /todos/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /ver/i }).length).toBe(3);
    });
  });

  it('filtra por búsqueda en el nombre', async () => {
    render(<Productos />);
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /ver/i }).length).toBe(3);
    });

    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText(/buscar lentes/i);
    await user.type(searchInput, 'lectura');

    await waitFor(() => {
      const verButtons = screen.getAllByRole('button', { name: /ver/i });
      expect(verButtons.length).toBe(1);
      expect(screen.getByText(/lentes de lectura c/i)).toBeInTheDocument();
    });
  });

  it('abre el modal, muestra detalles y agrega al carrito con cantidad', async () => {
    render(<Productos />);
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /ver/i }).length).toBe(3);
    });

    const user = userEvent.setup();

    // Abrir modal del primer producto (Sol)
    const cardVer = screen.getAllByRole('button', { name: /ver/i })[0];
    await user.click(cardVer);

    // Verifica contenido del modal
    const modal = document.getElementById('productModal');
    const titleEl = document.getElementById('modalTitle');
    const priceEl = document.getElementById('modalPrice');
    const catEl = document.getElementById('modalCategory');
    const qtyEl = document.getElementById('quantity');

    expect(titleEl?.textContent).toMatch(/lentes de sol modelo a/i);
    // Aceptar formatos con $ y dígitos (Intl puede variar)
    expect(priceEl?.textContent).toMatch(/\$\s*\d{1,3}(\.\d{3})*/);
    expect(catEl?.textContent).toMatch(/gafas de sol/i);
    expect(qtyEl?.value).toBe('1');

    // Cambiar cantidad: + + => 3
    const plusBtn = within(modal).getByRole('button', { name: '+', hidden: true });
    await user.click(plusBtn);
    await user.click(plusBtn);
    expect(document.getElementById('quantity')?.value).toBe('3');

    // Agregar al carrito
    const addBtn = within(modal).getByRole('button', { name: /agregar al carrito/i, hidden: true });
    await user.click(addBtn);

    expect(carrito.addItem).toHaveBeenCalledTimes(1);
    const [prodArg, qtyArg] = carrito.addItem.mock.calls[0];
    expect(qtyArg).toBe(3);
    expect(prodArg).toMatchObject({ id: 1, nombre: expect.any(String), categoria: 'sol', precio: 39990, imagenKey: '1' });
  });

  it('clamp de cantidad entre 1 y 10 en el modal', async () => {
    render(<Productos />);
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /ver/i }).length).toBe(3);
    });
    const user = userEvent.setup();

    // Abrimos un producto
    await user.click(screen.getAllByRole('button', { name: /ver/i })[1]);
    const modal = document.getElementById('productModal');
    const qtyEl = document.getElementById('quantity');
    const plusBtn = within(modal).getByRole('button', { name: '+', hidden: true });
    const minusBtn = within(modal).getByRole('button', { name: '−', hidden: true });

    // Subimos hasta 11 intentos, debe quedar en 10
    for (let i = 0; i < 15; i++) {
      await user.click(plusBtn);
    }
    expect(qtyEl?.value).toBe('10');

    // Bajamos por debajo de 1, debe quedar en 1
    for (let i = 0; i < 15; i++) {
      await user.click(minusBtn);
    }
    expect(qtyEl?.value).toBe('1');

    // Seteamos manualmente a 7 por input
    fireEvent.change(qtyEl, { target: { value: '7' } });
    await waitFor(() => {
      expect(qtyEl?.value).toBe('7');
    });
  });
});