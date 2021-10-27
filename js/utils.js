function validarCamposVacios(campos) {
  for (let index = 0; index < campos.length; index++) {
    if (campos[index].value === "") {
      return false;
    }
  }
  return true;
}

function validarMenor45Caracteres(texto) {
  return texto.length <= 45;
}

function validarMenor250Caracteres(texto) {
  return texto.length <= 250;
}

function validarAnio(anio) {
  console.log(anio);
  return anio.length === 4;
}

function validarCampoNumerico(entrada) {
  return Number.isInteger(entrada);
}

function validarCampoEdad(entrada) {
  return entrada > 0 && entrada < 120;
}