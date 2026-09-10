// Konfigurasi Supabase
const SUPABASE_URL = "https://lbduxulsrgyixnavvthu.supabase.co";
const SUPABASE_KEY = "sb_publishable_uJQG-Hpmq55c9f95CAhUdg__22lH9vm";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let base64ImageString = "";

// Set Tanggal Hari Ini & Event Listener Upload + Kompresi Gambar
document.addEventListener("DOMContentLoaded", () => {
    const inputTanggal = document.getElementById("input-tanggal");
    const today = new Date().toISOString().split("T")[0];
    if (inputTanggal) inputTanggal.value = today;

    // Handle Pembacaan & Kompresi Foto dari File Manager / Galeri
    const fileInput = document.getElementById("input-foto-file");
    const previewWrapper = document.getElementById("preview-wrapper");
    const imagePreview = document.getElementById("image-preview");

    if (fileInput) {
        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    const img = new Image();
                    img.src = evt.target.result;
                    img.onload = function () {
                        // Kompresi Otomatis Foto HP
                        const canvas = document.createElement("canvas");
                        const MAX_WIDTH = 800; // Ukuran optimal untuk HP & Desktop
                        const scaleFactor = MAX_WIDTH / img.width;
                        
                        canvas.width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
                        canvas.height = (img.width > MAX_WIDTH) ? img.height * scaleFactor : img.height;

                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        // Ubah ke Format JPEG Kualitas 75%
                        base64ImageString = canvas.toDataURL("image/jpeg", 0.75);
                        imagePreview.src = base64ImageString;
                        previewWrapper.style.display = "block";
                    };
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// Helper pintar untuk menempelkan satuan (Kcal/Gram) di belakang angka yang sudah diisi
function appendUnitIfExists(id, unit) {
    const el = document.getElementById(id);
    if (el) {
        let currentVal = el.value.trim();
        // Jika kolom ada isinya dan belum memiliki teks satuan
        if (currentVal !== "" && !currentVal.toLowerCase().includes(unit.toLowerCase().trim())) {
            el.value = currentVal + " " + unit;
        }
    }
}

// Fungsi Otomatis Menambahkan Satuan (Kcal / Gram) di Belakang Angka
function isiFormatGizi() {
    const giziList = [
        // 1. Porsi Balita
        { id: "balita-energi", unit: "Kcal" },
        { id: "balita-protein", unit: "Gram" },
        { id: "balita-lemak", unit: "Gram" },
        { id: "balita-karbo", unit: "Gram" },
        { id: "balita-serat", unit: "Gram" },

        // 2. Porsi Kecil
        { id: "kecil-energi", unit: "Kcal" },
        { id: "kecil-protein", unit: "Gram" },
        { id: "kecil-lemak", unit: "Gram" },
        { id: "kecil-karbo", unit: "Gram" },
        { id: "kecil-serat", unit: "Gram" },

        // 3. Porsi Besar
        { id: "besar-energi", unit: "Kcal" },
        { id: "besar-protein", unit: "Gram" },
        { id: "besar-lemak", unit: "Gram" },
        { id: "besar-karbo", unit: "Gram" },
        { id: "besar-serat", unit: "Gram" }
    ];

    giziList.forEach(item => {
        appendUnitIfExists(item.id, item.unit);
    });
}

// Alias agar kompatibel jika tombol di HTML menggunakan onclick="isiGiziStandar()"
function isiGiziStandar() {
    isiFormatGizi();
}

// Proses Simpan Data ke Supabase
const adminForm = document.getElementById("admin-form");
const statusMsg = document.getElementById("status-msg");

if (adminForm) {
    adminForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        if (!base64ImageString) {
            alert("Pilih foto menu dari perangkat terlebih dahulu!");
            return;
        }

        statusMsg.innerText = "⏳ Memproses & menyimpan data ke database...";
        statusMsg.style.color = "#38bdf8";

        // Format Tanggal Bahasa Indonesia
        const rawDateVal = document.getElementById("input-tanggal").value;
        const [year, month, day] = rawDateVal.split("-");
        const rawDate = new Date(year, month - 1, day);

        const dateFormatted = rawDate.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        const getValue = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : "";
        };

        const payload = {
            tanggal_text: dateFormatted,
            foto_url: base64ImageString,
            
            // 5 Komponen Menu MBG
            menu_karbo: getValue("menu-karbo"),
            menu_protein: getValue("menu-protein"),
            menu_nabati: getValue("menu-nabati"),
            menu_sayur: getValue("menu-sayur"),
            menu_buah: getValue("menu-buah"),
            
            // Kandungan Gizi Porsi Balita
            balita_energi: getValue("balita-energi"),
            balita_protein: getValue("balita-protein"),
            balita_lemak: getValue("balita-lemak"),
            balita_karbo: getValue("balita-karbo"),
            balita_serat: getValue("balita-serat"),

            // Kandungan Gizi Porsi Kecil
            kecil_energi: getValue("kecil-energi"),
            kecil_protein: getValue("kecil-protein"),
            kecil_lemak: getValue("kecil-lemak"),
            kecil_karbo: getValue("kecil-karbo"),
            kecil_serat: getValue("kecil-serat"),

            // Kandungan Gizi Porsi Besar
            besar_energi: getValue("besar-energi"),
            besar_protein: getValue("besar-protein"),
            besar_lemak: getValue("besar-lemak"),
            besar_karbo: getValue("besar-karbo"),
            besar_serat: getValue("besar-serat")
        };

        try {
            // 1. Cek Data Terakhir di Supabase
            const { data: existingData } = await _supabase
                .from("menu_harian")
                .select("id, tanggal_text")
                .order("id", { ascending: false })
                .limit(1)
                .maybeSingle();

            // 2. Jika Tanggal Baru BERBEDA dengan Tanggal Terakhir di Database, Hapus Data Lama Otomatis
            if (existingData && existingData.tanggal_text !== dateFormatted) {
                await _supabase
                    .from("menu_harian")
                    .delete()
                    .neq("id", 0); // Menghapus seluruh baris data lama
            }

            // 3. Simpan Data Hari Baru ke Supabase menggunakan Timestamp Unik
            const uniqueId = Date.now();
            const { error: insertError } = await _supabase
                .from("menu_harian")
                .insert([{ id: uniqueId, ...payload }]);

            if (insertError) {
                statusMsg.innerText = "❌ Gagal menyimpan data: " + insertError.message;
                statusMsg.style.color = "#f87171";
            } else {
                statusMsg.innerText = "✅ Berhasil Diupdate! Data Hari Sebelumnya Otomatis Dibersihkan.";
                statusMsg.style.color = "#4ade80";
            }
        } catch (err) {
            statusMsg.innerText = "❌ Terjadi kesalahan: " + err.message;
            statusMsg.style.color = "#f87171";
        }
    });
}