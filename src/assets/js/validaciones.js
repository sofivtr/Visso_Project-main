// Limpia RUT a formato sin separadores y mayúsculas
export function normalizarRut(rut = '') {
	return String(rut).replace(/[^0-9kK]/g, '').toUpperCase();
}

// Valida el dígito verificador del RUT chileno
export function validarRut(rut) {
	const limpio = normalizarRut(rut);
	if (!limpio) return false;
	const cuerpo = limpio.slice(0, -1);
	const dv = limpio.slice(-1);
	if (!/^\d+$/.test(cuerpo)) return false;
	if (cuerpo.length < 7 || cuerpo.length > 8) return false;
	if (/^(\d)\1+$/.test(cuerpo)) return false;
	let suma = 0;
	let multiplo = 2;
	for (let i = cuerpo.length - 1; i >= 0; i--) {
		suma += parseInt(cuerpo[i], 10) * multiplo;
		multiplo = multiplo < 7 ? multiplo + 1 : 2;
	}
	let dvEsperado = 11 - (suma % 11);
	dvEsperado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : String(dvEsperado);
	return dv === dvEsperado;
}

// Formatea RUT a 12.345.678-9
export function formatearRut(rut) {
	const limpio = normalizarRut(rut);
	if (!limpio) return '';
	const cuerpo = limpio.slice(0, -1);
	const dv = limpio.slice(-1);
	const conPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	return `${conPuntos}-${dv}`;
}

// Email simple: debe contener @ y dominio
export function validarEmail(email) {
	return /^\S+@\S+\.\S+$/.test(String(email).trim());
}

// Teléfono Chile esperado: 9 1234 5678 (sin +56)
export function validarTelefonoChile(telefono) {
	const s = String(telefono).trim();
	return /^(9\s?\d{4}\s?\d{4})$/.test(s.replace(/\s+/g, ''));
}

// Formatea a 9 1234 5678
export function formatearTelefonoChile(telefono) {
	const digits = String(telefono).replace(/\D/g, '');
	if (!digits.startsWith('9') || digits.length < 9) return telefono;
	const p1 = digits[0];
	const p2 = digits.slice(1, 5);
	const p3 = digits.slice(5, 9);
	return `${p1} ${p2} ${p3}`;
}


export function setFieldError(inputEl, errorEl, mensaje = '') {
	if (!inputEl || !errorEl) return;
	if (mensaje) {
		errorEl.textContent = mensaje;
		errorEl.style.display = 'block';
		inputEl.classList.add('is-invalid');
	} else {
		errorEl.textContent = '';
		errorEl.style.display = 'none';
		inputEl.classList.remove('is-invalid');
	}
}

