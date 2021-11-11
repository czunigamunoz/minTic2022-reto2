const DATAREQUEST = {
  url: "http://132.226.251.239:8080/api/Message",
  dataType: "json",
  contentType: "application/json; charset=utf-8",
};
const URL_CLOUD = "http://132.226.251.239:8080/api/Cloud/all";
const URL_CLIENT = "http://132.226.251.239:8080/api/Client/all";
let ID_MESSAGE = null;

/**
 * Funcion que limpia los campos del formulario
 */
function limpiarCampos() {
  $("#messageText").val("");
  $("#cloud").attr("disable", false);
  $("#client").attr("disable", false);
  $("#btnCrear").show("slow");
  $("#btnCancelar").hide("slow");
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
        `<button type="button" class="btn btn-warning btn-block w-100" onclick="obtenerElemento(${element.idMessage})">Editar</button>`
      )
    );
    row.append(
      $("<td class='text-center'>").append(
        `<button type="button" class="btn btn-danger btn-block w-100" onclick="eliminar(${element.idMessage})">Eliminar</button>`
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
  $("#btnCrear").hide("slow");
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
    ID_MESSAGE = message.idMessage;
    setCampos(message);
    $("#btnActualizar").show("slow");
    $("#btnCancelar").show("slow");
  } catch (error) {
    alert(`Hubo un problema trayendo los datos, Error: ${error.message}`);
  }
}

/**
 * Funcion que esconde los botones de actualizar y cancelar y vuelve a mostrar el de crear
 */
 $("#btnCancelar").click(function () {
  limpiarCampos();
  $("#btnActualizar").hide("slow");
});

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
    $("#btnActualizar").hide();
    $("#btnCancelar").hide();
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
  const dataMessage = obtenerCampos();
  let data;
  if (typeMethod === "post") {
    data = {
      messageText: dataMessage.messageText,
      client: { idClient: Number.parseInt(dataMessage.client) },
      cloud: { id: Number.parseInt(dataMessage.cloud) },
    };
  }
  if (typeMethod === "put") {
    data = {
      idMessage: ID_MESSAGE,
      messageText: dataMessage.messageText,
      client: { idClient: Number.parseInt(dataMessage.client) },
      cloud: { id: Number.parseInt(dataMessage.cloud) },
    };
  }
  return data;
}

/**
 * Funcion para crear un nuevo campo a la tabla MESSAGE
 */
$("#btnCrear").click(function crear() {
  try {
    if (!validarCamposVacios($(".form input"))) throw "Campos no deben estar vacios";
    if (!validarMenor250Caracteres($("#messageText").val())) throw "Campo message no debe tener mas de 250 caracteres";
    if ($("#cloud").val() === "0") throw "Debe seleccionar una cloud";
    if ($("#client").val() === "0") throw "Debe seleccionar una client";
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
        alert("Error en crear message");
      },
    });
  } catch (error) {
    alert(`Error en usuario: ${error}`);
  }
});

/**
 * Funcion para actualizar dato de MESSAGE
 */
$("#btnActualizar").click(function actualizar() {
  try {
    if (!validarCamposVacios($(".form input"))) throw "Campos no deben estar vacios";
    if (!validarMenor250Caracteres($("#messageText").val())) throw "Campo message no debe tener mas de 250 caracteres";
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
  } catch (error) {
    alert(`Error en usuario: ${error}`);
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
