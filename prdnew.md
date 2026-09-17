# DC Organizer — Proposed New Product Requirements

**Status:** Draft / Pending Manual Merge  
**Purpose:** Menampung requirement/fitur baru hasil diskusi sebelum digabung manual ke `prd.md`.  
**Canonical PRD:** `prd.md` tetap menjadi Single Source of Truth sampai isi dokumen ini dipilih dan di-merge manual.  
**Created:** 17 September 2026

> File ini bukan pengganti `prd.md` dan bukan implementation changelog. Jangan menganggap requirement di sini aktif/canonical sampai sudah di-merge ke `prd.md`.

---

## 1. Scalable Invitation Template Architecture

### 1.1 Product goal

DC Organizer harus mendukung katalog undangan dalam skala besar — puluhan hingga ratusan template — tanpa membuat satu aplikasi, backend, database flow, atau feature implementation terpisah untuk setiap template.

Prinsip utamanya:

**Satu shared invitation engine + shared event/content data + shared feature logic + banyak presentation/template.**

Template adalah reusable design definition. Satu template yang sama dapat digunakan oleh jumlah user/event yang tidak dibatasi tanpa membuat copy source template untuk setiap customer.

Setiap invitation/event hanya perlu mereferensikan template yang dipilih melalui identity seperti `templateKey` beserta konfigurasi/content milik event tersebut.

---

## 2. Shared Data & Function, Template-Specific Presentation

### 2.1 Shared DC functionality

Business logic dan data contract fitur invitation harus dimiliki oleh core DC Organizer dan reusable antar-template.

Contoh capability shared:
- event identity/content;
- date/time;
- venue/address;
- Maps/location;
- gallery/media;
- RSVP;
- Wishes/guest messages;
- Gift / E-Angpao;
- countdown bila tersedia;
- closing/footer;
- feature lain yang kemudian menjadi bagian dari invitation engine.

Template baru tidak boleh membutuhkan duplikasi API, database table/model, RSVP engine, Wishes engine, Gift engine, payment logic, guest logic, atau business logic lain hanya untuk mendapatkan visual yang berbeda.

### 2.2 Template owns presentation

Walaupun function/data bersifat shared, **presentation setiap section wajib mengikuti template yang sedang dipilih**.

Contoh:
- RSVP pada Botanical Ivory dapat menggunakan visual floral/ivory;
- RSVP pada Midnight Romance dapat menggunakan visual dark/elegant;
- RSVP pada Modern Maroon dapat menggunakan visual editorial/maroon;
- semuanya tetap menggunakan RSVP function/data contract yang sama.

Aturan yang sama berlaku pada Wishes, Gift, Gallery, Event Detail, Location, Closing, dan section lain.

Dengan demikian, reusable component tidak boleh memaksa semua template terlihat identik. Reuse terutama berada pada behavior, validation, data flow, accessibility contract, dan backend interaction; template tetap memiliki kebebasan presentation.

---

## 3. Section-Based Invitation Composition

Invitation dibangun sebagai kumpulan section yang dapat dikomposisikan.

Contoh section yang dapat didukung:
- Cover / Hero;
- Introduction / Greeting;
- Identity / Host / Couple;
- Event Detail;
- Date & Time;
- Gallery;
- Countdown;
- Location / Maps;
- RSVP;
- Wishes;
- Gift / E-Angpao;
- Closing;
- Footer.

Daftar tersebut dapat berkembang dan tidak semua event category/template wajib memakai semua section.

### 3.1 Section ON/OFF

Section yang bersifat optional harus dapat diaktifkan atau dinonaktifkan sesuai capability Studio dan konfigurasi invitation.

Contoh konfigurasi:

```text
Cover       ON
Story       OFF
Event       ON
Gallery     ON
Countdown   OFF
Location    ON
RSVP        ON
Wishes      ON
Gift        OFF
Closing     ON
```

Renderer public hanya merender section yang aktif dan valid untuk invitation tersebut.

Menonaktifkan section presentation tidak boleh menghapus atau merusak shared core feature/data secara tidak sengaja.

### 3.2 Section animation toggle

Template boleh menentukan animation/motion default untuk section yang memang memiliki animasi.

Animation default adalah bagian dari karakter desain template dan ditentukan oleh template designer/implementation, bukan dirakit bebas oleh customer di Studio.

