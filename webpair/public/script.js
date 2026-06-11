async function generarQR(){

const result =
document.getElementById('result')

result.innerHTML =
'<p>⏳ Generando QR...</p>'

const res =
await fetch('/generate')

const data =
await res.json()

if(!data.status){

result.innerHTML =
'<p>❌ Error generando QR</p>'

return

}

checkQR()

}

async function checkQR(){

const res =
await fetch('/qr')

const data =
await res.json()

const result =
document.getElementById('result')

if(!data.status){

setTimeout(checkQR,2000)

return

}

result.innerHTML = `
<img src="${data.qr}"
style="
width:260px;
border-radius:20px;
box-shadow:0 0 40px #ff0055;
">
`

}
