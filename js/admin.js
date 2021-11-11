const DATAREQUEST = {
  url: "http://132.226.251.239:8080/api/Admin",
  dataType: "json",
  contentType: "application/json; charset=utf-8",
};
let ID_ADMIN = null;

/**
 * Funcion que limpia los campos del formulario
 */
function limpiarCampos() {
  $("#name").val("");
  $("#email").val("");
  $("#password").val("");
  $("#btnCrear").show("slow");
  $("#btnCancelar").hide("slow");
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
    row.append($("<td>").text(element.name));

    row.append(
      $("<td class='text-center no-padding'>").append(
        `<button type="button" class="btn btn-warning btn-block w-100" onclick="obtenerElemento(${element.idAdmin})">Editar</button>`
      )
    );
    row.append(
      $("<td class='text-center'>").append(
        `<button type="button" class="btn btn-danger btn-block w-100" onclick="eliminar(${element.idAdmin})">Eliminar</button>`
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
  };
  return data;
}

/**
 * Funcion que asigna a los campos del formulario los datos entregados
 * @param {Object} data data traida de la base de datos
 */
function setCampos(data) {
  $("#name").val(data.name);
  $("#email").val(data.email).attr("readonly", "true");
  $("#password").val(data.password);
  $("#btnCrear").hide("slow");
}

/**
 * Funcion que trae los datos de un cliente por id
 * @param {number} id de admin
 */
async function obtenerElemento(id) {
  try {
    const admin = await $.ajax({
      url: DATAREQUEST.url + `/${id}`,
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    ID_ADMIN = admin.idAdmin;
    setCampos(admin);
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
    const admins = await $.ajax({
      url: DATAREQUEST.url + "/all",
      type: "GET",
      dataType: DATAREQUEST.dataType,
    });
    pintarElemento(admins);
    $("#btnActualizar").hide();
    $("#btnCancelar").hide();
  } catch (error) {
    console.error(
      `Hubo un problema trayendo los datos, Error: ${error.message}`
    );
  }
}

/**
 * Funcion para crear un nuevo campo a la tabla ADMIN
 */
$("#btnCrear").click(function crear() {
  try {
    if (!validarCamposVacios($(".form input")))
      throw "Campos no deben estar vacios";
    if (!validarMenor45Caracteres($("#email").val()))
      throw "Campo email no debe tener mas de 45 caracteres";
    if (!validarMenor45Caracteres($("#password").val()))
      throw "Campo password no debe tener mas de 45 caracteres";
    if (!validarMenor250Caracteres($("#name").val()))
      throw "Campo name no debe tener mas de 250 caracteres";
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
          limpiarCampos();
          traerDatos();
        },
      },
      error: function () {
        alert("Error en crear client");
      },
    });
  } catch (error) {
    alert(`Error en usuario: ${error}`);
  }
});

/**
 * Funcion para actualizar dato de CLIENT
 */
$("#btnActualizar").click(function actualizar() {
  try {
    if (!validarCamposVacios($(".form input")))
      throw "Campos no deben estar vacios";
    if (!validarMenor45Caracteres($("#email").val()))
      throw "Campo email no debe tener mas de 45 caracteres";
    if (!validarMenor45Caracteres($("#password").val()))
      throw "Campo password no debe tener mas de 45 caracteres";
    if (!validarMenor250Caracteres($("#name").val()))
      throw "Campo name no debe tener mas de 250 caracteres";
    const admin = obtenerCampos();
    const data = {
      idAdmin: ID_ADMIN,
      name: admin.name,
      email: admin.email,
      password: admin.password,
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
          $("#email").val(admin.email).attr("readonly", false);
          limpiarCampos();
          traerDatos();
        },
      },
      error: function () {
        alert("Error en actualizar client");
      },
    });
  } catch (error) {
    alert(`Error en usuario: ${error}`);
  }
});

/**
 * Funcion para eliminar dato de CLIENT
 * @param {id} id del elemento a eliminar
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
      error: function () {
        alert("Error en eliminar client");
      },
    });
  }
}

$("#btnClientes").click(async () => {
  const clients = await $.ajax({
    url: "http://localhost:8080/api/Client/all",
    type: "GET",
    dataType: DATAREQUEST.dataType,
  });
  $("#listaClientes").empty();
  clients.forEach((client) => {
    $("#listaClientes").append(
        `<div  class="card text-white bg-light w-100" style="height: 8rem;">
            <div class="card-body mb-3">
                <h5 class="card-title">${client.name}</h5>
                <p class="card-text m-0">Email: ${client.email}</p>
                <p class="card-text m-0">Age: ${client.age}</p>
            </div>
        </div>`
        );
  });
});

/**
 * Cuando el HTML carga manda a llamar a la funcion
 * consultar para trear los datos del servicio REST
 */
$(document).ready(function () {
  traerDatos();
});
