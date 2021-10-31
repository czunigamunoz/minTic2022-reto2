const DATAREQUEST = {
  url: "http://localhost:8080/api/Reservation",
  dataType: "json",
  contentType: "application/json; charset=utf-8",
};
const URL_CLOUD = "http://localhost:8080/api/Cloud/all";
const URL_CLIENT = "http://localhost:8080/api/Client/all";
let ID_RESERVATION = null;

/**
 * Funcion que limpia los campos del formulario
 */
function limpiarCampos() {
  $("#status").val("");
  $("#devolutionDate").val(getCurrentDate());
  $("#cloud").attr("disable", false);
  $("#client").attr("disable", false);
  $("#btnCrear").show();
  inputCloud();
  inputClient();
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
        `<button type="button" class="btn btn-warning btn-block w-100" onclick="obtenerElemento(${element.idReservation})">Editar</button>`
      )
    );
    row.append(
      $("<td class='text-center'>").append(
        `<button type="button" class="btn btn-danger btn-block w-100" onclick="eliminar(${element.idReservation})">Eliminar</button>`
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
  $("#status").attr("disabled", false);
  $("#status").val($("#status option").val());

  $("#cloud").empty();
  $("#cloud").append(`<option value="${data.cloud.id}"> ${data.cloud.name}</option>`);
  $("#cloud").attr("disable", true);

  $("#client").empty();
  $("#client").append(`<option value="${data.client.idClient}"> ${data.client.name}</option>`);
  $("#client").attr("disable", true);

  $("#btnCrear").hide("slow");
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
      dataType: DATAREQUEST.dataType
    });
    $("#cloud").empty();
    $("#cloud").append('<option value="0"> Seleccionar Cloud</option>');
    clouds.forEach(cloud => {
      const option = $("<option>")
      option.attr("value", cloud.id);
      option.text(cloud.name);
      $("#cloud").append(option);  
    });
  } catch (error) {
    console.error(`Hubo un problema trayendo los datos de cloud, Error: ${error.message}`);
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
      dataType: DATAREQUEST.dataType
    });
    $("#client").empty();
    $("#client").append('<option value="0"> Seleccionar Client</option>');
    clients.forEach(client => {
      const option = $("<option>")
      option.attr("value", client.idClient);
      option.text(client.name);
      $("#client").append(option);
    });
  } catch (error) {
    console.error(`Hubo un problema trayendo los datos de client, Error: ${error.message}`);
  }
}

/**
 * Funcion para validar que los campos no esten vacios
 */
function validar() {
  const elements = document.querySelectorAll(".form input");
  const selectElements = document.querySelectorAll(".form select");

  return validarCamposVacios(elements) && validarCamposVacios(selectElements);
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
    $("#devolutionDate").attr("min", getCurrentDate());
    inputCloud();
    inputClient();
    return response;
  } catch (error) {
    console.error(
      `Hubo un problema trayendo los datos, Error: ${error.message}`
    );
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
      client: { idClient: Number.parseInt(dataReservation.client) },
      cloud: { id: Number.parseInt(dataReservation.cloud) },
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
      client: { idClient: Number.parseInt(dataReservation.client) },
      cloud: { id: Number.parseInt(dataReservation.cloud) },
    };
  }
  return data;
}

/**
 * Funcion para crear un nuevo campo a la tabla RESERVATION
 */
$("#btnCrear").click(function crear() {
  try {
    if (!validar()) throw "Campos no deben estar vacios";
    if (!validarFecha($("#startDate").val(), $("#devolutionDate").val())) throw "La fecha de inicio debe ser anterior a la fecha final";
    if ($("#cloud").val() === "0") throw "Debe seleccionar una cloud";
    if ($("#client").val() === "0") throw "Debe seleccionar un client";
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
          limpiarCampos();
          traerDatos();
        },
      },
      error: function () {
        alert("Error en crear reservation");
      },
    });    
  } catch (error) {
    alert(`Error en usuario: ${error}`);
  }
});

/**
 * Funcion para actualizar dato de RESERVATION
 */
$("#btnActualizar").click(function actualizar() {
  try {
    if (!validar()) throw "Campos no deben estar vacios";
    if (!validarFecha($("#startDate").val(), $("#devolutionDate").val())) throw "La fecha de inicio debe ser anterior a la fecha final";
    if ($("#status").val() === "Seleccionar Status") throw "Debe seleccionar un status";
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
        alert("Error en actualizar reservation");
      },
    });
  } catch (error) {
    alert(`Error en usuario: ${error}`);
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
