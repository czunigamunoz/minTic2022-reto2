const DATAREQUEST = {
  'url': 'http://localhost:8080/api/Cloud',
  'dataType': 'json',
  "contentType": "application/json; charset=utf-8",
}
// let ELEMENTOSDB = null;
let ELEMENT = null;
const TABLA = "cloud"
const propCategoria = {
  "name": "",
  "brand": "",
  "year": "",
  "description": "",
  "category": "",
  "messages": "",
  "reservations": ""
}

/**
 *  1:41 Min 
 */

/**
 * Funcion que limpia los campos del formulario
 */
function limiparCampos() {
  $("#name").val("");
  $("#brand").val("");
  $("#year").val("");
  $("#description").val("");
  $("#category").val("");
}

/**
 * Funcion que pinta el contenido de la tabla
 * @param {Response} response 
 */
function pintarElemento(response) {
  $("#contenidoTabla").empty();
  const rows = crearElemento(response, TABLA, propCategoria);
  rows.forEach((row) => {
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
    brand: $("#brand").val(),
    year: $("#year").val(),
    description: $("#description").val(),
    category: $("#category").val(),
  };
  return data;
}

/**
 * Funcion que asigna a los campos del formulario los datos entregados
 * @param {Object} data 
 */
function setCampos(data) {
  console.log(data.category);
  $("#name").val(data.name);
  $("#brand").val(data.brand);
  $("#year").val(data.year);
  $("#description").val(data.description);
  $("#category").val(data.category.id);
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
async function obtenerElemento(event) {

  // return alert("En construccion");

  const btn = event.target;
  const nameElement = btn.parentElement.parentElement.firstChild.innerHTML;
  const elemento = elementoEnBD(ELEMENTOSDB_CLOUD, nameElement)
  if (!elemento) {
    alert("Error: " + nameElement + " no encontrado en DB")
  }
  ELEMENT = elemento;
  if (btn.textContent === "Editar"){
    setCampos(elemento);
  } else {
    eliminar(elemento.name)
  }
}

function elementoEnBD(datos, name){
  for (let element of datos){
    if (element.name === name){
      return element;
    }
  }
  return null;
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
  if (!validar()) {
    alert("Se deben llenar los campos.");
  } else {
    const dataCategory = obtenerCampos();
    const data = {
      brand: dataCategory.brand,
      year: parseInt(dataCategory.year),
      category: {"id": parseInt(dataCategory.category)},
      name: dataCategory.name,      
      description: dataCategory.description,      
    };
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
  console.log(validar())
  if (!validar()) {
    alert("Se deben llenar los campos.");
  } else {
    const dataCategory = obtenerCampos();
    const data = {
      id: ELEMENT.id,
      brand: dataCategory.brand,
      name: dataCategory.name,
      year: parseInt(dataCategory.year),
      description: dataCategory.description,
      category: {"id": parseInt(dataCategory.category)},
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
          limiparCampos();
          traerDatos();
        },
      },
    });
  }
})

/**
 * Funcion para eliminar dato de CLOUD
 * si la respuesta es 204, llama a la funcion consultar
 * para traer los datos actualizados
 * @param {name} name nombre del elemento a eliminar
 */
 function eliminar(name) {
  const r = confirm(
    "Segur@ de eliminar la categoria con nombre: " + name
  ); // Se pregunta si está seguro de eliminar.
  if (r == true) {
    //Si está seguro, se procede a eliminar.
    $.ajax({
      url: DATAREQUEST.url + `/${ELEMENT.id}`,
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
  traerDatos()
});
