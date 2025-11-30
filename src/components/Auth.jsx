import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Api } from '../assets/js/api';
import { setCurrentUser } from '../assets/js/session';
import { validarRut, validarEmail, setFieldError, formatearRut } from '../assets/js/validaciones';

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  return (
<main className="flex-grow-1 main">
  <section id="auth-section" className="starter-section auth-section section auth-container">
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="auth-form">
            {!isRegister ? (
              <h2 id="formTitle" className="text-center mb-4">Iniciar Sesión</h2>
            ) : (
              <h3 id="registerTitle" className="text-center mb-4">Crear Cuenta</h3>
            )}
            {/* Formulario de Login */}
            {!isRegister && (
            <form id="loginForm" onSubmit={async (e) => {
              e.preventDefault();
              setLoginError('');
              const email = document.getElementById('username').value.trim();
              const password = document.getElementById('password').value;
              try {
                console.log('Intentando login con:', email);
                const resp = await Api.login({ email, password });
                const usuario = resp?.usuario || resp;
                const token = resp?.token;
                if (token) {
                  localStorage.setItem('token', token);
                }
                console.log('Login exitoso:', usuario);
                setCurrentUser(usuario);
                // Redirigir según rol
                if (usuario.rol === 'admin') {
                  navigate('/admin');
                } else {
                  navigate('/');
                }
                // Recargar para actualizar el header
                window.location.reload();
              } catch (err) {
                console.log('Error en login:', err);
                console.log('Error response:', err.response);
                const errorMsg = err.response?.data || 'Credenciales incorrectas';
                console.log('Mensaje de error:', errorMsg);
                setLoginError(errorMsg);
              }
            }}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Usuario o Email</label>
                <input type="text" className="form-control" id="username" required />
                <div id="usernameError" className="error-message" />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input type="password" className="form-control" id="password" required />
              </div>
              {loginError && (
                <div className="alert alert-danger" role="alert">
                  {loginError}
                </div>
              )}
              <div className="d-grid gap-2 d-md-flex justify-content-center">
                <button type="submit" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold">Ingresar</button>
                <button type="button" id="showRegister" className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold" onClick={() => setIsRegister(true)}>Crear Cuenta</button>
              </div>
            </form>
            )}
            {/* Formulario de Registro */}
            {isRegister && (
            <form id="registerForm" noValidate onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target;
              const nombre = form.querySelector('#newNombre');
              const apellido = form.querySelector('#newApellido');
              const rut = form.querySelector('#rut');
              const email = form.querySelector('#email');
              const pass = form.querySelector('#newPassword');
              const pass2 = form.querySelector('#confirmPassword');
              const nombreError = form.querySelector('#nombreError');
              const apellidoError = form.querySelector('#apellidoError');
              const rutError = form.querySelector('#rutError');
              const emailError = form.querySelector('#emailError');
              const passError = form.querySelector('#newPasswordError');
              const pass2Error = form.querySelector('#confirmPasswordError');
              let ok = true;
              // Nombre
              if (!nombre.value.trim()) { setFieldError(nombre, nombreError, 'Ingrese su nombre'); ok = false; } else { setFieldError(nombre, nombreError, ''); }
              // Apellido
              if (!apellido.value.trim()) { setFieldError(apellido, apellidoError, 'Ingrese su apellido'); ok = false; } else { setFieldError(apellido, apellidoError, ''); }
              // RUT
              if (rut.value) rut.value = formatearRut(rut.value);
              if (!validarRut(rut.value)) { setFieldError(rut, rutError, 'RUT inválido'); ok = false; } else { setFieldError(rut, rutError, ''); }
              // Email
              if (!validarEmail(email.value)) { setFieldError(email, emailError, 'Correo inválido'); ok = false; } else { setFieldError(email, emailError, ''); }
              // Password
              if (!pass.value || pass.value.length < 8) { setFieldError(pass, passError, 'Mínimo 8 caracteres'); ok = false; } else { setFieldError(pass, passError, ''); }
              if (pass2.value !== pass.value) { setFieldError(pass2, pass2Error, 'Las contraseñas no coinciden'); ok = false; } else { setFieldError(pass2, pass2Error, ''); }
              if (!ok) return;
              
              try {
                const nuevoUsuario = {
                  nombre: nombre.value.trim(),
                  apellido: apellido.value.trim(),
                  rut: rut.value,
                  email: email.value.trim(),
                  passwordHash: pass.value,
                  rol: 'usuario',
                  activo: true
                };
                const usuarioCreado = await Api.register(nuevoUsuario);
                // Hacer login automático después del registro exitoso
                const resp = await Api.login({ email: email.value.trim(), password: pass.value });
                const usuario = resp?.usuario || resp;
                const token = resp?.token;
                if (token) {
                  localStorage.setItem('token', token);
                }
                setCurrentUser(usuario);
                form.reset();
                navigate('/');
                window.location.reload();
              } catch (err) {
                const errorMsg = err.response?.data || 'Error al registrar usuario';
                // Mostrar error en el campo correcto
                if (errorMsg.toUpperCase().includes('RUT')) {
                  setFieldError(rut, rutError, errorMsg);
                } else if (errorMsg.toLowerCase().includes('correo') || errorMsg.toLowerCase().includes('email')) {
                  setFieldError(email, emailError, errorMsg);
                } else if (errorMsg.toLowerCase().includes('contraseña') || errorMsg.toLowerCase().includes('password')) {
                  setFieldError(pass, passError, errorMsg);
                } else {
                  setFieldError(email, emailError, errorMsg);
                }
              }
            }}>
              <div className="mb-3">
                <label htmlFor="newNombre" className="form-label">Nombre</label>
                <input type="text" className="form-control" id="newNombre" required />
                <div id="nombreError" className="error-message text-danger small" style={{display: 'none'}} />
              </div>
              <div className="mb-3">
                <label htmlFor="newApellido" className="form-label">Apellido</label>
                <input type="text" className="form-control" id="newApellido" required />
                <div id="apellidoError" className="error-message text-danger small" style={{display: 'none'}} />
              </div>
              <div className="mb-3">
                <label htmlFor="rut" className="form-label">RUT</label>
                <input type="text" className="form-control" id="rut" required placeholder="12.345.678-9" />
                <div id="rutError" className="error-message text-danger small" style={{display: 'none'}} />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" required autoComplete="email" placeholder="correo@ejemplo.com" />
                <div id="emailError" className="error-message text-danger small" style={{display: 'none'}} />
              </div>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">Contraseña</label>
                <input type="password" className="form-control" id="newPassword" required placeholder="Mínimo 8 caracteres" />
                <div id="newPasswordError" className="error-message text-danger small" style={{display: 'none'}} />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                <input type="password" className="form-control" id="confirmPassword" required placeholder="Repite la contraseña" />
                <div id="confirmPasswordError" className="error-message text-danger small" style={{display: 'none'}} />
              </div>
              <div className="d-grid gap-2 d-md-flex justify-content-center">
                <button type="submit" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold">Registrarse</button>
                <button type="button" id="showLogin" className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold" onClick={() => setIsRegister(false)}>Volver a Login</button>
              </div>
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

  );
}

export default Auth;
