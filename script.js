/* =====================================================
   TABUNGAN LIBURAN
   SCRIPT.JS
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

const API_URL =
"https://opensheet.elk.sh/1Osl7-ble42Rg84Il04uXoNDrn6mzO0CstKC3_Cs6Vxg/kas";

const TARGET_LIBURAN = 3000000;

const SHOW_TRANSACTION = 5;

const SHOW_LOAN = 2;


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

const toggleLoan =
document.getElementById("toggleLoan");

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

let showAllLoan = false;


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

        hutang:0,

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

        member.hutang

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

        hutang:0,

        bayar:0,

        keluar:0,

        bunga:0,

        masukBulan:0,

        bungaBulan:0,

        progress:0

    };


    const bulan =
    currentMonth();

    const tahun =
    currentYear();


    transactions.forEach(item=>{

        const nama =

        (item.nama || "")
        .trim();


        const jenis =

        (item.jenis || "")
        .toLowerCase()
        .trim();


        const kategori =

        (item.kategori || "")
        .toLowerCase()
        .trim();


        const nominal =

        Number(item.nominal) || 0;


        const isCurrent =

        month(item.tanggal) === bulan &&

        year(item.tanggal) === tahun;


        /* =====================
           MEMBER
        ===================== */

        if(

            nama &&

            !members[nama]

        ){

            members[nama] =

            createMember(nama);

        }


        /* =====================
           NABUNG
        ===================== */

        if(

            jenis === "masuk" &&

            kategori === "nabung"

        ){

            summary.masuk += nominal;

            summary.saldo += nominal;


            if(nama){

                members[nama]

                .masuk += nominal;

            }


            if(isCurrent){

                summary.masukBulan += nominal;


                if(nama){

                    members[nama]

                    .bulanIni = true;

                }

            }

        }


        /* =====================
           HUTANG
        ===================== */

        else if(

            jenis === "keluar" &&

            kategori === "hutang"

        ){

            summary.hutang += nominal;

            summary.saldo -= nominal;


            if(nama){

                members[nama]

                .hutang += nominal;

            }

        }


        /* =====================
           BAYAR HUTANG
        ===================== */

        else if(

            jenis === "masuk" &&

            kategori === "bayar"

        ){

            summary.bayar += nominal;

            summary.saldo += nominal;


            if(nama){

                members[nama]

                .bayar += nominal;

            }


            if(isCurrent){

                summary.masukBulan += nominal;

            }

        }


        /* =====================
           BUNGA
        ===================== */

        else if(

            jenis === "masuk" &&

            kategori === "bunga"

        ){

            summary.bunga += nominal;

            summary.saldo += nominal;


            if(isCurrent){

                summary.bungaBulan += nominal;

                summary.masukBulan += nominal;

            }

        }


        /* =====================
           KELUAR LAINNYA
        ===================== */

        else if(

            jenis === "keluar"

        ){

            summary.keluar += nominal;

            summary.saldo -= nominal;

        }

    });


    /* =====================
       PROGRESS
    ===================== */

    summary.progress =

    Math.min(

        (

            summary.saldo /

            TARGET_LIBURAN

        ) * 100,

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


    if(belum === 0){

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

        member =>

        !member.bulanIni

    );


    if(

        belum.length === 0

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

        reminderList.innerHTML +=

        `

        <div class="card">

            ❌

            ${member.nama}

        </div>

        `;

    });

}


/* =====================================================
   RIWAYAT HUTANG
===================================================== */

