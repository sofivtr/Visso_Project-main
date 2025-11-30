import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from '../components/Home.jsx';

describe('Home.jsx', () => {
  test('CTA y controles del carrusel están presentes y apuntan a /productos', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const heroLink = screen.getByRole('link', { name: /Ver Productos/i });
    expect(heroLink).toHaveAttribute('href', expect.stringContaining('/productos'));

    const tiendaCTA = screen.getByRole('link', { name: /Ir a tienda/i });
    expect(tiendaCTA).toHaveAttribute('href', expect.stringContaining('/productos'));

    const anterior = screen.getByRole('button', { name: /Anterior/i });
    const siguiente = screen.getByRole('button', { name: /Siguiente/i });
    expect(anterior.getAttribute('data-bs-target')).toBe('#tiendaCarousel');
    expect(siguiente.getAttribute('data-bs-target')).toBe('#tiendaCarousel');
  });

  test('Formulario de contacto: muestra errores con datos inválidos', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const nombre = screen.getByLabelText(/Nombre Completo \*/i);
    const email = screen.getByLabelText(/Correo Electrónico \*/i);
    const telefono = screen.getByLabelText(/Teléfono/i);
    const asunto = screen.getByLabelText(/Asunto \*/i);
    const mensaje = screen.getByLabelText(/Mensaje \*/i);

    // nombre vacío
    // email inválido
    await user.type(email, 'foo');
    // teléfono inválido
    await user.type(telefono, '123');
    // asunto sin seleccionar (forzamos placeholder)
    fireEvent.change(asunto, { target: { value: '' } });
    // mensaje corto
    await user.type(mensaje, 'hola');

    const enviar = screen.getByRole('button', { name: /Enviar Mensaje/i });
    await user.click(enviar);

    const nombreError = await screen.findByText(/Por favor ingresa tu nombre completo/i);
    const emailError = await screen.findByText(/Por favor ingresa un correo válido/i);
    const telefonoError = await screen.findByText(/El formato es 9 1234 5678/i);
    await waitFor(() => expect(document.getElementById('asuntoError')).toBeVisible());
    const mensajeError = await screen.findByText(/Por favor ingresa tu mensaje \(mínimo 10 caracteres\)/i);

    expect(nombreError).toBeVisible();
    expect(emailError).toBeVisible();
    expect(telefonoError).toBeVisible();
    expect(mensajeError).toBeVisible();

    const success = screen.getByText(/Mensaje enviado exitosamente/i);
    expect(success).not.toBeVisible(); // oculto tras reset en submit inválido
  });

  test('Formulario de contacto: éxito con datos válidos', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const nombre = screen.getByLabelText(/Nombre Completo \*/i);
    const email = screen.getByLabelText(/Correo Electrónico \*/i);
    const telefono = screen.getByLabelText(/Teléfono/i);
    const asunto = screen.getByLabelText(/Asunto \*/i);
    const mensaje = screen.getByLabelText(/Mensaje \*/i);

    await user.type(nombre, 'Juan Pérez');
    await user.type(email, 'juan@example.com');
    await user.type(telefono, '912345678');
    await user.selectOptions(asunto, 'consulta');
    await user.type(mensaje, 'Este es un mensaje válido que supera diez caracteres');

    const enviar = screen.getByRole('button', { name: /Enviar Mensaje/i });
    await user.click(enviar);

    const success = screen.getByText(/Mensaje enviado exitosamente/i);
    expect(success).toBeVisible();

    // Verifica que los elementos de error están ocultos (se limpian al enviar válido)
    expect(document.getElementById('nombreError')).not.toBeVisible();
    expect(document.getElementById('emailError')).not.toBeVisible();
    expect(document.getElementById('telefonoError')).not.toBeVisible();
    expect(document.getElementById('asuntoError')).not.toBeVisible();
    expect(document.getElementById('mensajeError')).not.toBeVisible();
  });
});