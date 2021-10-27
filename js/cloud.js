const DATAREQUEST = {
  url: "http://localhost:8080/api/Cloud",
  dataType: "json",
  contentType: "application/json; charset=utf-8",
};
let ID_CLOUD = null;

/**
 * Funcion que limpia los campos del formulario
 */
function limiparCampos() {
  $("#name").val("");
  $("#brand").val("");
  $("#year").val("");
  $("#description").val("");
  $("#category").val("");
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

    const colMessage = document.createElement("td");
    let divMessages = document.createElement("div");
    divMessages.setAttribute("class", "select-container");
    let selectMessage = document.createElement("select");
    selectMessage.setAttribute("class", "select-item");

    element.messages.forEach((message) => {
      let option = document.createElement("option");
      option.value = message.messageText;
      option.text = message.messageText;
      selectMessage.append(option);
    });
    divMessages.appendChild(selectMessage);
    colMessage.append(divMessages);
    row.append(colMessage);

    const colReservation = document.createElement("td");
    let divReservations = document.createElement("div");
    divReservations.setAttribute("class", "select-container");
    let selectReservation = document.createElement("select");
    selectReservation.setAttribute("class", "select-item");

    element.reservations.forEach((reservation) => {
      let option = document.createElement("option");
      option.value = reservation.idReservation;
      option.text = reservation.idReservation;
      selectReservation.append(option);
    });
    divReservations.appendChild(selectReservation);
    colReservation.append(divReservations);
    row.append(colReservation);

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
  const category = document.getElementById("category");
  category.selectedIndex = data.category.id;
  category.setAttribute("disabled", true);
}

/**
 * Funcion que trae todos los elementos de la tabla CATEGORY
 * y los pinta en el select de category
 */
async function inputCategory() {
  const categories = await $.ajax({
    url: "http://localhost:8080/api/Category/all",
    type: "GET",
    dataType: DATAREQUEST.dataType,
  });
  for (let i = 0; i < categories.length; i++) {
    let option = document.createElement("option");
    option.setAttribute("class", "select-item");
    option.value = categories[i].id;
    option.text = categories[i].name;
    $("#category").append(option);
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
  let response;
  try {
    response = await $.ajax({
      url: DATAREQUEST.url + `/${id}`,
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    ID_CLOUD = id;
    setCampos(response);
  } catch (error) {
    alert(`Hubo un problema trayendo los datos, Error: ${error.message}`);
  }
}

/**
 * Funcion que hace peticion GET al servicio REST
 */
async function traerDatos() {
  let response;
  try {
    response = await $.ajax({
      url: DATAREQUEST.url + "/all",
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    pintarElemento(response);
    return response;
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
          limiparCampos();
          traerDatos();
        },
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
          const category = document.getElementById("category");
          category.setAttribute("disabled", false);
          limiparCampos();
          traerDatos();
        },
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