Untuk section yang memiliki animation capability, Studio boleh menyediakan kontrol sederhana untuk mematikan animasi pada section tersebut.

Canonical behavior:
- jika template tidak memiliki animasi pada suatu section, Studio tidak perlu menampilkan animation control untuk section tersebut;
- jika template memiliki animasi, default mengikuti animation yang ditentukan template;
- user dapat memilih **Animasi ON / OFF** untuk section tersebut;
- `OFF` berarti section tetap tampil dan berfungsi normal tetapi tanpa decorative/template motion;
- toggle animation tidak mengubah section ON/OFF;
- Studio tidak menjadi general-purpose animation editor dan tidak perlu memberikan customer daftar bebas seperti bounce/rotate/slide untuk mengganti karakter template;
- animation state harus tersimpan sebagai configuration milik invitation/event dan reusable template master tidak boleh dimodifikasi untuk user lain.

Animasi yang bersifat functional/necessary untuk menjelaskan state aplikasi tidak boleh dihilangkan apabila penghapusannya membuat interaction menjadi tidak jelas. Toggle terutama ditujukan untuk decorative/template motion.

Implementation juga harus menghormati accessibility preference seperti reduced motion ketika relevan.

### 3.3 Template-owned default section order

Setiap template boleh memiliki **default section order** sendiri sebagai bagian dari composition/design template.

Contoh:

```text
Romantic Sage
Cover → Identity → Event → Gallery → RSVP → Wishes → Closing

Template lain
Cover → Event → Identity → Wishes → Gallery → Closing
```

Kedua template tetap mengonsumsi normalized data dan shared feature logic yang sama. Perbedaan urutan hanya merupakan presentation/composition concern.

Canonical behavior:
- default order ditentukan oleh template;
- section yang OFF dilewati tanpa merusak urutan section lain;
- template tidak wajib memiliki urutan yang sama dengan template lain;
- perubahan urutan tidak boleh menduplikasi atau memindahkan business logic ke template layer;
- bila Studio kelak mengizinkan user reorder section, kemampuan tersebut harus eksplisit dan dibatasi oleh rules/capabilities template. Sampai ada requirement khusus, template default order tetap authoritative untuk composition.

---

## 4. Template Freedom

Template bukan sekadar pergantian warna dan font.

Setiap template boleh memiliki:
- typography berbeda;
- color system berbeda;
- background berbeda;
- ornament/artwork berbeda;
- card/button/input treatment berbeda;
- spacing berbeda;
- animation berbeda bila sesuai performance/accessibility requirement;
- layout section berbeda;
- composition berbeda;
- urutan section berbeda bila product rules mengizinkan;
- presentation RSVP/Wishes/Gift yang benar-benar berbeda.

Yang distandardisasi adalah **data contract dan functional behavior**, bukan bentuk visual akhir.

Template tetap harus mempertahankan function yang diperlukan. Perbedaan visual tidak boleh merusak submit RSVP, Wishes, Maps, Gift information, accessibility, event isolation, entitlement, atau server-side validation.

### 4.1 Template-safe customization

Studio harus menjaga karakter desain template dengan hanya mengekspos customization yang memang diizinkan oleh template tersebut.

User **tidak otomatis memiliki kebebasan untuk mengubah seluruh aspek visual**.

Template dapat mendeklarasikan customization capabilities seperti:
- content/text yang memang editable;
- customer photos/media;
- music/audio bila didukung;
- accent color atau limited color choices bila designer mengizinkan;
- section ON/OFF;
- animation ON/OFF pada section yang mendukung;
- customization lain yang secara eksplisit dinyatakan aman oleh template.

Template dapat mengunci aspek seperti:
- typography/font pairing;
- core layout;
- spacing system;
- ornament placement;
- composition;
- button/card treatment;
- structural visual decisions lain yang bila diubah dapat merusak desain.

Studio harus membaca capability template dan hanya menampilkan control yang valid. Tujuannya adalah memberi personalization yang berguna tanpa membuat customer secara tidak sengaja merusak visual quality template.

---

## 5. Reusable Template Model

### 5.1 One template, unlimited events/users

Template master disimpan satu kali sebagai shared application asset/definition.

Contoh konseptual:

```text
Template: midnight-romance

User/Event A -> templateKey = midnight-romance
User/Event B -> templateKey = midnight-romance
User/Event C -> templateKey = midnight-romance
```

