const SHEET_ID = "1sUQBnkYXLRtiMLMudwlBQyrTaWypVuxEEgHi5UjMXR8";
const GID = "354207978";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;

let rawData = [];

async function loadData() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));
  const cols = json.table.cols.map(c => c.label);
  rawData = json.table.rows.map(r => {
    let obj = {};
    cols.forEach((col, i) => {
      obj[col] = r.c[i] ? r.c[i].v : "";
    });
    return obj;
  });
  renderPetugas();
}

function renderPetugas() {
  const tbody = document.querySelector("#petugasTable tbody");
  tbody.innerHTML = "";
  const grouped = {};
  rawData.forEach(row => {
    const p = row.petugas;
    if (!grouped[p]) grouped[p] = 0;
    grouped[p]++;
  });
  Object.keys(grouped).forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${p}</td><td>${grouped[p]}</td>`;
    tr.onclick = () => showRekap(p);
    tbody.appendChild(tr);
  });
}

function showRekap(petugas) {
  const details = document.getElementById("details");
  const data = rawData.filter(r => r.petugas == petugas);
  const lunas = data.filter(r => r.tgl_lunas);
  const belum = data.filter(r => !r.tgl_lunas);
  details.innerHTML = `
    <h3>Rekap Petugas ${petugas}</h3>
    <p><b>Lunas:</b> <a href="#" onclick="showDetail('${petugas}','lunas');return false;">${lunas.length}</a></p>
    <p><b>Belum Lunas:</b> <a href="#" onclick="showDetail('${petugas}','belum');return false;">${belum.length}</a></p>
  `;
}

function showDetail(petugas, status) {
  const details = document.getElementById("details");
  let data = rawData.filter(r => r.petugas == petugas);
  if (status === "lunas") data = data.filter(r => r.tgl_lunas);
  else data = data.filter(r => !r.tgl_lunas);

  let html = `<h3>Detail Pelanggan Petugas ${petugas} (${status})</h3>`;
  html += `<table><thead><tr>
    <th>idpel</th><th>koked</th><th>nama</th><th>tarif</th><th>daya</th><th>alamat</th><th>jumlah</th><th>tgl_lunas</th>
  </tr></thead><tbody>`;
  data.forEach(r => {
    html += `<tr onclick="showPelanggan('${r.idpel}')">
      <td>${r.idpel}</td><td>${r.koked}</td><td>${r.nama}</td><td>${r.tarif}</td>
      <td>${r.daya}</td><td>${r.alamat}</td><td>${r.jumlah}</td><td>${r.tgl_lunas}</td>
    </tr>`;
  });
  html += "</tbody></table>";
  details.innerHTML = html;
}

function showPelanggan(idpel) {
  const data = rawData.filter(r => r.idpel == idpel);
  let html = `<h3>Detail Pelanggan ${idpel}</h3><ul>`;
  data.forEach(r => {
    Object.keys(r).forEach(k => {
      html += `<li><b>${k}:</b> ${r[k]}</li>`;
    });
  });
  html += "</ul>";
  document.getElementById("details").innerHTML = html;
}

loadData();
