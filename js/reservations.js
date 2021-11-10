const DATAREQUEST = {
  url: "http://localhost:8080/api/Reservation",
  dataType: "json",
  contentType: "application/json; charset=utf-8",
};
const URL_CLOUD = "http://localhost:8080/api/Cloud/all";
const URL_CLIENT = "http://localhost:8080/api/Client/all";
const URL_SCORE = "http://localhost:8080/api/Score";
let ID_RESERVATION = null;

/**
 * Funcion que limpia los campos del formulario
 */
function limpiarCampos() {
  $("#status").val("");
  $("#devolutionDate").val(getCurrentDate());
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
    row.append($("<td>").text(element.idReservation));
    row.append($("<td>").text(element.startDate.split("T")[0]));
    row.append($("<td>").text(element.devolutionDate.split("T")[0]));
    row.append($("<td>").text(element.status));
    row.append($("<td>").text(element.cloud.name));

    row.append($("<td>").append(
      ` <div>
          <p>Id Cliente: ${element.client.idClient}</p>
          <p>Nombre: ${element.client.name}</p>
          <p>Email: ${element.client.email}</p>
        </div>
      `
    ));

    if (!!element.score){
      row.append($("<td>").append(
        `
          <div>
            <p> Calificacion: ${element.score.stars}
            <button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#scoreModalEdit${element.idReservation}">
            Editar
          </button>

          <!-- Modal -->
        <div class="modal fade modal-dialog-scrollable" id="scoreModalEdit${element.idReservation}" tabindex="-1" aria-labelledby="score Modal" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Score</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">

                      <div>
                        <div class="mb-3">
                          <label for="start" class="col-form-label fw-bolder">Stars: <small class="fw-light">Range 0 - 5</small></label>
                          <input type="number" class="form-control" id="scoreStarsEdit${element.idReservation}" value="${element.score.stars}">
                        </div>
                        <div class="mb-3">
                          <label for="scoreMessage" class="col-form-label fw-bolder">Message</label>
                          <textarea class="form-control" id="scoreMessageEdit${element.idReservation}">${element.score.messageText}</textarea>
                        </div>
                      </div>

                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                      <button type="button" class="btn btn-success" data-bs-dismiss="modal" onclick="actualizarScore(${element.score.idScore},${element.idReservation})">Actualizar Score</button>
                    </div>
                </div>
            </div>
        </div>
          </div>
        `))

    } else {
      row.append(
        $("<td class='no-padding'>").append(
          `<button type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#scoreModal${element.idReservation}">
            Calificar
          </button>

          <!-- Modal -->
        <div class="modal fade modal-dialog-scrollable" id="scoreModal${element.idReservation}" tabindex="-1" aria-labelledby="score Modal" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Score</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">

                      <div>
                        <div class="mb-3">
                          <label for="start" class="col-form-label fw-bolder">Stars: <small class="fw-light">Range 0 - 5</small></label>
                          <input type="number" class="form-control" id="scoreStars${element.idReservation}">
                        </div>
                        <div class="mb-3">
                          <label for="scoreMessage" class="col-form-label fw-bolder">Message</label>
                          <textarea class="form-control" id="scoreMessage${element.idReservation}"></textarea>
                        </div>
                      </div>

                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                      <button type="button" class="btn btn-success" data-bs-dismiss="modal" onclick="crearScore(${element.idReservation})">Guardar Score</button>
                    </div>
                </div>
            </div>
        </div>
          `
        )
      );
    }

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
 * Funcion que trae los datos de un mensaje por id
 * @param {number} id de reservation
 */
async function obtenerElemento(id) {
  try {
    const reservation = await $.ajax({
      url: DATAREQUEST.url + `/${id}`,
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    ID_RESERVATION = reservation.idReservation;
    setCampos(reservation);
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
    const reservations = await $.ajax({
      url: DATAREQUEST.url + "/all",
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    pintarElemento(reservations);
    $("#startDate").val(getCurrentDate());
    $("#startDate").attr("disabled", true);
    $("#status").val("Creado").attr("disabled", true);
    $("#devolutionDate").attr("min", getCurrentDate());
    $("#btnActualizar").hide();
    $("#btnCancelar").hide();
    inputCloud();
    inputClient();
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
    if (!validarCamposVacios($(".form input"))) throw "Campos no deben estar vacios";
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
    if (!validarCamposVacios($(".form input"))) throw "Campos no deben estar vacios";
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
 * Funcion para crear una calificacion a una reservacion
 * @param {Numer} id de la reservacion
 */
function crearScore(id) {
  const data = {
    messageText: $(`#scoreMessage${id}`).val(),
    stars: Number.parseInt($(`#scoreStars${id}`).val()),
    reservation: { idReservation: id }
  }
  try {
    if (!validarCalificacion($(`#scoreStars${id}`).val())) throw "Calificacion debe estar entre 0 y 5";
    if (!validarMenor250Caracteres($(`#scoreMessage${id}`).val())) throw "Mensaje no debe contener mas de 250 caracteres";
    $.ajax({
      url: URL_SCORE + "/save",
      type: "POST",
      dataType: DATAREQUEST.dataType,
      data: JSON.stringify(data),
      contentType: DATAREQUEST.contentType,
      statusCode: {
        201: function () {
          alert("Se agrego de manera exitosa");
          traerDatos();
        },
      },
      error: function () {
        alert("Error en crear score");
      }
    });  
  } catch (error) {
    alert(`Error en usuario: ${error}`);
  }
}

/**
 * Funcion para actualizar la calificacion de una reservacion
 * @param {Number} idScore id de la calificacion
 * @param {Number} idReservation id de la reservacion
 */
function actualizarScore(idScore, idReservation){
  const data = {
    idScore: idScore,
    messageText: $(`#scoreMessageEdit${idReservation}`).val(),
    stars: Number.parseInt($(`#scoreStarsEdit${idReservation}`).val()),
    reservation: { idReservation: idReservation }    
  }
  console.log(data)
  try {
    if (!validarCalificacion($(`#scoreStarsEdit${idReservation}`).val())) throw "Calificacion debe estar entre 0 y 5";
    if (!validarMenor250Caracteres($(`#scoreMessageEdit${idReservation}`).val())) throw "Mensaje no debe contener mas de 250 caracteres";
    $.ajax({
      url: URL_SCORE + "/update",
      type: "PUT",
      dataType: DATAREQUEST.dataType,
      data: JSON.stringify(data),
      contentType: DATAREQUEST.contentType,
      statusCode: {
        201: function () {
          alert("Se actualizo de manera exitosa");
          traerDatos();
        },
      },
      error: function () {
        alert("Error en actualizar score");
      }
    });  
  } catch (error) {
    alert(`Error en usuario: ${error}`);
  }
}

/**
 * Cuando el HTML carga manda a llamar a la funcion
 * consultar para trear los datos del servicio REST
 */
$(document).ready(function () {
  traerDatos();
});
