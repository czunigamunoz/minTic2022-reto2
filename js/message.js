const DATAREQUEST = {
  url: "http://localhost:8080/api/Message",
  dataType: "json",
  contentType: "application/json; charset=utf-8",
};
const URL_CLOUD = "http://localhost:8080/api/Cloud/all"
const URL_CLIENT = "http://localhost:8080/api/Client/all"
let ID_MESSAGE = null;

/**
 * Funcion que limpia los campos del formulario
 */
function limpiarCampos() {
  $("#messageText").val("");
  $("#cloud").attr("disable", false);
  $("#client").attr("disable", false);
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
 * @param {Object} data data traida de la base de datos
 */
function setCampos(data) {
  $("#messageText").val(data.messageText);
  $("#cloud").empty();
  $("#cloud").append(`<option value="${data.cloud.id}"> ${data.cloud.name}</option>`);
  $("#client").empty();
  $("#client").append(`<option value="${data.client.idClient}"> ${data.client.name}</option>`);
  $("#cloud").attr("disable", true);
  $("#client").attr("disable", true);
}

/**
 * Funcion que trae todos los elementos de la tabla CLOUD
 * y los pinta en el select de cloud
 */
async function inputCloud(){
  try {
    const clouds = await $.ajax({
      url: URL_CLOUD,
      type: "GET",
      dataType: DATAREQUEST.dataType
    });
    $("#cloud").empty();
    $("#cloud").append('<option value=""> Seleccionar Categoria</option>');
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
async function inputClient(){
  try {
    const clients = await $.ajax({
      url: URL_CLIENT,
      type: "GET",
      dataType: DATAREQUEST.dataType
    });
    $("#client").empty();
    $("#client").append('<option value=""> Seleccionar Categoria</option>');
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
function validar(){
  const elements = document.querySelectorAll(".form input");
  const selectElements = document.querySelectorAll(".form select")

  return validarCamposVacios(elements) && validarCamposVacios(selectElements)
}

/**
 * Funcion que trae los datos de un mensaje por id
 * @param {number} id de mensaje
 */
async function obtenerElemento(id) {
  try {
    const message = await $.ajax({
      url: DATAREQUEST.url + `/${id}`,
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    ID_MESSAGE = id;
    setCampos(message);
  } catch (error) {
    alert(`Hubo un problema trayendo los datos, Error: ${error.message}`);
  }
}

/**
 * Funcion que hace peticion GET al servicio REST
 */
async function traerDatos() {
  try {
    const messages = await $.ajax({
      url: DATAREQUEST.url + "/all",
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    pintarElemento(messages);
  } catch (error) {
    console.error(`Hubo un problema trayendo los datos, Error: ${error.message}`);
  }
}

/**
 * Funcion que asigna a un objeto los valores del formulario
 * @param {String} typeMethod Metodo http que se va a realizar 
 * @returns Objeto con los datos del formulario
 */
function organizarDatos(typeMethod){
  const dataMessage = obtenerCampos();
  console.log(dataMessage);
  let data
  if (typeMethod === "post"){
    data = {
      messageText: dataMessage.messageText,
      client: {"idClient": Number.parseInt(dataMessage.client)},
      cloud: {"id": Number.parseInt(dataMessage.cloud)},
    }
  }
  if (typeMethod === "put"){
    data = {
      idMessage: ID_MESSAGE,
      messageText: dataMessage.messageText,
      client: {"idClient": Number.parseInt(dataMessage.client)},
      cloud: {"id": Number.parseInt(dataMessage.cloud)},
    }

  }
  return data;
}

/**
 * Funcion para crear un nuevo campo a la tabla MESSAGE
 */
$("#btnCrear").click(function crear() {
  if (!validar()) {
    alert("Se deben llenar los campos.");
  } else if (
    !validarMenor250Caracteres($("#messageText").val())) {
    alert("Campo message no debe tener mas de 250 caracteres");
  }  else {
    const data = organizarDatos("post");
    console.log(data);
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
        alert("Error en crear message");
      },
    });
  }
});

/**
 * Funcion para actualizar dato de MESSAGE
 */
$("#btnActualizar").click(function actualizar() {
  if (!validar()) {
    alert("Se deben llenar los campos.");
  } else if (
    !validarMenor250Caracteres($("#messageText").val())) {
    alert("Campo message no debe tener mas de 250 caracteres");
  }  else {
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
        alert("Error en actualizar message");
      },
    });
  }
});

/**
 * Funcion para eliminar dato de MESSAGE
 * @param {id} id del elemento a eliminar
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
      error: function () {
        alert("Error en eliminar message");
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
