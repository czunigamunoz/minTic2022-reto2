const DATAREQUEST = {
    url: "http://localhost:8080/api/Reservation",
    dataType: "json",
    contentType: "application/json; charset=utf-8",
};

/**
 * Funcion que genera un reporte de reservaciones dadas dos fechas
 */
$("#btnByDate").click(function () {
    try {
        if (!validarFecha($("#startDate").val(), $("#endDate").val())) throw "La fecha de inicio debe ser anterior a la final";
        const dateOne = $("#startDate").val().split("T")[0];
        const dateTwo = $("#endDate").val().split("T")[0];
        $.ajax({
            url: DATAREQUEST.url + `/report-dates/${dateOne}/${dateTwo}`,
            type: "GET",
            dataType: DATAREQUEST.dataType,
            success: function (response) {
                $("#resultDate").append(
                    `<p class="text-dark">Numero de reservas en este periodo: ${response.length}</p>`
                )
            },
            error: function () {
                alert("Error al crear reporte")
            }
        })
    } catch (error) {
        alert(`Error en usuario: ${error}`);
    }
});

/**
 * Funcion que genera un reporte de reservaciones por el estado
 */
$("#btnByStatus").click(function () {
    $.ajax({
        url: DATAREQUEST.url + "/report-status",
        type: "GET",
        dataType: DATAREQUEST.dataType,
        success: function (response) {
            const {completed, cancelled} = response;
            $("#resultStatus").empty();
            $("#resultStatus").append(
                `<p class="text-dark">Reservas completadas: ${completed}</p>
                 <p class="text-dark">Reservas canceladas: ${cancelled}</p>                
                `
            )

        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error al generar el reporte: " +errorThrown)
        }
    });
});

/**
 * Funcion que genera un reporte de los clientes con mas reservaciones completadas
 */
$("#btnTopClients").click(function () {
    $.ajax({
        url: DATAREQUEST.url + "/report-clients",
        type: "GET",
        dataType: DATAREQUEST.dataType,
        success: function (response) {
            $("#resultClients").empty();
            const listaOrdenada = response.sort((clientOne, clientTwo) => clientTwo.total - clientOne.total);
            listaOrdenada.forEach((element) => {
                $("#resultClients").append(`<p class="text-dark">Client: ${element.client.name}</p>
                 <p class="text-dark">Total reservaciones completadas: ${element.total}</p>
                `)
            })
        },
        error: function (jqXHR, textStatus, errorTh){
            alert("Error al generar el reporte: " +errorThrown)
        }
    })
})