function renderLoans(){

    loanList.innerHTML="";


    const hutang =

    transactions

    .filter(item =>

        (item.jenis || "")
        .toLowerCase()
        .trim()

        === "keluar"

        &&

        (item.kategori || "")
        .toLowerCase()
        .trim()

        === "hutang"

    )


    .sort(

        (a,b)=>

        new Date(b.tanggal) -

        new Date(a.tanggal)

    );


    if(

        hutang.length === 0

    ){

        loanList.innerHTML=

        `

        <div class="card">

            Belum ada riwayat hutang.

        </div>

        `;

        return;

    }


    const tampil =

        showAllLoan

        ?

        hutang

        :

        hutang.slice(

            0,

            SHOW_LOAN

        );


    tampil.forEach(item=>{

        const nama =

        item.nama;


        const hutangNominal =

        Number(item.nominal) || 0;


        const tanggalHutang =

        new Date(item.tanggal);


        /* ==========================
           CARI HUTANG BERIKUTNYA
        ========================== */

        const nextLoan =

        transactions

        .filter(data =>

            data.nama === nama &&

            (data.jenis || "")
            .toLowerCase()
            .trim()

            === "keluar" &&

            (data.kategori || "")
            .toLowerCase()
            .trim()

            === "hutang" &&

            new Date(data.tanggal) >

            tanggalHutang

        )

        .sort(

            (a,b)=>

            new Date(a.tanggal) -

            new Date(b.tanggal)

        )[0];


        /* ==========================
           HITUNG PEMBAYARAN
        ========================== */

        const bayar =

        transactions

        .filter(data=>{

            if(data.nama !== nama)

                return false;


            if(

                (data.jenis || "")
                .toLowerCase()
                .trim()

                !== "masuk"

            )

                return false;


            if(

                (data.kategori || "")
                .toLowerCase()
                .trim()

                !== "bayar"

            )

                return false;


            const tgl =

            new Date(data.tanggal);


            if(

                tgl < tanggalHutang

            )

                return false;


            if(

                nextLoan &&

                tgl >=

                new Date(

                    nextLoan.tanggal

                )

            )

                return false;


            return true;

        })


        .reduce(

            (total,data)=>

            total +

            (Number(data.nominal) || 0),

            0

        );


        const status =

        bayar >= hutangNominal

        ?

        "✅ Lunas"

        :

        "⏳ Belum Lunas";


        loanList.innerHTML +=

        `

        <div class="card">

            <strong>

                👤 ${nama}

            </strong>

            <br>

            ${formatDate(item.tanggal)}

            <br><br>

            Hutang :

            ${rupiah(hutangNominal)}

            <br>

            Bayar :

            ${rupiah(bayar)}

            <br><br>

            ${status}

        </div>

        `;

    });


    toggleLoan.textContent =

    showAllLoan

    ?

    "Tampilkan 2 Terbaru"

    :

    "Lihat Semua";

}


/* =====================================================
   TRANSAKSI
===================================================== */

function renderTransactions(){

    transactionList.innerHTML="";


    const data =

    [...transactions]

    .sort(

        (a,b)=>

        new Date(b.tanggal) -

        new Date(a.tanggal)

    );


    const tampil =

    showAllTransaction

    ?

    data

    :

    data.slice(

        0,

        SHOW_TRANSACTION

    );


    tampil.forEach(item=>{

        let icon = "💰";


        const jenis =

        (item.jenis || "")
        .toLowerCase()
        .trim();


        const kategori =

        (item.kategori || "")
        .toLowerCase()
        .trim();


        /* =====================
           ICON
        ===================== */

        if(

            jenis === "masuk" &&

            kategori === "nabung"

        ){

            icon = "🟢";

        }

        else if(

            jenis === "keluar" &&

            kategori === "hutang"

        ){

            icon = "🟠";

        }

        else if(

            jenis === "masuk" &&

            kategori === "bayar"

        ){

            icon = "🔵";

        }

        else if(

            jenis === "keluar"

        ){

            icon = "🔴";

        }

        else if(

            jenis === "masuk" &&

            kategori === "bunga"

        ){

            icon = "🟣";

        }


        transactionList.innerHTML +=

        `

        <div class="transaction-card">

            <div>

                <div class="transaction-title">

                    ${icon}

                    ${item.nama || kategori}

                </div>

                <div class="transaction-date">

                    ${formatDate(item.tanggal)}

                </div>

            </div>

            <div class="transaction-amount">

                ${rupiah(item.nominal)}

            </div>

        </div>

        `;

    });


    toggleTransaction.textContent =

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

        showAllTransaction =

        !showAllTransaction;

        renderTransactions();

    }

);


toggleLoan

.addEventListener(

    "click",

    ()=>{

        showAllLoan =

        !showAllLoan;

        renderLoans();

    }

);


/* =====================================================
   START
===================================================== */

fetchData();
