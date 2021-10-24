const DATAREQUEST = {
  url: "http://localhost:8080/api/Message",
  dataType: "json",
  contentType: "application/json; charset=utf-8",
};
let ID_MESSAGE = null;
let ELEMENTSDB_CLOUDS = null;
let ELEMENTSDB_CLIENTS = null;

async function inputCloud(){
  const clouds = await $.ajax({
    url: "http://localhost:8080/api/Cloud/all",
    type: "GET",
    dataType: DATAREQUEST.dataType
  });
  ELEMENTSDB_CLOUDS = clouds;
  for (let i = 0; i < clouds.length; i++) {
    let option = document.createElement("option")
    option.setAttribute("class", "select-item")
    option.value = clouds[i].name
    option.text = clouds[i].name
    $("#cloud").append(option)
  }
}

async function inputClient(){
  const clients = await $.ajax({
    url: "http://localhost:8080/api/Client/all",
    type: "GET",
    dataType: DATAREQUEST.dataType
  });
  ELEMENTSDB_CLIENTS = clients;
  for (let i = 0; i < clients.length; i++) {
    let option = document.createElement("option")
    option.setAttribute("class", "select-item")
    option.value = clients[i].name
    option.text = clients[i].name
    $("#client").append(option)
  }
}

/**
 * Funcion que limpia los campos del formulario
 */
function limiparCampos() {
  $("#messageText").val("");
}

/**
 * Funcion que pinta el contenido de la tabla
 * @param {Response} response
 */
function pintarElemento(response) {
  $("#contenidoTabla").empty();
  response.forEach((element) => {
    let row = $("<tr>");
    row.append($("<td>").text(element.messageText));
    row.append($("<td>").text(element.cloud.name));
    row.append($("<td>").text(element.client.name));

    row.append(
      $("<td class='text-center no-padding'>").append(
        `<button type="button" class="btn btn-outline-warning btn-block w-100" onclick="obtenerElemento(${element.idMessage})">Editar</button>`
      )
    );
    row.append(
      $("<td class='text-center'>").append(
        `<button type="button" class="btn btn-outline-danger btn-block w-100" onclick="eliminar(${element.idMessage})">Eliminar</button>`
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
    messageText: $("#messageText").val(),
    cloud: $("#cloud").val(),
    client: $("#client").val(),
  };
  return data;
}

/**
 * Funcion que asigna a los campos del formulario los datos entregados
 * @param {Object} data
 */
function setCampos(data) {
  $("#messageText").val(data.messageText);
  $("#cloud").val(data.cloud.name).attr("disabled","disabled");
  $("#client").val(data.client.name).attr("disabled","disabled");
}

/**
 * Funcion que determina el elemento a ser editado o eliminado
 * @param {Event} event evento click en editar y eliminar
 */
async function obtenerElemento(id) {
  let response;
  try {
    response = await $.ajax({
      url: DATAREQUEST.url + `/${id}`,
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    ID_MESSAGE = id;
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
    ELEMENTOSDB = response;
    return response;
  } catch (error) {
    alert(`Hubo un problema trayendo los datos, Error: ${error.message}`);
  }
}

function messageEnBD(datos, data) {
  for (let element of datos) {
    if (element.messageText === data) {
      return element;
    }
  }
}

function elementoEnBD(datos, data) {
  for (let element of datos) {
    if (element.name === data) {
      return element;
    }
  }
}

function organizarDatos(typeMethod){
  const dataMessage = obtenerCampos();
  const cloud = elementoEnBD(ELEMENTSDB_CLOUDS, dataMessage.cloud)
  const client = elementoEnBD(ELEMENTSDB_CLIENTS, dataMessage.client)
  let data
  if (typeMethod === "post"){
    data = {
      messageText: dataMessage.messageText,
      client: {"idClient": client.idClient},
      cloud: {"id": cloud.id},
    }
  }
  if (typeMethod === "put"){
    data = {
      idMessage: ID_MESSAGE,
      messageText: dataMessage.messageText,
      client: {"idClient": client.idClient},
      cloud: {"id": cloud.id},
    }

  }
  return data;
}

/**
 * Funcion para crear un nuevo campo a la tabla CLOUD
 * despues limpia los campos del formulario y llama a
 * la funcion consultar para llenar la tabla con los datos actualizados
 */
$("#btnCrear").click(function crear() {
  if (!$("#messageText").val()) {
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
 * despues limpia los campos del formulario y llama a
 * la funcion consultar para llenar la tabla con los datos actualizados
 */
$("#btnActualizar").click(function actualizar() {
  if (!$("#messageText").val()) {
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
          $("#cloud").attr("disabled","");
          $("#client").attr("disabled","");
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
  const r = confirm("Segur@ de eliminar el mensaje");
  if (r == true) {
    $.ajax({
      url: DATAREQUEST.url + `/${id}`,
      type: "DELETE",
      dataType: DATAREQUEST.dataType,
      contentType: DATAREQUEST.contentType,
      statusCode: {
        204: function () {
          alert("Se elimino el mensaje exitosamente");
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
  inputCloud();
  inputClient();
});
