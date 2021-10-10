const URL = "https://g7bd7930521103a-db202109300648.adb.sa-saopaulo-1.oraclecloudapps.com/ords/admin/message/message";
const DATATYPE = "json";

/**
 * Funcion que limpia los campos del formulario
 */
function limiparCampos() {
    $("#id").val("");
    $("#messagetext").val("");
}

/**
 * Funcion que guarda en un objeto los campos del formulario
 * @returns Objeto con los datos del formulario
 */
function obtenerCampos() {
    const data = {
      id: $("#id").val(),
      messagetext: $("#messagetext").val(),
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
                row.append($("<td>").text(element.messagetext));
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
                        element.messagetext +
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
 * Funcion para crear un nuevo campo a la tabla MESSAGE
 * despues limpia los campos del formulario y llama a
 * la funcion consultar para llenar la tabla con los datos actualizados
 */
function crear(){
    const dataMessage = obtenerCampos();
    $.ajax({
        url:URL,
        type:"POST",
        dataType:DATATYPE,
        data: dataMessage,
        statusCode: {
            201: function(){
                limiparCampos();
                consultar();
            }
        }
    });
}

/**
 * Funcion para actualizar dato de MESSAGE
 * despues limpia los campos del formulario y llama a
 * la funcion consultar para llenar la tabla con los datos actualizados
 */
function actualizar(){
    const dataMessage = obtenerCampos();
    const data = {
        id:dataMessage.id,
        messagetext:dataMessage.messagetext,
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
 * Funcion para eliminar dato de MESSAGE
 * si la respuesta es 204, llama a la funcion consultar
 * para traer los datos actualizados
 * @param {number} id Id de message
 * @param {string} messagetext Message text de message
 */
function eliminar(id,messagetext){
    const r = confirm("Segur@ de eliminar el mensaje: "+id+" con message text: "+messagetext); // Se pregunta si está seguro de eliminar.
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
 * Funcion para obtener los datos de un messagemediante una
 * consulta get y el id, para luego rellenar con esa informacion
 * los campos del formulario
 * @param {number} id Id de message
 */
function actualizarCloud(id){
    $.ajax({
        url:URL+"/?id="+id,
        type:"GET",
        dataType:DATATYPE,
        success: function (respose){
            if(respose.items.length>0){
                $("#id").val(respose.items[0].id);
                $("#id").attr("readonly",true);
                $("#messagetext").val(respose.items[0].messagetext);
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
