import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResultadoCompra from '../components/ResultadoCompra.jsx';

function setupPedido() {
  const pedido = {
    numero: '1234',
    cliente: { nombre: 'Juan Pérez', rut: '12.345.678-9', email: 'juan@example.com' },
    direccion: { calle: 'Av. Siempre Viva 742', region: 'Metropolitana', comuna: 'Santiago' },
    items: [
      { id: 1, nombre: 'Lentes A', precio: 19990, cantidad: 2, imagenKey: 'demo' },
      { id: 2, nombre: 'Gafas B', precio: 29990, cantidad: 1, imagenKey: 'demo' },
    ],
    totales: { total: 69970 },
  };
  sessionStorage.setItem('ultimo_pedido', JSON.stringify(pedido));
  return pedido;
}

describe('ResultadoCompra.jsx', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('renderiza datos y acciones cuando estado=ok', () => {
    const pedido = setupPedido();
    render(
      <MemoryRouter initialEntries={[{ pathname: '/resultado', search: '?estado=ok' }] }>
        <ResultadoCompra />
      </MemoryRouter>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/Se ha realizado la compra/i);
    expect(alert).toHaveTextContent(new RegExp(`nro\\s*${pedido.numero}`));

    // Datos del cliente visibles (inputs de solo lectura por displayValue)
    expect(screen.getByDisplayValue(pedido.cliente.nombre)).toBeInTheDocument();
    expect(screen.getByDisplayValue(pedido.cliente.rut)).toBeInTheDocument();
    expect(screen.getByDisplayValue(pedido.cliente.email)).toBeInTheDocument();

    // Dirección
    expect(screen.getByDisplayValue(pedido.direccion.calle)).toBeInTheDocument();
    expect(screen.getByDisplayValue(pedido.direccion.region)).toBeInTheDocument();
    expect(screen.getByDisplayValue(pedido.direccion.comuna)).toBeInTheDocument();

    // Tabla de items: nombres y alt de imágenes
    pedido.items.forEach((it) => {
      expect(screen.getByText(it.nombre)).toBeInTheDocument();
      expect(screen.getByAltText(it.nombre)).toBeInTheDocument();
    });

    // Total pagado visible
    expect(screen.getByText(/Total pagado:/i)).toBeInTheDocument();

    // Acciones del estado OK
    const imprimir = screen.getByRole('button', { name: /Imprimir boleta en PDF/i });
    const enviar = screen.getByRole('button', { name: /Enviar boleta por email/i });
    expect(imprimir).toBeDisabled();
    expect(enviar).toBeDisabled();

    const seguirComprando = screen.getByRole('link', { name: /Seguir comprando/i });
    expect(seguirComprando).toHaveAttribute('href', expect.stringContaining('/productos'));
  });

  test('renderiza variante fallo cuando estado=fail', () => {
    setupPedido();
    render(
      <MemoryRouter initialEntries={[{ pathname: '/resultado', search: '?estado=fail' }] }>
        <ResultadoCompra />
      </MemoryRouter>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/No se pudo realizar el pago/i);

    const volverPagar = screen.getByRole('link', { name: /Volver a realizar el pago/i });
    expect(volverPagar).toHaveAttribute('href', expect.stringContaining('/carrito'));

    // Link de seguir comprando siempre presente
    const seguirComprando = screen.getByRole('link', { name: /Seguir comprando/i });
    expect(seguirComprando).toHaveAttribute('href', expect.stringContaining('/productos'));
  });
});