
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