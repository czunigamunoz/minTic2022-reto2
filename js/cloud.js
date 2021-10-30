const DATAREQUEST = {
  url: "http://localhost:8080/api/Cloud",
  dataType: "json",
  contentType: "application/json; charset=utf-8",
};
let ID_CLOUD = null;

/**
 * Funcion que limpia los campos del formulario
 */
function limpiarCampos() {
  $("#name").val("");
  $("#brand").val("");
  $("#year").val("");
  $("#description").val("");
  $("#category").attr("disabled", false);
  inputCategory();
}

/**
 * Funcion que pinta el contenido de la tabla
 * @param {Response} response
 */
function pintarElemento(response) {
  $("#contenidoTabla").empty();
  response.forEach((element) => {
    let row = $("<tr>");
    row.append($("<td>").text(element.name));
    row.append($("<td>").text(element.brand));
    row.append($("<td>").text(element.year));
    row.append($("<td>").text(element.description));
    row.append($("<td>").text(element.category.name));

    let divMessage = $("<div>").attr("class", "select-container");
    let selectMessage = $("<select>").attr("class", "select-item");
    element.messages.forEach((message) => {
      selectMessage.append(`<option value="${message.idMessage}"> ${message.messageText} </option>`);
    });
    divMessage.append(selectMessage);
    row.append($("<td>").append(divMessage));

    let divReservation = $("<div>").attr("class", "select-container");
    let selectReservation = $("<select>").attr("class", "select-item");
    element.reservations.forEach((reservation) => {
      selectReservation.append(`<option value="${reservation.idReservation}"> ${reservation.idReservation} </option>`)
    });
    divReservation.append(selectReservation);
    row.append($("<td>").append(divReservation));

    row.append(
      $("<td class='text-center no-padding'>").append(
        `<button type="button" class="btn btn-outline-warning btn-block w-100" onclick="obtenerElemento(${element.id})">Editar</button>`
      )
    );
    row.append(
      $("<td class='text-center'>").append(
        `<button type="button" class="btn btn-outline-danger btn-block w-100" onclick="eliminar(${element.id})">Eliminar</button>`
      )
    );
    $("#contenidoTabla").append(row);
  });
}

/**
 * Funcion que guarda en un objeto los campos del formulario
 * @returns Objeto con los datos del formulario
 */
function obtenerCampos() {
  const data = {
    name: $("#name").val(),
    brand: $("#brand").val(),
    year: $("#year").val(),
    description: $("#description").val(),
    category: $("#category").val(),
  };
  return data;
}

/**
 * Funcion que asigna a los campos del formulario los datos entregados
 * @param {Object} data data traida de la base de datos
 */
function setCampos(data) {
  $("#name").val(data.name);
  $("#brand").val(data.brand);
  $("#year").val(data.year);
  $("#description").val(data.description);
  $("#category").empty();
  $("#category").append(`<option value="${data.category.id}"> ${data.category.name}</option>`);
  $("#category").attr("disabled", true);
}

/**
 * Funcion que trae todos los elementos de la tabla CATEGORY
 * y los pinta en el select de category
 */
