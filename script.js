/* =====================================================
   TABUNGAN LIBURAN
   SCRIPT.JS
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

const API_URL =
"https://opensheet.elk.sh/1vgp4MkVYRFOqxoojo4mnuYkgX1cxfsUaNleyze9-qYs/transaksi";

const TARGET_LIBURAN = 3000000;

const SHOW_TRANSACTION = 5;


/* =====================================================
   ELEMENT
===================================================== */

const targetValue =
document.getElementById("targetValue");

const progressBar =
document.getElementById("progressBar");

const progressText =
document.getElementById("progressText");

const heroInsight =
document.getElementById("heroInsight");

const saldoCard =
document.getElementById("saldoCard");

const masukCard =
document.getElementById("masukCard");

const bungaCard =
document.getElementById("bungaCard");

const memberList =
document.getElementById("memberList");

const reminderList =
document.getElementById("reminderList");

const loanList =
document.getElementById("loanList");

const transactionList =
document.getElementById("transactionList");

const toggleTransaction =
document.getElementById("toggleTransaction");


/* =====================================================
   GLOBAL
===================================================== */

let transactions = [];

let members = {};

let summary = {};

let showAllTransaction = false;


/* =====================================================
   HELPER
===================================================== */

function rupiah(number){

    return "Rp " +

    Number(number)

    .toLocaleString(
        "id-ID"
    );

}

function formatDate(date){

    return new Date(date)

    .toLocaleDateString(

        "id-ID",

        {

            day:"numeric",

            month:"short",

            year:"numeric"

        }

    );

}

function currentMonth(){

    return new Date()

    .getMonth();

}

function currentYear(){

    return new Date()

    .getFullYear();

}

function month(date){

    return new Date(date)

    .getMonth();

}

function year(date){

    return new Date(date)

    .getFullYear();

}


/* =====================================================
   MEMBER
===================================================== */

function createMember(name){

    return{

        nama:name,

        masuk:0,

        pinjam:0,

        bayar:0,

        bulanIni:false

    };

}


/* =====================================================
   MEMBER SALDO
===================================================== */

function memberSaldo(member){

    return(

        member.masuk +

        member.bayar -

        member.pinjam

    );

}


/* =====================================================
   SORT MEMBER
===================================================== */

function memberData(){

    return Object

    .values(members)

    .sort(

        (a,b)=>

        a.nama

        .localeCompare(

            b.nama,

            "id"

        )

    );

}

/* =====================================================
   FETCH DATA
===================================================== */

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


/* =====================================================
   PROCESS DATA
===================================================== */

function processData(){

    members={};

    summary={

        saldo:0,

        masuk:0,

        pinjam:0,

        bayar:0,

        keluar:0,

        bunga:0,

        masukBulan:0,

        bungaBulan:0,

        progress:0

    };

    const bulan=
    currentMonth();

    const tahun=
    currentYear();

    transactions.forEach(item=>{

        const nama=

        (item.Nama || "")
        .trim();

        const jenis=

        (item.Jenis || "")
        .toLowerCase()
        .trim();

        const nominal=

        Number(item.Bayar)||0;

        const isCurrent=

        month(item.Tanggal)===bulan &&

        year(item.Tanggal)===tahun;

        /* =====================
           MEMBER
        ===================== */

        if(

            nama &&

            !members[nama]

        ){

            members[nama]=

            createMember(nama);

        }

        /* =====================
           TRANSAKSI
        ===================== */

        switch(jenis){

            case "masuk":

                summary.masuk+=nominal;

                summary.saldo+=nominal;

                if(nama){

                    members[nama]

                    .masuk+=nominal;

                }

                if(isCurrent){

                    summary.masukBulan+=nominal;

                    if(nama){

                        members[nama]

                        .bulanIni=true;

                    }

                }

                break;

            case "pinjam":

                summary.pinjam+=nominal;

                summary.saldo-=nominal;

                if(nama){

                    members[nama]

                    .pinjam+=nominal;

                }

                break;

            case "bayar":

                summary.bayar+=nominal;

                summary.saldo+=nominal;

                if(nama){

                    members[nama]

                    .bayar+=nominal;

                }

                if(isCurrent){

                    summary.masukBulan+=nominal;

                }

                break;

            case "bunga":

                summary.bunga+=nominal;

                summary.saldo+=nominal;

                if(isCurrent){

                    summary.bungaBulan+=nominal;

                    summary.masukBulan+=nominal;

                }

                break;

            case "keluar":

                summary.keluar+=nominal;

                summary.saldo-=nominal;

                break;

        }

    });

    summary.progress=

    Math.min(

        (

            summary.saldo /

            TARGET_LIBURAN

        )*100,

        100

    );

    renderHero();

    renderSummary();

    renderMembers();

    renderReminder();

    renderLoans();

    renderTransactions();

        }

/* =====================================================
   HERO
===================================================== */

function renderHero(){

    targetValue.textContent =

        `${rupiah(summary.saldo)} / ${rupiah(TARGET_LIBURAN)}`;

    progressBar.style.width =

        `${summary.progress}%`;

    progressText.textContent =

        `${summary.progress.toFixed(1)}% Tercapai`;

    const belum =

        memberData()

        .filter(

            member => !member.bulanIni

        ).length;

    if(belum===0){

        heroInsight.innerHTML =

        "🎉 Semua anggota sudah menabung bulan ini.";

    }

    else{

        heroInsight.innerHTML =

        `🔔 Masih ada ${belum} anggota yang belum menabung bulan ini.`;

    }

}


/* =====================================================
   SUMMARY
===================================================== */

