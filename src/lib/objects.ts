/** Data objek untuk Circle Hunter & aktivitas Misi 1. */
export const CIRCLE_OBJECTS = ["coin", "clock", "wheel", "plate", "cd", "button", "lid", "donut"] as const;
export const NON_CIRCLE_OBJECTS = ["book", "phone", "door", "egg", "slice", "dice", "kite", "ruler", "tv", "football"] as const;

export const OBJECT_INFO: Record<string, { name: string; circle: boolean; why: string }> = {
  coin: { name: "Uang koin", circle: true, why: "Permukaan koin bundar: jarak tepi ke pusat sama." },
  clock: { name: "Jam dinding", circle: true, why: "Jarum berputar mengitari titik pusat lingkaran." },
  wheel: { name: "Roda", circle: true, why: "Roda berbentuk lingkaran agar berputar mulus." },
  plate: { name: "Piring", circle: true, why: "Tepi piring membentuk lingkaran." },
  cd: { name: "Keping CD", circle: true, why: "CD berbentuk lingkaran dengan lubang di pusatnya." },
  button: { name: "Kancing baju", circle: true, why: "Kancing bulat berbentuk lingkaran." },
  lid: { name: "Tutup botol", circle: true, why: "Tutup botol dilihat dari atas berbentuk lingkaran." },
  donut: { name: "Donat", circle: true, why: "Tepi luar donat dilihat dari atas berbentuk lingkaran." },
  book: { name: "Buku", circle: false, why: "Buku berbentuk persegi panjang: punya 4 sisi lurus." },
  phone: { name: "Ponsel", circle: false, why: "Ponsel berbentuk persegi panjang dengan sudut tumpul." },
  door: { name: "Pintu", circle: false, why: "Pintu berbentuk persegi panjang." },
  egg: { name: "Telur", circle: false, why: "Telur berbentuk oval: jarak tepi ke tengah tidak sama." },
  slice: { name: "Potongan kue", circle: false, why: "Potongan kue berbentuk juring/segitiga, bukan lingkaran utuh." },
  dice: { name: "Dadu", circle: false, why: "Sisi dadu berbentuk persegi." },
  kite: { name: "Layang-layang", circle: false, why: "Layang-layang punya 4 sisi lurus dan 4 sudut." },
  ruler: { name: "Penggaris", circle: false, why: "Penggaris berbentuk persegi panjang." },
  tv: { name: "Televisi", circle: false, why: "Layar TV berbentuk persegi panjang." },
  football: { name: "Bola rugbi", circle: false, why: "Bola rugbi lonjong (oval), bukan lingkaran." },
};
