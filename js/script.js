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
    // 1. Fallback Tanggal Hari Ini
    const dateTextElement = document.getElementById("date-text");
    const now = new Date();
    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if (dateTextElement) {
        dateTextElement.innerText = now.toLocaleDateString('id-ID', optionsDate);
    }

    // 2. Cek Library Supabase
    if (typeof supabase === "undefined") {
        console.error("Library Supabase JS belum terkonfigurasi!");
        return;
    }

    const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // 3. Ambil Data Menu HARIAN TERBARU (Mengambil 1 baris paling atas/paling baru)
    try {
        const { data, error } = await _supabase
            .from("menu_harian")
            .select("*")
            .order("id", { ascending: false }) // Ambil baris data terbaru
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("Error Supabase:", error);
            return;
        }

        if (data) {
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

    // 4. Highlight Hari Aktif di Kalender Operasional MBG
    const currentDayIndex = now.getDay();
    const dayCols = document.querySelectorAll(".calendar-grid .day-col");
    const gridMapping = [6, 0, 1, 2, 3, 4, 5];
    const activeGridIndex = gridMapping[currentDayIndex];

    dayCols.forEach((col, index) => {
        const dBox = col.querySelector(".d-box");
        const tag = col.querySelector(".tag");

        if (index === activeGridIndex) {
            if (dBox) dBox.classList.add("active");
            if (tag) tag.innerText = "HARI INI";
        }
    });
});