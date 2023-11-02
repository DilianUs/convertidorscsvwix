//modelos
class SyscomToken {
    constructor(token_type, expires_in, access_token) {
        this.token_type = token_type;
        this.expires_in = expires_in;
        this.access_token = access_token;
    }
}
class Marca {
    constructor(id, nombre) {
        this.id = id;
        this.nombre = nombre;
    }
}

class ProductosMarca {
    constructor(marca,cantidad,paginas,productosIds){
        this.marca = marca;
        this.cantidad = cantidad;
        this.paginas = paginas;
        this.productosIds = productosIds;
    }
}
//variables globales
let tokensyscom ;
var syscombrands;
let syscombrandsproducts;
//configuracion de string
String.prototype.lastIndexOfAny = function (searchArray) {
    let lastIndex = -1;
    for (let i = 0; i < searchArray.length; i++) {
        const index = this.lastIndexOf(searchArray[i]);
        if (index > lastIndex) {
            lastIndex = index;
        }
    }
    return lastIndex;
};

function ajustarTitulo(titulo) {
    // Establece la longitud máxima en 80 caracteres
    const maxLength = 80;

    if (titulo.length <= maxLength) {
        // Si el título es menor o igual a 80 caracteres, no es necesario ajustarlo.
        return titulo;
    }

    // Encuentra la última posición de `,`, `.` o ` ` antes de 80 caracteres
    const lastPosition = titulo.substring(0, maxLength).lastIndexOfAny([',', '.', ' ']);

    // Corta el título en la última posición
    return titulo.substring(0, lastPosition);
}

//transformar a wix format

function transformarDatos(datosPequenos) {
    return datosPequenos.map(item => ({
        HandleId: item.producto_id, // Mapear producto_id a HandleId
        FieldType: 'Product', // Valor por defecto o puede asignar uno específico
        Name: item.titulo, // Mapear titulo a Name
        Description: 'pruebasindescripcion', // Valor por defecto o puede asignar uno específico
        ProductImageUrl: item.imagen, // Mapear imagen a ProductImageUrl
        Collection: '', // Valor por defecto o puede asignar uno específico
        SKU: item.modelo, // Mapear modelo a SKU
        Ribbon: '', // Valor por defecto o puede asignar uno específico
        Price: 500, // Valor por defecto
        Surcharge: 0, // Valor por defecto
        Visible: true, // Valor por defecto
        DiscountMode: 'PERCENT', // Valor por defecto o puede asignar uno específico
        DiscountValue: 0, // Valor por defecto
        Inventory: item.stock, // Mapear stock a Inventory
        Weight: 0, // Valor por defecto
        Cost: 250, // Valor por defecto
        ProductOptionName1: '', // Valor por defecto o puede asignar uno específico
        ProductOptionType1: '', // Valor por defecto o puede asignar uno específico
        ProductOptionDescription1: '',
        ProductOptionName2: '', // Valor por defecto vacío
        ProductOptionType2: '', // Valor por defecto vacío
        ProductOptionDescription2: '', // Valor por defecto vacío
        ProductOptionName3: '', // Valor por defecto vacío
        ProductOptionType3: '', // Valor por defecto vacío
        ProductOptionDescription3: '', // Valor por defecto vacío
        ProductOptionName4: '', // Valor por defecto vacío
        ProductOptionType4: '', // Valor por defecto vacío
        ProductOptionDescription4: '', // Valor por defecto vacío
        ProductOptionName5: '', // Valor por defecto vacío
        ProductOptionType5: '', // Valor por defecto vacío
        ProductOptionDescription5: '', // Valor por defecto vacío
        ProductOptionName6: '', // Valor por defecto vacío
        ProductOptionType6: '', // Valor por defecto vacío
        ProductOptionDescription6: '', // Valor por defecto vacío
        AdditionalInfoTitle1: '', // Valor por defecto vacío
        AdditionalInfoDescription1: '', // Valor por defecto vacío
        AdditionalInfoTitle2: '', // Valor por defecto vacío
        AdditionalInfoDescription2: '', // Valor por defecto vacío
        AdditionalInfoTitle3: '', // Valor por defecto vacío
        AdditionalInfoDescription3: '', // Valor por defecto vacío
        AdditionalInfoTitle4: '', // Valor por defecto vacío
        AdditionalInfoDescription4: '', // Valor por defecto vacío
        AdditionalInfoTitle5: '', // Valor por defecto vacío
        AdditionalInfoDescription5: '', // Valor por defecto vacío
        AdditionalInfoTitle6: '', // Valor por defecto vacío
        AdditionalInfoDescription6: '',// Valor por defecto o puede asignar uno específico
        CustomTextField1: 'nada', // Valor por defecto o puede asignar uno específico
        CustomTextCharLimit1: 110, // Valor por defecto
        CustomTextMandatory1: false, // Valor por defecto
        CustomTextField2: 'nada', // Valor por defecto o puede asignar uno específico
        CustomTextCharLimit2: 110, // Valor por defecto
        CustomTextMandatory2: false, // Valor por defecto
        Brand: item.marca, // Mapear marca a Brand
    }));
}
//generar csv
function cargardatos() {

    var objetos = [];
    var filas = document.querySelectorAll(".fila_producto");
    filas.forEach(function (fila) {

        const cadenaOriginal = ajustarTitulo(fila.querySelector('.titulo').textContent);
        const cadenaCodificada = btoa(cadenaOriginal);
        var producto = {
            producto_id: cadenaCodificada,
            modelo: fila.querySelector('.modelo').textContent,
            stock: fila.querySelector('.stock').textContent,
            titulo: ajustarTitulo(fila.querySelector('.titulo').textContent),
            marca: fila.querySelector('.marca').textContent,
            imagen: fila.querySelector('.imgportada').textContent,

        };

        objetos.push(producto);
    });

    var datosGrandes = transformarDatos(objetos);

    var csv = Papa.unparse(datosGrandes);

    // Crear un objeto Blob con el CSV y establecer los encabezados
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = window.URL.createObjectURL(blob);

    // Crear un enlace para descargar el archivo
    var a = document.createElement('a');
    a.href = url;
    a.download = 'productos.csv';
    a.click();

    // Liberar recursos
    window.URL.revokeObjectURL(url);

}





