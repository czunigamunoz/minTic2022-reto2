let ELEMENTOSDB_CATEGORY = null;
let ELEMENTOSDB_CLOUD = null;
let ELEMENTOSDB_CLIENT = null;
let ELEMENTOSDB_MESSAGE = null;
let ELEMENTOSDB_RESERVATION = null;

function validarCamposVacios(campos) {
  for (let index = 0; index < campos.length; index++) {
    if (campos[index].value === "") {
      return false;
    }
  }
  return true;
}

function validarMenor45Caracteres(texto) {
  if (texto.length <= 45) {
    return true;
  }
  return false;
}

function validarMenor250Caracteres(texto) {
  if (texto.length >= 250) {
    return true;
  }
  return false;
}

function validarAnio(anio) {
  if (anio.length === 4) {
    return true;
  }
  return false;
}

function validarCampoNumerico(entrada) {
  return Number.isInteger(entrada);
}

function validarCampoEdad(entrada) {
  if (entrada > 0 && entrada < 120) {
    return true;
  }
  return false;
}

function crearElemento(response, tabla, properties) {
  if (tabla === "category") {
    ELEMENTOSDB_CATEGORY = response;
  }
  if (tabla === "cloud") {
    ELEMENTOSDB_CLOUD = response;
  }
  if (tabla === "client"){
    ELEMENTOSDB_CLIENT = response;
  }
  if (tabla === "messages"){
    ELEMENTOSDB_MESSAGE = response;
  }
  if (tabla === "reservation"){
    ELEMENTOSDB_RESERVATION = response;
  }

  const rows = [];

  for (let index = 0; index < Object.entries(response).length; index++) {

    const elementTemp = Object.entries(response)[index][1];

    const row = document.createElement("tr");
    for (let prop in elementTemp) {
      const col = document.createElement("td");
      console.log("Propiedad a comparar: " + prop);

      if (properties.hasOwnProperty(prop)) {
        if (typeof elementTemp[prop] === "string" || typeof elementTemp[prop] === "number") {
          properties[prop] = elementTemp[prop];

          col.appendChild(document.createTextNode(properties[prop]));
          row.appendChild(col);
        } else {

          let divContainer = document.createElement("div");
          divContainer.setAttribute("class", "select-container")

          if (typeof elementTemp[prop] === "object") {

            let selectForm = document.createElement("select");
            selectForm.setAttribute("class", "select-item");

            try {
              elementTemp[prop].forEach((subProp) => {
                console.log(subProp);

                let option = document.createElement("option");
                option.value = subProp.name ?? subProp.messageText ?? subProp.idReservation;
                option.text = subProp.name ?? subProp.messageText ?? subProp.idReservation;
                selectForm.appendChild(option);
              
              });

              divContainer.appendChild(selectForm);
              col.appendChild(divContainer);
              row.appendChild(col);

            } catch (e) {
              properties[prop] = elementTemp[prop].name;

              let option = document.createElement("option");
              option.value = elementTemp[prop].name;
              option.text = elementTemp[prop].name;
              selectForm.appendChild(option);
              divContainer.appendChild(selectForm);
              col.appendChild(divContainer);
              row.appendChild(col);
            }
          }
        }
      }
    }

    console.log(properties);

    const col = document.createElement("td");
    col.setAttribute("class", "text-center p-2");
    const btnEditar = document.createElement("button");
    btnEditar.setAttribute("class", "btn btn-outline-warning btn-block w-50");
    btnEditar.textContent = "Editar";
    btnEditar.setAttribute("onclick", "obtenerElemento(event)");
    const btnEliminar = document.createElement("button");
    btnEliminar.setAttribute(
      "class",
      "btn btn-outline-danger btn-block w-50 btn-eliminar"
    );
    btnEliminar.textContent = "Eliminar";
    btnEliminar.setAttribute("onclick", "obtenerElemento(event)");
    col.appendChild(btnEditar);
    col.appendChild(btnEliminar);
    row.appendChild(col);
    rows.push(row);
  }
  return rows;
}

// vaciarcampos
// pintar
