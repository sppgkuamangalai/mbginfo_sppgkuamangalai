// Konfigurasi Supabase Client
const SUPABASE_URL = "https://lbduxulsrgyixnavvthu.supabase.co";
const SUPABASE_KEY = "sb_publishable_uJQG-Hpmq55c9f95CAhUdg__22lH9vm";

// Helper function untuk update teks berdasarkan ID
function updateText(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null && value !== "") {
        el.innerText = value;
    }
}

// FUNGSI FINISHING: Open & Close Modal Lightbox Zoom Foto
function openLightbox() {
    const mainImg = document.getElementById("foto-menu-img");
    const lightboxModal = document.getElementById("image-lightbox");
    const lightboxImg = document.getElementById("lightbox-img");

    if (mainImg && lightboxModal && lightboxImg) {
        lightboxImg.src = mainImg.src;
        lightboxModal.style.display = "block";
    }
}

function closeLightbox() {
    const lightboxModal = document.getElementById("image-lightbox");
    if (lightboxModal) {
        lightboxModal.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Fallback Tanggal Hari Ini (Header Utama)
    const dateTextElement = document.getElementById("date-text");
    let now = new Date();

    // Coba ambil tanggal online real-time dari API Server WIB (Asia/Jakarta)
    try {
        const timeRes = await fetch("https://worldtimeapi.org/api/timezone/Asia/Jakarta");
        if (timeRes.ok) {
            const timeData = await timeRes.json();
            now = new Date(timeData.datetime);
        }
    } catch (e) {
        console.warn("Menggunakan jam lokal perangkat sebagai fallback.");
    }

    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if (dateTextElement) {
        dateTextElement.innerText = now.toLocaleDateString('id-ID', optionsDate);
    }

    // 2. Cek Library Supabase
    if (typeof supabase === "undefined") {
        console.error("Library Supabase JS belum terkonfigurasi!");
    } else {
        const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        // 3. Ambil Data Menu HARIAN TERBARU
        try {
            const { data, error } = await _supabase
                .from("menu_harian")
                .select("*")
                .order("id", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error("Error Supabase:", error);
            } else if (data) {
                // Update Tanggal & Foto Menu
                if (data.tanggal_text) updateText("date-text", data.tanggal_text);
                if (data.foto_url) {
                    const imgElem = document.getElementById("foto-menu-img");
                    if (imgElem) imgElem.src = data.foto_url;
                }

                // Update 5 Komponen Isi Kompreng Menu MBG
                updateText("display-menu-karbo", data.menu_karbo);
                updateText("display-menu-protein", data.menu_protein);
                updateText("display-menu-nabati", data.menu_nabati);
                updateText("display-menu-sayur", data.menu_sayur);
                updateText("display-menu-buah", data.menu_buah);

                // Update Kandungan Gizi Porsi Balita
                updateText("val-balita-energi", data.balita_energi);
                updateText("val-balita-protein", data.balita_protein);
                updateText("val-balita-lemak", data.balita_lemak);
                updateText("val-balita-karbo", data.balita_karbo);
                updateText("val-balita-serat", data.balita_serat);

                // Update Kandungan Gizi Porsi Kecil
                updateText("val-kecil-energi", data.kecil_energi);
                updateText("val-kecil-protein", data.kecil_protein);
                updateText("val-kecil-lemak", data.kecil_lemak);
                updateText("val-kecil-karbo", data.kecil_karbo);
                updateText("val-kecil-serat", data.kecil_serat);

                // Update Kandungan Gizi Porsi Besar
                updateText("val-besar-energi", data.besar_energi);
                updateText("val-besar-protein", data.besar_protein);
                updateText("val-besar-lemak", data.besar_lemak);
                updateText("val-besar-karbo", data.besar_karbo);
                updateText("val-besar-serat", data.besar_serat);
            }
        } catch (err) {
            console.warn("Gagal terhubung ke Supabase:", err);
        }
    }

    // ==========================================
    // 4. GENERATE TANGGAL & STATUS HARI INI / MBG / LIBUR (Lengkap & Otomatis)
    // ==========================================
    const dayCols = document.querySelectorAll(".calendar-grid .day-col");

    if (dayCols.length > 0) {
        const currentDay = now.getDay(); // 0: Minggu, 1: Senin, 2: Selasa, ..., 6: Sabtu

        // Hitung selisih hari ke Senin minggu ini
        const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        const monday = new Date(now);
        monday.setDate(now.getDate() + distanceToMonday);

        // Indeks kolom HTML (0 = Senin, 1 = Selasa, ..., 5 = Sabtu)
        const activeIndexInHTML = currentDay === 0 ? -1 : currentDay - 1;

        dayCols.forEach((col, index) => {
            const colDate = new Date(monday);
            colDate.setDate(monday.getDate() + index);

            const dayOfWeek = colDate.getDay(); // 0 = Minggu, 6 = Sabtu
            let dBox = col.querySelector(".d-box");

            // Jika elemen d-box belum ada, gunakan kolom langsung
            const container = dBox || col;

            // Masukkan Angka Tanggal
            let numSpan = container.querySelector(".date-num");
            if (!numSpan) {
                // Buat struktur teks angka jika belum ada
                numSpan = document.createElement("div");
                numSpan.className = "date-num";
                container.appendChild(numSpan);
            }
            numSpan.innerText = colDate.getDate();

            // Masukkan Teks Status (HARI INI / MBG / LIBUR)
            let tagSpan = container.querySelector(".tag") || col.querySelector(".tag");
            if (!tagSpan) {
                tagSpan = document.createElement("div");
                tagSpan.className = "tag";
                container.appendChild(tagSpan);
            }

            // Reset status aktif
            container.classList.remove("active");

            // Penentuan Teks Label
            if (index === activeIndexInHTML) {
                container.classList.add("active");
                tagSpan.innerText = "HARI INI";
            } else if (dayOfWeek === 0 || dayOfWeek === 6) {
                tagSpan.innerText = "LIBUR";
            } else {
                tagSpan.innerText = "MBG";
            }
        });
    }
});
