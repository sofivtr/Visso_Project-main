import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Carrito from '../components/Carrito.jsx';

// Mockear módulo carrito
vi.mock('../assets/js/carrito', () => ({
  getCart: vi.fn(),
  updateQty: vi.fn(),
  removeItem: vi.fn(),
  clearCart: vi.fn(),
  subscribeCart: vi.fn(),
  computeTotals: vi.fn(),
}));

// Stub para imágenes que el componente podría usar indirectamente
vi.mock('../assets/js/images', () => ({
  default: {},
}));

import * as carrito from '../assets/js/carrito';

describe('Carrito.jsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('estado vacío: muestra mensaje y acciones para continuar', () => {
    carrito.getCart.mockReturnValue([]);
    carrito.subscribeCart.mockImplementation(() => () => {});
    carrito.computeTotals.mockReturnValue({ subtotal: 0, iva: 0, envio: 0, total: 0 });

    render(
      <MemoryRouter initialEntries={['/carrito']}>
        <Carrito />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /carrito de compras/i })).toBeInTheDocument();
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /continuar comprando/i })).toBeInTheDocument();
  });

  it('checkout: botón visible y modal accesible con formulario', () => {
    const items = [
      { id: 1, nombre: 'Producto A', precio: 100, cantidad: 2, imagenKey: '1' },
      { id: 2, nombre: 'Producto B', precio: 50, cantidad: 1, imagenKey: '2' },
    ];

    carrito.getCart.mockReturnValue(items);
    carrito.subscribeCart.mockImplementation(() => () => {});
    carrito.computeTotals.mockReturnValue({ subtotal: 250, iva: 30, envio: 0, total: 280 });

    render(
      <MemoryRouter initialEntries={['/carrito']}>
        <Carrito />
      </MemoryRouter>
    );

    // Botón de checkout visible
    const checkoutBtn = screen.getByRole('button', { name: /proceder al pago/i });
    expect(checkoutBtn).toBeInTheDocument();

    // Contenido del modal está en el DOM (aunque oculto) y accesible
    const modal = document.getElementById('checkoutModal');
    expect(modal).toBeTruthy();

    // Título del modal (oculto por Bootstrap)
    expect(
      within(modal).getByRole('heading', { name: /finalizar compra/i, hidden: true })
    ).toBeInTheDocument();

    // Campo Nombre por label
    expect(
      within(modal).getByLabelText(/nombre completo/i, { selector: 'input', hidden: true })
    ).toBeInTheDocument();

    // Campos Email y Teléfono por ID (ocultos)
    const email = modal.querySelector('#checkoutEmail');
    const telefono = modal.querySelector('#checkoutTelefono');
    expect(email).toBeTruthy();
    expect(telefono).toBeTruthy();

    // Total mostrado (texto dentro del modal)
    expect(within(modal).getByText(/^\s*Total:\s*$/i)).toBeInTheDocument();
    const totalValue = modal.querySelector('#checkoutTotal');
    expect(totalValue).toHaveTextContent('$280');
  });
});