async function inputCategory() {
  try {
    const categories = await $.ajax({
      url: "http://localhost:8080/api/Category/all",
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    $("#category").empty();
    $("#category").append('<option value=""> Seleccionar Categoria</option>');
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
 * Funcion para validar que los campos no esten vacios
 */
function validar() {
  const elements = document.querySelectorAll(".form input");
  return validarCamposVacios(elements);
}

/**
 * Funcion que trae los datos de una cloud por id
 * @param {number} id de cloud
 */
async function obtenerElemento(id) {
  try {
    const cloud = await $.ajax({
      url: DATAREQUEST.url + `/${id}`,
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    ID_CLOUD = id;
    setCampos(cloud);
  } catch (error) {
    console.error(`Hubo un problema trayendo los datos de cloud, Error: ${error.message}`);
  }
}

/**
 * Funcion que hace peticion GET al servicio REST
 */
async function traerDatos() {
  try {
    const categories = await $.ajax({
      url: DATAREQUEST.url + "/all",
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    pintarElemento(categories);
  } catch (error) {
    alert(`Hubo un problema trayendo los datos, Error: ${error.message}`);
  }
}

/**
 * Funcion que asigna a un objeto los valores del formulario
 * @param {String} typeMethod Metodo http que se va a realizar
 * @returns Objeto con los datos del formulario
 */
function organizarDatos(typeMethod) {
  const dataCloud = obtenerCampos();
  let data;
  if (typeMethod === "post") {
    data = {
      brand: dataCloud.brand,
      year: parseInt(dataCloud.year),
      category: { id: Number.parseInt(dataCloud.category) },
      name: dataCloud.name,
      description: dataCloud.description,
    };
  }
  if (typeMethod === "put") {
    data = {
      id: ID_CLOUD,
      brand: dataCloud.brand,
      name: dataCloud.name,
      year: parseInt(dataCloud.year),
      description: dataCloud.description,
      category: { id: Number.parseInt(dataCloud.category) },
    };
  }
  return data;
}

/**
 * Funcion para crear un nuevo campo a la tabla CLOUD
 */
$("#btnCrear").click(function crear() {
  if (!validar()) {
    alert("Se deben llenar los campos.");
  } else if (
    !validarMenor45Caracteres($("#name").val())) {
    alert("Campo name no debe tener mas de 45 caracteres");
  } 
  else if (
    !validarMenor45Caracteres($("#brand").val())) {
    alert("Campo brand no debe tener mas de 45 caracteres");
  } 
  else if (!validarAnio($("#year").val())){
    alert("Campo year debe ser un entero de 4 digitos");
  }
  else if (!validarMenor250Caracteres($("#description").val())){
    alert("Campo description no debe tener mas de 250 caracteres");
  } else {
    const data = organizarDatos("post");
    $.ajax({
      url: DATAREQUEST.url + "/save",
      type: "POST",
      dataType: DATAREQUEST.dataType,
      data: JSON.stringify(data),
      contentType: DATAREQUEST.contentType,
      statusCode: {
        201: function () {
          alert("Se agrego la nube exitosamente");
          limpiarCampos();
          traerDatos();
        },
      },
      error: function () {
        alert("Error en crear cloud");
      },
    });
  }
});

/**
 * Funcion para actualizar dato de CLOUD
 */
$("#btnActualizar").click(function actualizar() {
  if (!validar()) {
    alert("Se deben llenar los campos.");
  } else if (
    !validarMenor45Caracteres($("#name").val())) {
    alert("Campo name no debe tener mas de 45 caracteres");
  } 
  else if (
    !validarMenor45Caracteres($("#brand").val())) {
    alert("Campo brand no debe tener mas de 45 caracteres");
  } 
  else if (!validarAnio($("#year").val())){
    alert("Campo year debe ser un entero de 4 digitos");
  }
  else if (!validarMenor250Caracteres($("#description").val())){
    alert("Campo description no debe tener mas de 250 caracteres");
  } else {
    const data = organizarDatos("put");
    $.ajax({
      url: DATAREQUEST.url + "/update",
      type: "PUT",
      dataType: DATAREQUEST.dataType,
      data: JSON.stringify(data),
      contentType: DATAREQUEST.contentType,
      statusCode: {
        201: function () {
          alert("La operacion fue exitosa");
          limpiarCampos();
          traerDatos();
        },
      },
      error: function () {
        alert("Error en actualizar cloud");
      },
    });
  }
});

/**
 * Funcion para eliminar dato de CLOUD
 * @param {id} id del elemento a eliminar
 */
function eliminar(id) {
  const r = confirm("Segur@ de eliminar la Cloud"); // Se pregunta si está seguro de eliminar.
  if (r == true) {
    //Si está seguro, se procede a eliminar.
    $.ajax({
      url: DATAREQUEST.url + `/${id}`,
      type: "DELETE",
      dataType: DATAREQUEST.dataType,
      contentType: DATAREQUEST.contentType,
      statusCode: {
        204: function () {
          alert("Se elimino cloud exitosamente");
          traerDatos();
        },
      },
      error: function () {
        alert("Error en eliminar cloud");
      },
    });
  }
}

/**
 * Cuando el HTML carga manda a llamar a la funcion
 * consultar para trear los datos del servicio REST
 */
$(document).ready(function () {
  traerDatos();
  inputCategory();
});