//recoleccion de datos por api

async function getSyscomBrandsProducts(){
    const fetchButton = document.getElementById("fetchButton2");
    const loadingSpinner = document.getElementById("loadingSpinner2");
    const successMessage = document.getElementById("successMessage2");
    successMessage.style.display = "none";
    fetchButton.style.display = "none";
    loadingSpinner.style.display = "block";
    console.log("Inicio de descargas de productos")
    if (tokensyscom === undefined) {
        console.log("Generando token");
        await getSyscomToken();
    }
    if (tokensyscom) {
    
        const accessToken = tokensyscom.access_token;
      
        if(syscombrands){
            const fetchPromises = [];
            console.log("haciendo promesas");
            syscombrands.forEach(marca => {
                // Aquí puedes realizar acciones con cada marca
              
                fetchPromises.push(getProductsByBrand(marca.id));
            });

            
            console.log("listas promesas por marca, ejecutando ...");
            Promise.all(fetchPromises)
            .then(jsonResponses => {
              // En este punto, jsonResponses contiene todas las respuestas
              syscombrandsproducts = jsonResponses;
    
              // Ocultar el spinner de carga y mostrar los mensajes de éxito
              loadingSpinner.style.display = "none";
              successMessage.style.display = "block";
              fetchButton.style.display = "flex";
              fetchButton.disabled = false;
    
              console.log("Resultados cantidad: ", syscombrandsproducts.length);
              console.log("Resultados objetos: ", syscombrandsproducts);

             
            })
            .catch(error => {
              console.log('Error al obtener respuestas:', error);
              // Manejar el error si es necesario
            });
        
           
        }
    
 
    }
}

