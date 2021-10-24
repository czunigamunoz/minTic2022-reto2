const DATAREQUEST = {
  url: "http://localhost:8080/api/Client",
  dataType: "json",
  contentType: "application/json; charset=utf-8",
};
let ID_CLIENT = null;

/**
 * Funcion que limpia los campos del formulario
 */
function limiparCampos() {
  $("#name").val("");
  $("#email").val("");
  $("#password").val("");
  $("#age").val("");
}

/**
 * Funcion que pinta el contenido de la tabla
 * @param {Response} response
 */
function pintarElemento(response) {
  $("#contenidoTabla").empty();
  response.forEach((element) => {
    let row = $("<tr>");
    row.append($("<td>").text(element.email));
    row.append($("<td>").text(element.password));
    row.append($("<td>").text(element.name));
    row.append($("<td>").text(element.age));

    const colMessage = document.createElement("td");
    let divMessages = document.createElement("div");
    divMessages.setAttribute("class", "select-container");
    let selectMessage = document.createElement("select");
    selectMessage.setAttribute("class", "select-item");

    element.messages.forEach((message) => {
      let option = document.createElement("option");
      option.value = message.messageText;
      option.text =  message.messageText;
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
      option.text =  reservation.idReservation;
      selectReservation.append(option);
    });
    divReservations.appendChild(selectReservation);
    colReservation.append(divReservations);
    row.append(colReservation);

    row.append(
      $("<td class='text-center no-padding'>").append(
        `<button type="button" class="btn btn-outline-warning btn-block w-100" onclick="obtenerElemento(${element.idClient})">Editar</button>`
      )
    );
    row.append(
      $("<td class='text-center'>").append(
        `<button type="button" class="btn btn-outline-danger btn-block w-100" onclick="eliminar(${element.idClient})">Eliminar</button>`
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
    email: $("#email").val(),
    password: $("#password").val(),
    age: $("#age").val(),
  };
  return data;
}

/**
 * Funcion que asigna a los campos del formulario los datos entregados
 * @param {Object} data
 */
function setCampos(data) {
  $("#name").val(data.name);
  $("#email").val(data.email).attr("readonly", "true");
  $("#password").val(data.password);
  $("#age").val(data.age);
}

/**
 * Funcion para validar que los campos no esten vacios
 */
function validar() {
  const elements = document.querySelectorAll(".form input");
  return validarCamposVacios(elements);
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
    ID_CLIENT = id;
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

/**
 * Funcion para crear un nuevo campo a la tabla CLOUD
 * despues limpia los campos del formulario y llama a
 * la funcion consultar para llenar la tabla con los datos actualizados
 */
$("#btnCrear").click(function crear() {
    console.log(validar())
  if (!validar()) {
    alert("Se deben llenar los campos.");
  } else {
    const dataCategory = JSON.stringify(obtenerCampos());
    $.ajax({
      url: DATAREQUEST.url + "/save",
      type: "POST",
      dataType: DATAREQUEST.dataType,
      data: dataCategory,
      contentType: DATAREQUEST.contentType,
      statusCode: {
        201: function () {
          alert("Se agrego el cliente exitosamente");
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
    return alert("Se deben llenar los campos.");
  } else {
    const dataCategory = obtenerCampos();
    const data = {
      idClient: ID_CLIENT,
      name: dataCategory.name,
      email: dataCategory.email,
      password: dataCategory.password,
      age: dataCategory.age,
    }; // Se crea un objeto con los datos a actualizar.
    $.ajax({
      url: DATAREQUEST.url + "/update",
      type: "PUT",
      dataType: DATAREQUEST.dataType,
      data: JSON.stringify(data),
      contentType: DATAREQUEST.contentType,
      statusCode: {
        201: function () {
          alert("La operacion fue exitosa");
          $("#email").val(data.email).attr("readonly", "false");
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
  const r = confirm("Segur@ de eliminar el cliente"); // Se pregunta si está seguro de eliminar.
  if (r == true) {
    //Si está seguro, se procede a eliminar.
    $.ajax({
      url: DATAREQUEST.url + `/${id}`,
      type: "DELETE",
      dataType: DATAREQUEST.dataType,
      contentType: DATAREQUEST.contentType,
      statusCode: {
        204: function () {
          alert("Se elimino el cliente exitosamente");
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
