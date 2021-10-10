const URL =
  "https://g7bd7930521103a-db202109300648.adb.sa-saopaulo-1.oraclecloudapps.com/ords/admin/cloud/cloud";
const DATATYPE = "json";

/**
 * Funcion que limpia los campos del formulario
 */
function limiparCampos() {
  $("#id").val("");
  $("#brand").val("");
  $("#model").val("");
  $("#category_id").val("");
  $("#name").val("");
}

/**
 * Funcion que guarda en un objeto los campos del formulario
 * @returns Objeto con los datos del formulario
 */
function obtenerCampos() {
  const data = {
    id: $("#id").val(),
    brand: $("#brand").val(),
    model: $("#model").val(),
    category_id: $("#category_id").val(),
    name: $("#name").val(),
  };
  return data;
}

/**
 * Funcion que hace peticion GET al servicio REST
 * los agrega en la tabla y agrega dos botones a
 * cada campo, un boton de actualizar y de eliminar
 */
function consultar() {
  $.ajax({
    url: URL,
    type: "GET",
    dataType: DATATYPE,
    success: function (respose) {
      $("#contenidoTabla").empty();
      respose.items.forEach((element) => {
        let row = $("<tr>");
        row.append($("<td>").text(element.id));
        row.append($("<td>").text(element.brand));
        row.append($("<td>").text(element.model));
        row.append($("<td>").text(element.category_id));
        row.append($("<td>").text(element.name));
        row.append(
          $("<td class='text-center no-padding'>").append(
            '<button type="button" class="btn btn-outline-warning btn-block w-100" onclick="actualizarCloud(' +
              element.id +
              ')">Editar</button>'
          )
        );
        row.append(
          $("<td class='text-center'>").append(
            '<button type="button" class="btn btn-outline-danger btn-block w-100" onclick="eliminar(' +
              element.id +
              ",'" +
              element.name +
              "')\">Eliminar</button>"
          )
        );
        $("#contenidoTabla").append(row);
      });
    },
    error: function (xhr, status) {
      alert("Ocurrió un error en el consumo.");
    },
  });
}

/**
 * Funcion para crear un nuevo campo a la tabla CLOUD
 * despues limpia los campos del formulario y llama a
 * la funcion consultar para llenar la tabla con los datos actualizados
 */
function crear() {
  const dataCloud = obtenerCampos();
  $.ajax({
    url: URL,
    type: "POST",
    dataType: DATATYPE,
    data: dataCloud,
    statusCode: {
      201: function () {
        limiparCampos();
        consultar();
      },
    },
  });
}

/**
 * Funcion para actualizar dato de CLOUD
 * despues limpia los campos del formulario y llama a
 * la funcion consultar para llenar la tabla con los datos actualizados
 */
function actualizar() {
  const dataCloud = obtenerCampos();
  const data = {
    id: dataCloud.id,
    brand: dataCloud.brand,
    model: dataCloud.model,
    category_id: dataCloud.category_id,
    name: dataCloud.name
  } // Se crea un objeto con los datos a actualizar.
  $.ajax({
    url: URL,
    type: "PUT",
    dataType: DATATYPE,
    data: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
    statusCode: {
      201: function () {
        limiparCampos();
        $("#id").attr("readonly", false);
        consultar();
      },
    },
  });
}

/**
 * Funcion para eliminar dato de CLOUD
 * si la respuesta es 204, llama a la funcion consultar
 * para traer los datos actualizados
 * @param {number} id Id de cloud
 * @param {string} name Name de cloud
 */
function eliminar(id, name) {
  const r = confirm(
    "Segur@ de eliminar la nube: " + id + " con nombre: " + name
  ); // Se pregunta si está seguro de eliminar.
  if (r == true) {
    //Si está seguro, se procede a eliminar.
    const data = {
      id: id,
    }; // Se crea un objeto con los datos a eliminar.
    $.ajax({
      url: URL,
      type: "DELETE",
      dataType: DATATYPE,
      data: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: {
        204: function () {
          consultar();
        },
      },
    });
  }
}

/**
 * Funcion para obtener los datos de un cloud mediante una
 * consulta get y el id, para luego rellenar con esa informacion
 * los campos del formulario
 * @param {number} id Id de cloud
 */
function actualizarCloud(id) {
  $.ajax({
    url: URL + "/?id=" + id,
    type: "GET",
    dataType: DATATYPE,
    success: function (respose) {
      if (respose.items.length > 0) {
        $("#id").val(respose.items[0].id);
        $("#id").attr("readonly", true);
        $("#brand").val(respose.items[0].brand);
        $("#model").val(respose.items[0].model);
        $("#category_id").val(respose.items[0].category_id);
        $("#name").val(respose.items[0].name);
      } else {
        alert("No se encontró el registro.");
      }
    },
    error: function (xhr, status) {
      alert("Ocurrió un error en el consumo.");
    },
  });
}

/**
 * Cuando el HTML carga manda a llamar a la funcion
 * consultar para trear los datos del servicio REST
 */
$(document).ready(function () {
  consultar();
});
