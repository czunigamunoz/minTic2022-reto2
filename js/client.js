const URL = "https://g7bd7930521103a-db202109300648.adb.sa-saopaulo-1.oraclecloudapps.com/ords/admin/client/client";
const DATATYPE = "json";

/**
 * Funcion que limpia los campos del formulario
 */
function limiparCampos() {
    $("#id").val("");
    $("#name").val("");
    $("#email").val("");
    $("#age").val("");
}

/**
 * Funcion que guarda en un objeto los campos del formulario
 * @returns Objeto con los datos del formulario
 */
function obtenerCampos() {
    const data = {
      id: $("#id").val(),
      name: $("#name").val(),
      email: $("#email").val(),
      age: $("#age").val(),
    };
    return data;
}

/**
 * Funcion que hace peticion GET al servicio REST
 * los agrega en la tabla y agrega dos botones a
 * cada campo, un boton de actualizar y de eliminar
 */
function consultar(){
    $.ajax({
        url:URL,
        type:"GET",
        dataType:DATATYPE,
        success: function (respose){
            $("#contenidoTabla").empty();
            respose.items.forEach(element => {
                let row = $("<tr>");
                row.append($("<td>").text(element.id));
                row.append($("<td>").text(element.name));
                row.append($("<td>").text(element.email));
                row.append($("<td>").text(element.age));
                row.append(
                    $("<td class='text-center no-padding'>")
                    .append(
                      '<button type="button" class="btn btn-outline-warning btn-block w-100" onclick="actualizarCloud('
                       + element.id +
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
        error: function(xhr,status){
            alert("Ocurrió un error en el consumo.");
        }
    });
}

/**
 * Funcion para crear un nuevo campo a la tabla CLIENT
 * despues limpia los campos del formulario y llama a
 * la funcion consultar para llenar la tabla con los datos actualizados
 */
function crear(){
    const dataClient = obtenerCampos();
    $.ajax({
        url:URL,
        type:"POST",
        dataType:DATATYPE,
        data: dataClient,
        statusCode: {
            201: function(){
                limiparCampos();
                consultar();
            }
        }
    });
}

/**
 * Funcion para actualizar dato de CLIENT
 * despues limpia los campos del formulario y llama a
 * la funcion consultar para llenar la tabla con los datos actualizados
 */
function actualizar(){
    const dataClient = obtenerCampos();
    const data = {
        id:dataClient.id,
        name:dataClient.name,
        email:dataClient.email,
        age:dataClient.age
    }; // Se crea un objeto con los datos a actualizar.
    $.ajax({
        url:URL,
        type:"PUT",
        dataType:DATATYPE,
        data:JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        },
        statusCode: {
            201: function(){
                limiparCampos();
                $("#id").attr("readonly",false);
                consultar();
            }
        }
    });
}

/**
 * Funcion para eliminar dato de CLIENT
 * si la respuesta es 204, llama a la funcion consultar
 * para traer los datos actualizados
 * @param {number} id Id de client
 * @param {string} name Name de client
 */
function eliminar(id,name){
    const r = confirm("Segur@ de eliminar el cliente: "+id+" con nombre: "+name); //Primero preguntamos si está seguro de eliminar.
    if (r == true) { //Si está seguro, se procede a eliminar.
        const data = {
            id:id
        }; // Se crea un objeto con los datos a eliminar.
        $.ajax({
            url:URL,
            type:"DELETE",
            dataType:DATATYPE,
            data:JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            },
            statusCode: {
                204: function(){ 
                    consultar();
                }
            }
        });
    }
}

/**
 * Funcion para obtener los datos de un client mediante una
 * consulta get y el id, para luego rellenar con esa informacion
 * los campos del formulario
 * @param {number} id Id de client
 */
function actualizarCloud(id){
    $.ajax({
        url:URL+"/?id="+id,
        type:"GET",
        dataType:"json",
        success: function (respose){
            if(respose.items.length>0){
                $("#id").val(respose.items[0].id);
                $("#id").attr("readonly",true);
                $("#name").val(respose.items[0].name);
                $("#email").val(respose.items[0].email);
                $("#age").val(respose.items[0].age);
            }else{
                alert("No se encontró el registro.");
            }
        },
        error: function(xhr,status){
            alert("Ocurrió un error en el consumo.");
        }
    });
}

/**
 * Cuando el HTML carga manda a llamar a la funcion
 * consultar para trear los datos del servicio REST
 */
$(document).ready(function(){
    consultar();
});