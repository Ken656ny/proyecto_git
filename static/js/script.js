
// FUCNIONALIDAD PARA LA BARRA DE NAVEGACION

const nav_bar = document.querySelectorAll('.nav__item')


function bar_funct(){
    nav_bar.forEach((item) => 
        item.classList.remove('active'));
    this.classList.add('active');
}
nav_bar.forEach((item) => item.addEventListener('click',bar_funct));

// DIALOGS DE LO BOTONES DE LOS REGISTROS DE LOS PORCINOS

function dialog_eye(){
    const mod_wind = document.getElementById('dialog-icon-eye')
    const btn_abrir = document.getElementById('abrir-dieye')
    const btn_cerrar = document.getElementById('cerrar-dieye')
    
    btn_abrir.addEventListener('click', function() {
        mod_wind.showModal(); 
    });
    
    btn_cerrar.addEventListener('click', function() {
        mod_wind.close();
    });
}

function dialog_edit(){
    const mod_wind = document.getElementById('dialog-icon-edit')
    const btn_abrir = document.getElementById('abrir-diedit')
    const btn_cerrar = document.getElementById('cerrar-diedit')
    
    btn_abrir.addEventListener('click', function() {
        mod_wind.showModal(); 
    });
    
    btn_cerrar.addEventListener('click', function() {
        mod_wind.close();
    });
}

function dialog_delete(){
    const mod_wind = document.getElementById('dialog-icon-dele')
    const btn_abrir = document.getElementById('abrir-didele')
    const btn_cerrar = document.getElementById('cerrar-didele')
    
    btn_abrir.addEventListener('click', function() {
        mod_wind.showModal(); 
    });
    
    btn_cerrar.addEventListener('click', function() {
        mod_wind.close();
    });

}

//CONFIRMACION DE CONTRASEÑA EN EL APARTADO DE REGISTRO

function ConfirmarContraseña(event) {
    event.preventDefault();

    const contraseña1 = document.getElementById("password").value;
    const contraseña2 = document.getElementById("confirmPassword").value;
    const mensaje = document.getElementById("mensaje");

    if (contraseña1 === contraseña2) {
        mensaje.textContent = "Registro exitoso. Redirigiendo...";
        mensaje.classList.add("success");
        mensaje.classList.remove("alerta");
        mensaje.style.display = "block";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } else {
        mensaje.textContent = "Las contraseñas no coinciden. Por favor, inténtelo de nuevo.";
        mensaje.classList.add("alerta");
        mensaje.classList.remove("success");
        mensaje.style.display = "block";
        return false;
    }
}

    function ValidarPassword() {
    let password = document.getElementById("password").value;
    let confirmpassword = document.getElementById("confirmpassword").value;
    let mensajerror = document.getElementById("mesajerror");
    if (password !== confirmpassword){
        alert ("Contraseña no coinciden")
        return false

        alert ("Contraseña correcta")
        return true
    }}