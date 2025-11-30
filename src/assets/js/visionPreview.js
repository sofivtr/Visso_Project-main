export function iniciarVistaPreviaAuto({ idMedio, idEntrada, origen, ancho = 220, alto = 124, desenfoque = 8 }) {
  const medio = document.getElementById(idMedio);
  const entrada = document.getElementById(idEntrada);
  if (!medio || !entrada) return;

  let elementoMedio = medio.firstElementChild;
  if (!elementoMedio) {
    const iframe = document.createElement('iframe');
    iframe.title = 'Vista Previa de Visión';
    iframe.src = origen || 'https://lottie.host/embed/af5df129-1927-42ac-92ea-a01d4299cecf/g3WuUxTXWY.lottie';
    iframe.style.width = ancho + 'px';
    iframe.style.height = alto + 'px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.style.background = '#fff';
    elementoMedio = iframe;
    medio.appendChild(iframe);
  }

  const aplicarDesenfoque = (px) => {
    elementoMedio.style.filter = `blur(${px}px)`;
    elementoMedio.style.transition = 'filter 0.8s ease';
  };


  aplicarDesenfoque(desenfoque);


  entrada.addEventListener('input', () => {
    const valor = String(entrada.value || '');
    const tieneDigito = /\d/.test(valor);
    if (tieneDigito) aplicarDesenfoque(0); else aplicarDesenfoque(desenfoque);
  });
}
