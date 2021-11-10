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
  return anio.length === 4;
}

function validarCampoNumerico(entrada) {
  return Number.isInteger(entrada);
}

function validarCampoEdad(entrada) {
  return entrada > 0 && entrada < 120;
}

function validarCalificacion(calificacion) {
  return calificacion >= 0 && calificacion <= 5;
}

/**
 * Funcion para validar la fecha
 * @param {Date} date1 Fecha de inicio
 * @param {Date} date2 Fecha final
 * @returns True si date2 es posterior a date1
 */
 function validarFecha(date1, date2) {
  return new Date(date2) >= new Date(date1);
}

/**
 * Funcion que trae todos los elementos de la tabla CATEGORY
 * y los pinta en el select de category
 */
 async function inputCategory() {
  try {
    const categories = await $.ajax({
      url: URL_CATEGORY,
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    $("#category").empty();
    $("#category").append('<option value="0"> Seleccionar Categoria</option>');
    categories.forEach(category => {
      const option = $("<option>")
      option.attr("value", category.id);
      option.text(category.name);
      $("#category").append(option);  
    });  
  } catch (error) {
    console.error(`Hubo un problema trayendo los datos de category, Error: ${error.message}`);
  }  
}

/**
 * Funcion que trae todos los elementos de la tabla CLOUD
 * y los pinta en el select de cloud
 */
 async function inputCloud() {
  try {
    const clouds = await $.ajax({
      url: URL_CLOUD,
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    $("#cloud").empty();
    $("#cloud").append('<option value="0"> Seleccionar Cloud</option>');
    clouds.forEach((cloud) => {
      const option = $("<option>");
      option.attr("value", cloud.id);
      option.text(cloud.name);
      $("#cloud").append(option);
    });
  } catch (error) {
    console.error(
      `Hubo un problema trayendo los datos de cloud, Error: ${error.message}`
    );
  }
}

/**
 * Funcion que trae todos los elementos de la tabla CLIENT
 * y los pinta en el select de client
 */
async function inputClient() {
  try {
    const clients = await $.ajax({
      url: URL_CLIENT,
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    $("#client").empty();
    $("#client").append('<option value="0"> Seleccionar Client</option>');
    clients.forEach((client) => {
      const option = $("<option>");
      option.attr("value", client.idClient);
      option.text(client.name);
      $("#client").append(option);
    });
  } catch (error) {
    console.error(
      `Hubo un problema trayendo los datos de client, Error: ${error.message}`
    );
  }
}