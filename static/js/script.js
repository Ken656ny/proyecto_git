
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
// Datos de prueba
const samplePesos = [
  {id:123, rango:'16 - 30 KG', peso:'17 KG'},
  {id:456, rango:'31 - 50 KG', peso:'34 KG'}
];
const sampleAlimentos = [
  {id:123, mayor:'3 de 3 dietas elaboradas', menor:'---', promedio:'10 KG'},
  {id:321, mayor:'---', menor:'0 de 3 dietas elaboradas', promedio:'0 KG'}
];

// Función para renderizar filas de pesos
function makeRowPesos(r){
  return `
    <div class="row-card">
      <div class="row-left">
        <div class="icon-big">
          <img src="img/icon-cerdo.png" alt="cerdo" style="width:24px;height:24px">
        </div>
        <div style="text-align:left">
          <div style="font-weight:700">${r.id}</div>
          <div class="small-muted">ID del porcino</div>
        </div>
      </div>
      <div style="flex:1;text-align:center">${r.rango}</div>
      <div style="width:140px;text-align:center;font-weight:700">${r.peso}</div>
      <div style="width:64px;text-align:center">
        <img src="img/icon-chart.png" alt="graf" style="width:28px;height:28px">
      </div>
    </div>
  `;
}

// Función para renderizar filas de alimentos
function makeRowAlimentos(r){
  return `
    <div class="row-card">
      <div class="row-left">
        <div class="icon-big">
          <img src="img/icon-grain.png" alt="grano" style="width:24px;height:24px">
        </div>
        <div style="text-align:left">
          <div style="font-weight:700">${r.id}</div>
          <div class="small-muted">ID del alimento</div>
        </div>
      </div>
      <div style="flex:1;text-align:center">${r.mayor}</div>
      <div style="flex:1;text-align:center">${r.menor}</div>
      <div style="width:160px;text-align:center;font-weight:700">${r.promedio}</div>
      <div style="width:64px;text-align:center">
        <img src="img/icon-chart.png" alt="graf" style="width:28px;height:28px">
      </div>
    </div>
  `;
}

// Generar reporte según el tipo
function generateReport(){
  const type = document.getElementById('reportType').value;
  const wrapper = document.getElementById('reportWrapper');
  const content = document.getElementById('reportContent');
  const title = document.getElementById('pageTitle');

  wrapper.style.display = 'block';
  wrapper.setAttribute('aria-hidden','false');

  if(type === 'pesos'){
    title.textContent = 'Generar informes de los pesos mas altos y mas bajos';
    let html = `<div style="font-weight:700;margin-bottom:8px">Resultados</div>`;
    html += samplePesos.map(r=>makeRowPesos(r)).join('');
    content.innerHTML = html;
  } else {
    title.textContent = 'Generar informe de los alimentos mas y menos usados';
    let html = `<div style="font-weight:700;margin-bottom:8px">Resultados</div>`;
    html += sampleAlimentos.map(r=>makeRowAlimentos(r)).join('');
    content.innerHTML = html;
  }
}

// Imprimir reporte
function printReport(){ 
  window.print(); 
}

// Filtrar por ID cuando se presiona Enter
document.getElementById('porcId').addEventListener('keydown', (e)=>{
  if(e.key === 'Enter'){
    const val = Number(e.target.value.trim());
    if(!val) return;
    const type = document.getElementById('reportType').value;
    const content = document.getElementById('reportContent');
    const wrapper = document.getElementById('reportWrapper');
    if(type==='pesos'){
      const data = samplePesos.filter(x=>x.id===val);
      if(data.length){
        content.innerHTML = data.map(r=>makeRowPesos(r)).join('');
      } else {
        content.innerHTML = '<div style="padding:18px;text-align:center">No se encontró el ID</div>';
      }
      wrapper.style.display='block';
    }
  }
});
