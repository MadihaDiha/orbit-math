# Font ORBIT MATH (disimpan di proyek)

| File | Font | Sumber | Lisensi |
|---|---|---|---|
| `orbitron-latin-variable.woff2` | Orbitron (variable, wght 400–900, subset latin) | Google Fonts | [SIL Open Font License 1.1](https://openfontlicense.org) |
| `nunito-latin-variable.woff2` | Nunito (variable, wght 200–1000, subset latin) | Google Fonts | [SIL Open Font License 1.1](https://openfontlicense.org) |

File ini sama persis dengan yang sebelumnya diunduh `next/font/google` saat build.
Disimpan di proyek supaya `next build` **tidak bergantung pada koneksi ke Google Fonts** —
sebelumnya build bisa gagal dengan `TypeError: Cannot read properties of null (reading '1')`
di `next/font/google` (loader.js) ketika respons Google Fonts tidak berisi URL `.woff2` yang lengkap.
