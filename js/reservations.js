const DATAREQUEST = {
  url: "http://localhost:8080/api/Reservation",
  dataType: "json",
  contentType: "application/json; charset=utf-8",
};
let ELEMENTSDB_CLOUDS = null;
let ELEMENTSDB_CLIENTS = null;

/**
 * Funcion que limpia los campos del formulario
 */
function limiparCampos() {
  $("#id").val("");
  $("#status").val("");
  $("#startDate").val("");
  $("fechaFinal").val("");
  $("#cloud").val("");
  $("#client").val("");
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
    row.append($("<td>").text(element.startDate.split('T')[0]));
    row.append($("<td>").text(element.devolutionDate.split('T')[0]));
    row.append($("<td>").text(element.status));
    row.append($("<td>").text(element.cloud.name));
    row.append($("<td>").text(element.client.name));
    
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
    idReservation: $("#id").val(),
    startDate: $("#startDate").val(),
    devolutionDate: $("#devolutionDate").val(),
    status: $("#status").val(),
    cloud: $("#cloud").val(),
    client: $("#client").val(),
  };
  return data;
}

function getCurrentDate(){
  const offset = new Date().getTimezoneOffset()
  const date = new Date(new Date().getTime() - (offset*60*1000))
  return date.toISOString().split('T')[0]
}

/**
 * Funcion que asigna a los campos del formulario los datos entregados
 */
function setCampos(data) {
  console.log(data)

  $("#startDate").attr("min", getCurrentDate());
  const startDate = data.startDate.split('T')[0]
  const devolutionDate = data.devolutionDate.split('T')[0]
  $("#id").val(data.idReservation);
  $("#startDate").attr("disabled", "");
  $("#startDate").val(startDate);
  $("#devolutionDate").val(devolutionDate);
  $("#status").attr("disabled", "");
  $("#cloud").val(data.cloud.name).attr("disabled", "disabled");
  $("#client").val(data.client.name).attr("disabled", "disabled");
}

async function inputCloud() {
  const clouds = await $.ajax({
    url: "http://localhost:8080/api/Cloud/all",
    type: "GET",
    dataType: DATAREQUEST.dataType,
  });
  ELEMENTSDB_CLOUDS = clouds;
  for (let i = 0; i < clouds.length; i++) {
    let option = document.createElement("option");
    option.setAttribute("class", "select-item");
    option.value = clouds[i].name;
    option.text = clouds[i].name;
    $("#cloud").append(option);
  }
}

async function inputClient() {
  const clients = await $.ajax({
    url: "http://localhost:8080/api/Client/all",
    type: "GET",
    dataType: DATAREQUEST.dataType,
  });
  ELEMENTSDB_CLIENTS = clients;
  for (let i = 0; i < clients.length; i++) {
    let option = document.createElement("option");
    option.setAttribute("class", "select-item");
    option.value = clients[i].name;
    option.text = clients[i].name;
    $("#client").append(option);
  }
}

/**
 * Funcion para validar que los campos no esten vacios
 */
function validar() {
  const elements = document.querySelectorAll(".form input");
  return validarCamposVacios(elements);
}

async function obtenerElemento(id) {
  let response;
  try {
    response = await $.ajax({
      url: DATAREQUEST.url + `/${id}`,
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
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
    $("#id").attr("readonly", true);
    $("#startDate").val(getCurrentDate());
    $("#startDate").attr("disabled", "disabled");
    // $("#status").attr("disabled", "disabled");
    inputCloud();
    inputClient();
    return response;
  } catch (error) {
    alert(`Hubo un problema trayendo los datos, Error: ${error.message}`);
  }
}

function elementoEnBD(datos, id) {
  for (let element of datos) {
    if (element.name === id) {
      return element;
    }
  }
  return null;
}

function organizarDatos(typeMethod) {
  const dataReservation = obtenerCampos();
  const cloud = elementoEnBD(ELEMENTSDB_CLOUDS, dataReservation.cloud);
  const client = elementoEnBD(ELEMENTSDB_CLIENTS, dataReservation.client);
  console.log(dataReservation)
  let data;
  if (typeMethod === "post") {
    data = {
      startDate: dataReservation.startDate,
      devolutionDate: dataReservation.devolutionDate,
      client: { idClient: client.idClient },
      cloud: { id: cloud.id },
    };
  }
  if (typeMethod === "put") {
    data = {
      idReservation: dataReservation.idReservation,
      startDate: dataReservation.startDate,
      devolutionDate: dataReservation.devolutionDate,
      client: { idClient: client.idClient },
      cloud: { id: cloud.id },
    };
  }
  return data;
}

/**
 * Funcion para crear un nuevo campo a la tabla CLOUD
 * despues limpia los campos del formulario y llama a
 * la funcion consultar para llenar la tabla con los datos actualizados
 */
$("#btnCrear").click(function crear() {
  if (!validar()) {
    alert("Se deben llenar los campos.");
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
    });
  }
});

/**
 * Funcion para actualizar dato de CLOUD
 * despues limpia los campos del formulario y llama a
 * la funcion consultar para llenar la tabla con los datos actualizados
 */
 $("#btnActualizar").click(function actualizar() {
  if (!validar()) {
    alert("Se deben llenar los campos.");
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
          $("#cloud").attr("disabled", "");
          $("#client").attr("disabled", "");
          limiparCampos();
          traerDatos();
        },
      },
    });
  }
});

/**
 * Funcion para eliminar dato de CLOUD
 * si la respuesta es 204, llama a la funcion consultar
 * para traer los datos actualizados
 * @param {name} name nombre del elemento a eliminar
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