async function getProductsByBrand(marca){
    const accessToken = tokensyscom.access_token;
    var myHeaders = new Headers();
     
    myHeaders.append("Authorization", "Bearer " + accessToken);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };


    try {
        const apiUrl = `https://developers.syscom.mx/api/v1/marcas/${marca}/productos?stock=1&pagina=1`;
       
        const response = await fetch(apiUrl, requestOptions);
        const result = await response.json();

        const productoIds = result.productos.map(producto => producto.producto_id);



        const productosMarca = new ProductosMarca(marca,result.cantidad, result.paginas, productoIds);
 
       if (productosMarca.paginas > 1) {
        console.log("Hay más de una página en la respuesta. Realizar algo adicional.");
        
        const fetchPromises = [];
    
        for (let i = 2; i <= productosMarca.paginas; i++) {
            console.log("haciendo promesas por paginas");
            fetchPromises.push(getProductsByBrandPage(i, productosMarca.marca));
        }
    
        const jsonResponses = await Promise.all(fetchPromises);
    
        // Concatenar las respuestas en un solo arreglo
        productosMarca.productosIds = productosMarca.productosIds.concat(...jsonResponses);
        return productosMarca;
      
    } else {
        console.log("Solo hay una página en la respuesta.");
    }
          
      
    
    } catch (error) {
        console.log('error', error);
    }

}

async function getProductsByBrandPage(pagina,marca){
    const accessToken = tokensyscom.access_token;
    var myHeaders = new Headers();
     
    myHeaders.append("Authorization", "Bearer " + accessToken);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    try {
        const apiUrl = `https://developers.syscom.mx/api/v1/marcas/${marca}/productos?stock=1&pagina=${pagina}`;
       
        const response = await fetch(apiUrl, requestOptions);
        const result = await response.json();

        const productoIds = result.productos.map(producto => producto.producto_id);
        return productoIds;
    
    } catch (error) {
        console.log('error', error);
    }

}



async function getSyscomBrands() {

    const fetchButton = document.getElementById("fetchButton");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const successMessage = document.getElementById("successMessage");
    const fetchButton2 = document.getElementById("fetchButton2");
    successMessage.style.display = "none";
    fetchButton.style.display = "none";
    loadingSpinner.style.display = "block";

    console.log("Inicio de marcas")
    if (tokensyscom === undefined) {
        console.log("Generando token");
        await getSyscomToken();
    }
    if (tokensyscom) {
    
        const accessToken = tokensyscom.access_token;
      
        var myHeaders = new Headers();
     
        myHeaders.append("Authorization", "Bearer " + accessToken);
    
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
    
        try {
            const response = await fetch("https://developers.syscom.mx/api/v1/marcas", requestOptions);
            const result = await response.json();

            // Crear un arreglo de marcas
           syscombrands = result.map(marca => new Marca(marca.id, marca.nombre));

            // Ocultar el indicador de carga y mostrar el mensaje de éxito
            loadingSpinner.style.display = "none";
            successMessage.style.display = "block";
            fetchButton.style.display = "flex";
            fetchButton.disabled = true;
            fetchButton2.disabled = false;
                console.log("se obtuvieron :" +syscombrands.length +" marcas")
               
              
          
        
        } catch (error) {
            console.log('error', error);
        }
 
    }


}


async function getSyscomToken() {
    console.log("llamada de token empezando")
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "client_id": "QuNrKAZZJktKG0ghDrL3nq5CBK56jkiy",
        "client_secret": "EABxnRCs1ER6do3iP8TZ5PydxWqSXYZ7Y6aJG3JB",
        "grant_type": "client_credentials"
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    try {
        const response = await fetch("https://developers.syscom.mx/oauth/token", requestOptions);
        const result = await response.json();
        // Asignar el resultado a la variable global
        tokensyscom = new SyscomToken(result.token_type, result.expires_in,result.access_token);
        //console.log("variableglobal " + tokensyscom.access_token);
        console.log("token generado");
    } catch (error) {
        console.log('error', error);
    }
}

