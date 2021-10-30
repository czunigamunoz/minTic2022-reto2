const DATAREQUEST = {
  url: "http://localhost:8080/api/Category",
  dataType: "json",
  contentType: "application/json; charset=utf-8",
};
let ID_CATEGORY = null;

/**
 * Funcion que limpia los campos del formulario
 */
function limpiarCampos() {
  $("#name").val("");
  $("#description").val("");
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
    row.append($("<td>").text(element.description));

    let divCloud = $("<div>").attr("class", "select-container");
    let selectCloud = $("<select>").attr("class", "select-item");
    element.clouds.forEach((cloud) => {
      console.log(cloud);
      selectCloud.append(
        `<option value="${cloud.id}"> ${cloud.name} </option>`
      );
    });
    divCloud.append(selectCloud);
    row.append($("<td>").append(divCloud));

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
    description: $("#description").val(),
  };
  return data;
}

/**
 * Funcion que asigna a los campos del formulario los datos entregados
 * @param {Object} data data traida de la base de datos
 */
function setCampos(data) {
  $("#name").val(data.name);
  $("#description").val(data.description);
}

/**
 * Funcion para validar que los campos no esten vacios
 */
function validar() {
  const elements = document.querySelectorAll(".form input");

  return validarCamposVacios(elements);
}

/**
 * Funcion que trae los datos de una categoria por id
 * @param {number} id de categoria
 */
async function obtenerElemento(id) {
  try {
    const response = await $.ajax({
      url: DATAREQUEST.url + `/${id}`,
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    ID_CATEGORY = id;
    setCampos(response);
  } catch (error) {
    alert(`Hubo un problema trayendo los datos, Error: ${error.message}`);
  }
}

/**
 * Funcion que hace peticion GET al servicio REST
 */
async function traerDatos() {
  try {
    const response = await $.ajax({
      url: DATAREQUEST.url + "/all",
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    pintarElemento(response);
    return response;
  } catch (error) {
    console.error(
      `Hubo un problema trayendo los datos, Error: ${error.message}`
    );
  }
}

/**
 * Funcion para crear un nuevo campo a la tabla CATEGORY
 */
$("#btnCrear").click(function crear() {
  if (!validar()) {
    alert("Se deben llenar los campos.");
  } else if (!validarMenor45Caracteres($("#name").val())) {
    alert("Campo name no debe tener mas de 45 caracteres");
  } else if (!validarMenor250Caracteres($("#description").val())) {
    alert("Campo description no debe tener mas de 250 caracteres");
  } else {
    const newData = obtenerCampos();
    const data = {
      name: newData.name,
      description: newData.description,
    };
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
        alert("Error en crear category");
      },
    });
  }
});

/**
 * Funcion para actualizar dato de CATEGORY
 */
$("#btnActualizar").click(function actualizar() {
  if (!validar()) {
    alert("Se deben llenar los campos.");
  } else if (!validarMenor45Caracteres($("#name").val())) {
    alert("Campo name no debe tener mas de 45 caracteres");
  } else if (!validarMenor250Caracteres($("#description").val())) {
    alert("Campo description no debe tener mas de 250 caracteres");
  } else {
    const dataCategory = obtenerCampos();
    const data = {
      id: ID_CATEGORY,
      name: dataCategory.name,
      description: dataCategory.description,
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
          limpiarCampos();
          traerDatos();
        },
      },
      error: function () {
        alert("Error en actualizar category");
      },
    });
  }
});

/**
 * Funcion para eliminar dato de CLOUD
 * @param {id} id del elemento a eliminar
 */
function eliminar(id) {
  const r = confirm("Segur@ de eliminar la categoria"); // Se pregunta si está seguro de eliminar.
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
        alert("Error en eliminar category");
      },
    });
  }
}

/**
 * Cuando el HTML carga manda a llamar a la funcion
 * traerDatos para trear los datos del servicio REST
 */
$(document).ready(function () {
  traerDatos();
});
