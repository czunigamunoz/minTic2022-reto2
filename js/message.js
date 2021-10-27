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
function limiparCampos() {
  $("#messageText").val("");
  $("#cloud").val("");
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
async function inputCloud(){
  const clouds = await $.ajax({
    url: URL_CLOUD,
    type: "GET",
    dataType: DATAREQUEST.dataType
  });
  for (let i = 0; i < clouds.length; i++) {
    let option = document.createElement("option")
    option.setAttribute("class", "select-item")
    option.value = clouds[i].id
    option.text = clouds[i].name
    $("#cloud").append(option)
  }
}

/**
 * Funcion que trae todos los elementos de la tabla CLIENT
 * y los pinta en el select de client
 */
async function inputClient(){
  const clients = await $.ajax({
    url: URL_CLIENT,
    type: "GET",
    dataType: DATAREQUEST.dataType
  });
  for (let i = 0; i < clients.length; i++) {
    let option = document.createElement("option")
    option.setAttribute("class", "select-item")
    option.value = clients[i].idClient
    option.text = clients[i].name
    $("#client").append(option)
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
function organizarDatos(typeMethod){
  const dataMessage = obtenerCampos();
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
          limiparCampos();
          traerDatos();
        },
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
          const cloud = document.getElementById("cloud");
          cloud.setAttribute("disabled", false);
          const client = document.getElementById("client");
          client.setAttribute("disabled", false);
          limiparCampos();
          traerDatos();
        },
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
