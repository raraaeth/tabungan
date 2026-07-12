/* ==========================================
   TABUNGAN LIBURAN
   SCRIPT.JS
========================================== */

const API_URL =
"https://opensheet.elk.sh/1vgp4MkVYRFOqxoojo4mnuYkgX1cxfsUaNleyze9-qYs/transaksi";

/* ==========================================
   TARGET LIBURAN
========================================== */

const TARGET_LIBURAN = 5000000;

/* ==========================================
   GLOBAL DATA
========================================== */

let transactions = [];

let summary = {};

let members = {};

let loans = [];

/* ==========================================
   FORMAT RUPIAH
========================================== */

function rupiah(value){

    return "Rp " +

    Number(value)

    .toLocaleString(
        "id-ID"
    );

}

/* ==========================================
   FORMAT TANGGAL
========================================== */

function formatDate(date){

    return new Date(date)

    .toLocaleDateString(
        "id-ID",
        {

            day:"2-digit",

            month:"short",

            year:"numeric"

        }

    );

}

/* ==========================================
   BULAN SEKARANG
========================================== */

const today = new Date();

const currentMonth =
today.getMonth();

const currentYear =
today.getFullYear();

/* ==========================================
   FETCH DATA
========================================== */

async function fetchData(){

    try{

        const response =
        await fetch(API_URL);

        transactions =
        await response.json();

        processData();

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================
   START
========================================== */

fetchData();

/* ==========================================
   PROCESS DATA
========================================== */

function processData(){

    let saldo = 0;

    let masukBulan = 0;

    let bungaBulan = 0;

    members = {};

    loans = [];

    transactions.forEach(item=>{

        const jenis =
        item.Jenis
        .toLowerCase()
        .trim();

        const nama =
        item.Nama
        .trim();

        const nominal =
        Number(item.Bayar)||0;

        const tanggal =
        new Date(item.Tanggal);

        const bulan =
        tanggal.getMonth();

        const tahun =
        tanggal.getFullYear();

        /* ======================
           MEMBER
        ====================== */

        if(!members[nama]){

            members[nama]={

                nama,

                tabungan:0,

                bulanIni:false

            };

        }

        /* ======================
           SALDO
        ====================== */

        switch(jenis){

            case "masuk":

                saldo+=nominal;

                members[nama].tabungan+=nominal;

                if(
                    bulan===currentMonth &&
                    tahun===currentYear
                ){

                    masukBulan+=nominal;

                    members[nama].bulanIni=true;

                }

                break;

            case "bayar":

                saldo+=nominal;

                break;

            case "bunga":

                saldo+=nominal;

                if(
                    bulan===currentMonth &&
                    tahun===currentYear
                ){

                    bungaBulan+=nominal;

                }

                break;

            case "pinjam":

                saldo-=nominal;

                loans.push({

                    nama,

                    tanggal:item.Tanggal,

                    nominal,

                    status:"Dipinjam"

                });

                break;

            case "keluar":

                saldo-=nominal;

                break;

        }

    });

    /* ======================
       HITUNG STATUS PINJAMAN
    ====================== */

    transactions.forEach(item=>{

        if(
            item.Jenis
            .toLowerCase()
            ==="bayar"
        ){

            const loan =
            loans.find(

                x=>
                x.nama===item.Nama &&
                x.status==="Dipinjam"

            );

            if(loan){

                loan.status="Lunas";

                loan.bayar=
                Number(item.Bayar);

            }

        }

    });

    /* ======================
       SUMMARY
    ====================== */

    summary={

        saldo,

        masukBulan,

        bungaBulan,

        target:TARGET_LIBURAN,

        progress:

        Math.min(

            saldo/
            TARGET_LIBURAN*
            100,

            100

        )

    };

    renderHero();

    renderSummary();

    renderMembers();

    renderReminder();

    renderLoans();

    renderTransactions();

          }

/* ==========================================
   HERO
========================================== */

function renderHero(){

    document.getElementById("targetValue").innerHTML=

    `${rupiah(summary.saldo)}
    / ${rupiah(summary.target)}`;

    document.getElementById("progressBar").style.width=

    `${summary.progress}%`;

    document.getElementById("progressText").innerHTML=

    `${summary.progress.toFixed(1)}% Tercapai`;

}

/* ==========================================
   SUMMARY
========================================== */

function renderSummary(){

    document.getElementById("saldoCard").innerHTML=

    `
    <h3>💰 Saldo Saat Ini</h3>

    <h2>${rupiah(summary.saldo)}</h2>
    `;

    document.getElementById("bulanCard").innerHTML=

    `
    <h3>📈 Dana Masuk Bulan Ini</h3>

    <h2>${rupiah(summary.masukBulan)}</h2>
    `;

    document.getElementById("bungaCard").innerHTML=

    `
    <h3>🏦 Bunga Bulan Ini</h3>

    <h2>${rupiah(summary.bungaBulan)}</h2>
    `;

}

/* ==========================================
   MEMBER
========================================== */

function renderMembers(){

    const container=

    document.getElementById("memberList");

    container.innerHTML="";

    const data=

    Object.values(members)

    .sort(

        (a,b)=>

        b.tabungan-
        a.tabungan

    );

    data.forEach((item,index)=>{

        const persen=

        summary.saldo===0

        ?0

        :

        (item.tabungan/

        summary.saldo)*100;

        container.innerHTML+=

        `
        <div class="card">

            <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;">

                <h3>

                ${index+1}.
                ${item.nama}

                </h3>

                <strong>

                ${rupiah(item.tabungan)}

                </strong>

            </div>

            <div class="progress"
            style="margin-top:15px;">

                <div
                class="progress-bar"

                style="width:${persen}%">

                </div>

            </div>

            <small>

            ${persen.toFixed(1)}%
            dari total tabungan

            </small>

        </div>

        `;

    });

      }

/* ==========================================
   REMINDER
========================================== */

function renderReminder(){

    const container =
    document.getElementById("reminderList");

    container.innerHTML = "";

    const belum =
    Object.values(members)
    .filter(
        item => !item.bulanIni
    );

    if(belum.length===0){

        container.innerHTML=

        `
        <div class="card">

            🎉 Semua anggota sudah
            menabung bulan ini.

        </div>
        `;

        return;

    }

    belum.forEach(item=>{

        container.innerHTML+=

        `
        <div class="card">

            ❌ ${item.nama}

        </div>
        `;

    });

}

/* ==========================================
   PINJAMAN
========================================== */

function renderLoans(){

    const container =
    document.getElementById("loanList");

    container.innerHTML="";

    if(loans.length===0){

        container.innerHTML=

        `
        <div class="card">

            Tidak ada riwayat pinjaman.

        </div>
        `;

        return;

    }

    loans.forEach(item=>{

        const warna =
        item.status==="Lunas"
        ? "#16A085"
        : "#E67E22";

        container.innerHTML+=

        `
        <div class="card">

            <h3>

                ${item.nama}

            </h3>

            <p>

                ${formatDate(item.tanggal)}

            </p>

            <p>

                Pinjam :
                <b>${rupiah(item.nominal)}</b>

            </p>

            ${
                item.bayar

                ?

                `<p>
                Bayar :
                <b>${rupiah(item.bayar)}</b>
                </p>`

                :

                ""

            }

            <p
            style="
            color:${warna};
            font-weight:600;
            ">

                ${item.status}

            </p>

        </div>

        `;

    });

}

/* ==========================================
   TRANSAKSI
========================================== */

function renderTransactions(){

    const tbody =
    document.getElementById("transactionTable");

    tbody.innerHTML="";

    const data =

    [...transactions]

    .sort(

        (a,b)=>

        new Date(b.Tanggal)
        -
        new Date(a.Tanggal)

    );

    data.forEach(item=>{

        let badge="#3498DB";

        switch(

            item.Jenis
            .toLowerCase()

        ){

            case "masuk":

                badge="#2ECC71";

                break;

            case "pinjam":

                badge="#F39C12";

                break;

            case "bayar":

                badge="#3498DB";

                break;

            case "keluar":

                badge="#E74C3C";

                break;

            case "bunga":

                badge="#9B59B6";

                break;

        }

        tbody.innerHTML+=

        `
        <tr>

            <td>

                ${formatDate(item.Tanggal)}

            </td>

            <td>

                <span
                style="
                background:${badge};
                color:white;
                padding:4px 10px;
                border-radius:20px;
                font-size:12px;
                ">

                ${item.Jenis}

                </span>

            </td>

            <td>

                ${item.Nama}

            </td>

            <td>

                ${rupiah(item.Bayar)}

            </td>

        </tr>

        `;

    });

}
