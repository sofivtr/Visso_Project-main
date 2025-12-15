import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResultadoCompra from "../components/ResultadoCompra.jsx";

function setupPedido() {
  const pedido = {
    usuario: { rut: "12.345.678-9", email: "juan@example.com" },
    datosTransaccion: {
      nombreContacto: "Juan Pérez",
      email: "juan@example.com",
      telefono: "912345678",
      tipoEntrega: "DESPACHO",
      region: "Metropolitana",
      comuna: "Santiago",
      direccion: "Av. Siempre Viva 742",
      tipoPago: "DEBITO",
      infoTarjeta: "**** **** **** 1234",
    },
    carrito: {
      detalles: [
        {
          nombreProducto: "Lentes A",
          cantidad: 2,
          precioUnitario: 19990,
          producto: { imagenUrl: "/images/sol/s1.webp" },
        },
        {
          nombreProducto: "Gafas B",
          cantidad: 1,
          precioUnitario: 29990,
          producto: { imagenUrl: "/images/optica/o1.webp" },
        },
      ],
    },
    totales: { subtotal: 69970, iva: 13294, envio: 0, total: 83264 },
  };
  sessionStorage.setItem("ultimo_pedido", JSON.stringify(pedido));
  return pedido;
}

describe("ResultadoCompra.jsx", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test("renderiza datos y acciones cuando estado=ok", () => {
    const pedido = setupPedido();
    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/resultado", search: "?estado=ok" }]}
      >
        <ResultadoCompra />
      </MemoryRouter>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/Compra realizada exitosamente/i);

    // Datos del cliente visibles (inputs de solo lectura por displayValue)
    expect(
      screen.getAllByDisplayValue(pedido.datosTransaccion.nombreContacto).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByDisplayValue(pedido.usuario.rut).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByDisplayValue(pedido.usuario.email).length
    ).toBeGreaterThan(0);

    // Dirección
    expect(
      screen.getAllByDisplayValue(pedido.datosTransaccion.direccion).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByDisplayValue(pedido.datosTransaccion.region).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByDisplayValue(pedido.datosTransaccion.comuna).length
    ).toBeGreaterThan(0);

    // Tabla de items: nombres y alt de imágenes
    pedido.carrito.detalles.forEach((it) => {
      expect(screen.getByText(it.nombreProducto)).toBeInTheDocument();
      expect(screen.getByAltText(it.nombreProducto)).toBeInTheDocument();
    });

    // Total pagado visible
    expect(screen.getByText(/Total Pagado:/i)).toBeInTheDocument();

    const seguirComprando = screen.getByRole("link", {
      name: /Seguir Comprando/i,
    });
    expect(seguirComprando).toHaveAttribute(
      "href",
      expect.stringContaining("/productos")
    );
  });

  test("renderiza variante fallo cuando estado=fail", () => {
    setupPedido();
    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/resultado", search: "?estado=fail" }]}
      >
        <ResultadoCompra />
      </MemoryRouter>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/No se pudo completar la compra/i);

    const volverCarrito = screen.getByRole("link", {
      name: /Volver al Carrito/i,
    });
    expect(volverCarrito).toHaveAttribute(
      "href",
      expect.stringContaining("/carrito")
    );

    // Link de seguir comprando siempre presente
    const seguirComprando = screen.getByRole("link", {
      name: /Seguir Comprando/i,
    });
    expect(seguirComprando).toHaveAttribute(
      "href",
      expect.stringContaining("/productos")
    );
  });
});