function renderSummary(){

    saldoCard.innerHTML =

    `

    <div class="summary-icon">

        💰

    </div>

    <div class="summary-title">

        Saldo Saat Ini

    </div>

    <div class="summary-value">

        ${rupiah(summary.saldo)}

    </div>

    `;


    masukCard.innerHTML =

    `

    <div class="summary-icon">

        📈

    </div>

    <div class="summary-title">

        Dana Masuk Bulan Ini

    </div>

    <div class="summary-value">

        ${rupiah(summary.masukBulan)}

    </div>

    `;


    bungaCard.innerHTML =

    `

    <div class="summary-icon">

        🏦

    </div>

    <div class="summary-title">

        Bunga Bulan Ini

    </div>

    <div class="summary-value">

        ${rupiah(summary.bungaBulan)}

    </div>

    `;

}

/* =====================================================
   TABUNGAN ANGGOTA
===================================================== */

function renderMembers(){

    memberList.innerHTML="";

    memberData()

    .forEach(member=>{

        const saldo =

        memberSaldo(member);

        const status =

        member.bulanIni

        ?

        "✅ Sudah Menabung"

        :

        "⏳ Belum Menabung";

        memberList.innerHTML +=

        `

        <div class="member-card">

            <div>

                <div class="member-name">

                    👤 ${member.nama}

                </div>

                <div class="member-status">

                    ${status}

                </div>

            </div>

            <div class="member-balance">

                ${rupiah(saldo)}

            </div>

        </div>

        `;

    });

}


/* =====================================================
   REMINDER
===================================================== */

function renderReminder(){

    reminderList.innerHTML="";

    const belum =

    memberData()

    .filter(

        member=>

        !member.bulanIni

    );

    if(

        belum.length===0

    ){

        reminderList.innerHTML=

        `

        <div class="card">

            🎉 Semua anggota sudah menabung bulan ini.

        </div>

        `;

        return;

    }

    belum.forEach(member=>{

        reminderList.innerHTML+=

        `

        <div class="card">

            ❌

            ${member.nama}

        </div>

        `;

    });

}


/* =====================================================
   RIWAYAT PINJAMAN
===================================================== */

function renderLoans(){

    loanList.innerHTML="";

    const pinjaman =

    transactions

    .filter(item=>

        item.Jenis

        .toLowerCase()

        ==="pinjam"

    )

    .sort(

        (a,b)=>

        new Date(b.Tanggal)-

        new Date(a.Tanggal)

    );

    if(

        pinjaman.length===0

    ){

        loanList.innerHTML=

        `

        <div class="card">

            Belum ada riwayat pinjaman.

        </div>

        `;

        return;

    }

    pinjaman.forEach(item=>{

        const nama=

        item.Nama;

        const pinjam=

        Number(item.Bayar);
       
        const tanggalPinjam = 
          
        new Date(item.Tanggal);

        // Cari pinjaman berikutnya milik orang yang sama
const nextLoan = transactions
    .filter(data =>
        data.Nama === nama &&
        data.Jenis.toLowerCase() === "pinjam" &&
        new Date(data.Tanggal) > tanggalPinjam
    )
    .sort((a, b) => new Date(a.Tanggal) - new Date(b.Tanggal))[0];

// Hitung pembayaran hanya di antara pinjaman ini dan pinjaman berikutnya
const bayar = transactions
    .filter(data => {
        if (data.Nama !== nama) return false;
        if (data.Jenis.toLowerCase() !== "bayar") return false;

        const tgl = new Date(data.Tanggal);

        if (tgl < tanggalPinjam) return false;

        if (nextLoan && tgl >= new Date(nextLoan.Tanggal)) return false;

        return true;
    })
    .reduce((total, data) => total + Number(data.Bayar), 0);

   

        const status=

        bayar>=pinjam

        ?

        "✅ Lunas"

        :

        "⏳ Belum Lunas";

        loanList.innerHTML+=

        `

        <div class="card">

            <strong>

                👤 ${nama}

            </strong>

            <br>

            ${formatDate(item.Tanggal)}

            <br><br>

            Pinjam :

            ${rupiah(pinjam)}

            <br>

            Bayar :

            ${rupiah(bayar)}

            <br><br>

            ${status}

        </div>

        `;

    });

}


/* =====================================================
   TRANSAKSI
===================================================== */

function renderTransactions(){

    transactionList.innerHTML="";

    const data=

    [...transactions]

    .sort(

        (a,b)=>

        new Date(b.Tanggal)-

        new Date(a.Tanggal)

    );

    const tampil=

    showAllTransaction

    ?

    data

    :

    data.slice(

        0,

        SHOW_TRANSACTION

    );

    tampil.forEach(item=>{

        let icon="💰";

        switch(

            item.Jenis

            .toLowerCase()

        ){

            case "masuk":

                icon="🟢";

                break;

            case "pinjam":

                icon="🟠";

                break;

            case "bayar":

                icon="🔵";

                break;

            case "keluar":

                icon="🔴";

                break;

            case "bunga":

                icon="🟣";

                break;

        }

        transactionList.innerHTML+=

        `

        <div class="transaction-card">

            <div>

                <div class="transaction-title">

                    ${icon}

                    ${item.Nama}

                </div>

                <div class="transaction-date">

                    ${formatDate(item.Tanggal)}

                </div>

            </div>

            <div class="transaction-amount">

                ${rupiah(item.Bayar)}

            </div>

        </div>

        `;

    });

    toggleTransaction.textContent=

    showAllTransaction

    ?

    "Tampilkan 5 Terbaru"

    :

    "Lihat Semua";

}


/* =====================================================
   EVENT
===================================================== */

toggleTransaction

.addEventListener(

    "click",

    ()=>{

        showAllTransaction=

        !showAllTransaction;

        renderTransactions();

    }

);


/* =====================================================
   START
===================================================== */

fetchData();