Sistem tidak membuat tiga copy source template.

Per-event storage hanya menyimpan data/configuration yang memang spesifik terhadap event/customer, misalnya:
- selected `templateKey`;
- section configuration;
- event content;
- customer media references;
- feature configuration;
- design customization yang memang didukung Studio.

### 5.2 Storage principle

Shared template assets tidak diduplikasi per customer.

Pertumbuhan storage customer terutama berasal dari customer-generated/uploaded media seperti image/audio/video, bukan karena setiap customer memiliki copy template master.

Template assets harus dapat dikelola sebagai shared static/durable assets dan dapat dipindahkan ke storage/CDN strategy yang lebih scalable bila diperlukan.

---

## 6. Designer-Friendly Template Intake

Designer tidak diwajibkan memahami React, Next.js, TypeScript, API, Prisma, database, atau backend logic untuk menyumbangkan template baru.

Designer menyediakan **design package/reference**, bukan business logic.

Contoh struktur konseptual package template:

```text
romantic-sage/
  preview.jpg

  fonts/
    heading.woff2
    body.woff2

  images/
    cover.webp
    flower-top.webp
    flower-bottom.webp
    ornament.webp
    divider.webp

  design/
    cover.png
    event.png
    gallery.png
    rsvp.png
    wishes.png
    gift.png
    closing.png
```

Struktur final boleh berkembang, tetapi prinsipnya harus tetap sederhana dan dapat dipahami designer non-programmer.

Designer idealnya menyerahkan reference desain invitation secara lengkap dari atas sampai bawah, termasuk visual state section interaktif yang relevan.

Minimal reference yang dianjurkan:
- Cover;
- Identity/Introduction;
- Event Detail;
- Gallery bila didukung;
- Location;
- RSVP;
- Wishes;
- Gift;
- Closing.

Section optional tetap boleh tidak digunakan pada invitation tertentu, tetapi template harus memiliki treatment yang jelas untuk section yang diklaim didukung.

---

## 7. Template Implementation Workflow

Target workflow penambahan template:

```text
Designer creates design
        ↓
Designer supplies assets + full-page/section references
        ↓
Template registered in DC catalog
        ↓
Developer/AI implements presentation mapping
        ↓
Shared DC section logic/data is connected
        ↓
Template QA with standard demo scenarios
        ↓
Template available in Studio
```

Developer/AI bertugas menerjemahkan design package menjadi presentation layer yang kompatibel dengan shared invitation engine.

Penambahan template baru idealnya **tidak menyentuh**:
- Prisma schema;
- core RSVP API;
- core Wishes API;
- payment/entitlement logic;
- guest isolation logic;
- event ownership logic;
- unrelated dashboard/business logic.

Perubahan pada area tersebut hanya dilakukan bila template memperkenalkan product capability baru yang benar-benar membutuhkan perubahan shared engine, bukan sekadar karena visual template berbeda.

### 7.1 Standard template preview & dummy-data QA

DC Organizer harus memiliki **standard demo/dummy invitation data** yang dapat digunakan secara konsisten untuk preview dan QA template baru.

Tujuannya adalah memastikan template tidak hanya terlihat benar dengan content ideal dari Figma, tetapi juga tetap stabil dengan variasi data customer nyata.

Template baru minimal harus dapat diuji dengan scenario seperti:
- nama/identity pendek;
- nama/identity panjang;
- venue/address pendek dan panjang;
- content text pendek dan panjang bila field mendukung;
- tanpa customer photo/media pada section optional;
- satu/sedikit photo;
- banyak photo sampai batas yang didukung;
- RSVP ON dan OFF;
- Wishes ON dan OFF;
- Gift ON dan OFF;
- Location/Maps ON dan OFF bila applicable;
- animation ON dan OFF bila applicable;
- kombinasi beberapa optional section OFF untuk memastikan composition tetap rapi.

Standard dummy data harus reusable antar-template sehingga QA tidak bergantung pada designer membuat test data baru setiap kali.

Preview/demo data tidak boleh tercampur dengan production customer data.

Template dianggap belum siap masuk katalog production apabila variasi content umum menyebabkan overflow, layout rusak, section kosong yang janggal, atau core interaction tidak dapat digunakan.

---

## 8. Template Contract

