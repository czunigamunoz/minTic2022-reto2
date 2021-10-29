const DATAREQUEST = {
  url: "http://localhost:8080/api/Reservation",
  dataType: "json",
  contentType: "application/json; charset=utf-8",
};
const URL_CLOUD = "http://localhost:8080/api/Cloud/all"
const URL_CLIENT = "http://localhost:8080/api/Client/all"
let ID_RESERVATION = null;

/**
 * Funcion que limpia los campos del formulario
 */
function limiparCampos() {
  $("#status").val("");
  $("#startDate").val("");
  $("fechaFinal").val("");
}

/**
 * Funcion que pinta el contenido de la tabla
 * @param {Response} response
 */
function pintarElemento(response) {
  $("#contenidoTabla").empty();
  response.forEach((element) => {
    let row = $("<tr>");
    row.append($("<td>").text(element.idReservation));
    row.append($("<td>").text(element.startDate.split("T")[0]));
    row.append($("<td>").text(element.devolutionDate.split("T")[0]));
    row.append($("<td>").text(element.status));
    row.append($("<td>").text(element.cloud.name));
    row.append($("<td>").text(element.client.name));

    row.append(
      $("<td class='text-center no-padding'>").append(
        `<button type="button" class="btn btn-outline-warning btn-block w-100" onclick="obtenerElemento(${element.idReservation})">Editar</button>`
      )
    );
    row.append(
      $("<td class='text-center'>").append(
        `<button type="button" class="btn btn-outline-danger btn-block w-100" onclick="eliminar(${element.idReservation})">Eliminar</button>`
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
    startDate: $("#startDate").val(),
    devolutionDate: $("#devolutionDate").val(),
    status: $("#status").val(),
    cloud: $("#cloud").val(),
    client: $("#client").val(),
  };
  return data;
}

/**
 * Funcion que obtiene la fecha actual del sistema
 * @returns Fecha en formato yyyy-mm-dd
 */
function getCurrentDate() {
  const offset = new Date().getTimezoneOffset();
  const date = new Date(new Date().getTime() - offset * 60 * 1000);
  return date.toISOString().split("T")[0];
}

/**
 * Funcion que asigna a los campos del formulario los datos entregados
 * @param {Object} data data traida de la base de datos
 */
function setCampos(data) {
  // console.log(data);

  $("#startDate").attr("min", getCurrentDate());
  const startDate = data.startDate.split("T")[0];
  const devolutionDate = data.devolutionDate.split("T")[0];
  $("#startDate").val(startDate);
  $("#devolutionDate").val(devolutionDate);

  $("#startDate").val(startDate).attr("disabled", false);
  $("#status").val(data.status).attr("disabled", false);

  const cloud = document.getElementById("cloud");
  cloud.selectedIndex = data.cloud.id;
  cloud.setAttribute("disabled", true);
  const client = document.getElementById("client");
  client.selectedIndex = data.client.idClient;
  client.setAttribute("disabled", true)
}

/**
 * Funcion que trae todos los elementos de la tabla CLOUD
 * y los pinta en el select de cloud
 */
async function inputCloud() {
  $("#cloud option").remove();
  const clouds = await $.ajax({
    url: URL_CLOUD,
    type: "GET",
    dataType: DATAREQUEST.dataType,
  });
  $("#cloud").append($("<option>"));
  for (let i = 0; i < clouds.length; i++) {
    let option = document.createElement("option");
    option.setAttribute("class", "select-item");
    option.value = clouds[i].id;
    option.text = clouds[i].name;
    $("#cloud").append(option);
  }
}

/**
 * Funcion que trae todos los elementos de la tabla CLIENT
 * y los pinta en el select de client
 */
async function inputClient() {
  $("#client option").remove();
  const clients = await $.ajax({
    url: URL_CLIENT,
    type: "GET",
    dataType: DATAREQUEST.dataType,
  });
  $("#client").append($("<option>"));
  for (let i = 0; i < clients.length; i++) {
    let option = document.createElement("option");
    option.setAttribute("class", "select-item");
    option.value = clients[i].idClient;
    option.text = clients[i].name;
    $("#client").append(option);
  }
}

/**
 * Funcion para validar que los campos no esten vacios
 */
function validar() {
  const elements = document.querySelectorAll(".form input");
  const selectElements = document.querySelectorAll(".form select")

  return validarCamposVacios(elements) && validarCamposVacios(selectElements)
}

/**
 * Funcion para validar la fecha
 * @param {Date} date1 Fecha de inicio
 * @param {Date} date2 Fecha final
 * @returns True si date2 es posterior a date1
 */
function validarFecha(date1, date2) {
  return new Date(date2) > new Date(date1);
}

/**
 * Funcion que trae los datos de un mensaje por id
 * @param {number} id de reservation
 */
async function obtenerElemento(id) {
  let response;
  try {
    response = await $.ajax({
      url: DATAREQUEST.url + `/${id}`,
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    ID_RESERVATION = id;
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
    $("#startDate").val(getCurrentDate());
    $("#startDate").attr("disabled", true);
    $("#status").val("Creado").attr("disabled", true);
    // $("#status").attr("disabled", true);
    inputCloud();
    inputClient();
    return response;
  } catch (error) {
    console.error(`Hubo un problema trayendo los datos, Error: ${error.message}`);
  }
}

/**
 * Funcion que asigna a un objeto los valores del formulario
 * @param {String} typeMethod Metodo http que se va a realizar 
 * @returns Objeto con los datos del formulario
 */
function organizarDatos(typeMethod) {
  const dataReservation = obtenerCampos();
  let data;
  if (typeMethod === "post") {
    data = {
      startDate: dataReservation.startDate,
      devolutionDate: dataReservation.devolutionDate,
      client: { idClient: Number.parseInt(dataReservation.client)},
      cloud: { id: Number.parseInt(dataReservation.cloud)},
    };
  }
  if (typeMethod === "put") {
    $("#status").attr("disabled", false);
    $("#startDate").attr("disabled", false);
    data = {
      idReservation: ID_RESERVATION,
      startDate: dataReservation.startDate,
      devolutionDate: dataReservation.devolutionDate,
      status: dataReservation.status,
      client: { idClient: Number.parseInt(dataReservation.client)},
      cloud: { id: Number.parseInt(dataReservation.cloud)},
    };
  }
  return data;
}

/**
 * Funcion para crear un nuevo campo a la tabla RESERVATION
 */
$("#btnCrear").click(function crear() {
  if (!validar()) {
    alert("Se deben llenar los campos.");
  } 
  if (!validarFecha($("#startDate").val(), $("#devolutionDate").val())) {
    alert("La fecha de inicio debe ser anterior a la fecha final")
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
          alert("Se agrego de manera exitosa");
          limiparCampos();
          traerDatos();
        },
      },
      error: function () {
        alert("Error en crear reservation");
      },
    });
  }
});

/**
 * Funcion para actualizar dato de RESERVATION
 */
$("#btnActualizar").click(function actualizar() {
  if (!validar()) {
    alert("Se deben llenar los campos.");
  } 
  if (!validarFecha($("#startDate").val(), $("#devolutionDate").val())) {
    alert("La fecha de inicio debe ser anterior a la fecha final")
  } else {
    const data = organizarDatos("put");
    console.log("===== Lo que se envia======");
    console.log(data);
    $.ajax({
      url: DATAREQUEST.url + "/update",
      type: "PUT",
      dataType: DATAREQUEST.dataType,
      data: JSON.stringify(data),
      contentType: DATAREQUEST.contentType,
      statusCode: {
        201: function () {
          alert("La operacion fue exitosa");
          const cloud = document.getElementById("cloud");
          cloud.setAttribute("disabled", false);
          const client = document.getElementById("client");
          client.setAttribute("disabled", false);
          limiparCampos();
          traerDatos();
        },
      },
      error: function () {
        alert("Error en actualizar reservation");
      },
    });
  }
});

/**
 * Funcion para eliminar dato de RESERVATION
 * @param {id} id del elemento a eliminar
 */
function eliminar(id) {
  const r = confirm("Segur@ de eliminar la reserva"); // Se pregunta si está seguro de eliminar.
  if (r == true) {
    //Si está seguro, se procede a eliminar.
    $.ajax({
      url: DATAREQUEST.url + `/${id}`,
      type: "DELETE",
      dataType: DATAREQUEST.dataType,
      contentType: DATAREQUEST.contentType,
      statusCode: {
        204: function () {
          traerDatos();
        },
      },
      error: function () {
        alert("Error en eliminar reservation");
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
});