Agar katalog dapat tumbuh ke ratusan template, setiap template harus mengikuti kontrak yang konsisten.

Secara konseptual template harus memiliki:
- stable unique key;
- display name;
- description;
- preview/thumbnail;
- asset location;
- supported event/category compatibility bila diperlukan;
- supported sections;
- default section order;
- allowed customization capabilities;
- presentation implementation/theme definition;
- default section animation capability/configuration bila tersedia;
- version/migration strategy bila struktur template kemudian berubah secara material.

Template renderer menerima normalized invitation/event data dari shared engine dan tidak mengambil ownership atas business rules yang seharusnya berada di backend/core application.

---

## 9. Separation of Responsibilities

Canonical separation:

```text
DC CORE
├── Data contracts
├── Database
├── Authorization
├── Event isolation
├── RSVP logic
├── Wishes logic
├── Gift data
├── Maps/location data
├── Validation
├── Payment/entitlement
└── Other business rules

TEMPLATE LAYER
├── Typography
├── Colors
├── Layout
├── Artwork
├── Ornament
├── Animation
├── Section composition/order
├── Allowed customization capabilities
├── RSVP presentation
├── Wishes presentation
├── Gift presentation
└── Other visual treatment
```

Template layer boleh mengatur bagaimana shared function ditampilkan, tetapi tidak boleh menjadi source of truth untuk authorization, entitlement, payment, ownership, RSVP persistence, Wishes persistence, atau data-security rules.

---

## 10. Scalability Requirement

Arsitektur invitation harus dirancang agar penambahan template ke-50 atau ke-100 tidak memiliki kompleksitas yang setara dengan membangun ulang invitation feature dari awal.

Setelah shared engine dan section contracts matang, pekerjaan utama template baru seharusnya didominasi oleh:
- assets;
- metadata;
- styling/theme;
- section presentation;
- layout/composition;
- template-specific animation;
- QA.

Bukan oleh duplikasi backend/business logic.

Jika penambahan template baru secara rutin memerlukan copy-paste core RSVP/Wishes/Gift implementation atau perubahan database/API yang sama berulang kali, architecture dianggap perlu direview karena tidak memenuhi scalability goal ini.

### 10.1 Lazy loading / template isolation

Jumlah template dalam katalog tidak boleh membuat setiap public invitation mengirim seluruh code dan asset dari semua template ke browser visitor.

Jika invitation menggunakan `romantic-sage`, browser sebisa mungkin hanya memuat code/presentation dependency dan assets yang diperlukan oleh `romantic-sage` beserta shared DC runtime yang memang dibutuhkan.

Canonical performance goals:
- template renderer harus dapat dipisahkan/load secara independen bila practical;
- asset template lain tidak boleh dimuat hanya karena terdaftar di katalog;
- katalog dengan puluhan/ratusan template tidak boleh secara linear memperbesar initial public invitation payload;
- shared components/utilities tetap boleh berada dalam common bundle bila memang digunakan lintas-template dan bundling tersebut lebih efisien;
- implementation harus menghindari eager importing seluruh template renderer ke public client bundle jika hal tersebut menyebabkan semua template ikut terkirim;
- preview/Studio boleh memiliki loading strategy berbeda dari public invitation selama performance tetap terkontrol.

Tujuan requirement ini adalah menjaga public invitation tetap ringan walaupun katalog DC Organizer terus bertambah.

---

## 11. Compatibility with Existing Product Rules

Requirement draft ini tidak mengubah aturan canonical berikut:
- `prd.md` tetap Single Source of Truth sampai manual merge dilakukan;
- event/invitation tetap event-scoped;
- `Invitation.templateKey` tetap menjadi identity penting untuk selected template;
- publish tetap server-authoritative;
- Digital Invitation entitlement tetap event-scoped;
- authorization tetap server-side;
- public invitation tetap harus memenuhi configured/template/published/entitlement gates;
- DC Organizer tetap general-event SaaS dan template baru tidak boleh mengembalikan universal wedding assumptions.

---

## 12. Manual Merge Note

Saat requirement ini disetujui untuk production planning, pindahkan bagian relevan ke `prd.md` dan sesuaikan numbering/section master PRD.

Setelah manual merge selesai, `prdnew.md` dapat dikosongkan, diarsipkan, atau dihapus sesuai keputusan owner agar tidak berkembang menjadi PRD kedua yang saling bertentangan.
