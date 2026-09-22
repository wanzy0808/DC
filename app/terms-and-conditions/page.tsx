"use client";

import Link from "next/link";
import { useLanguage } from "@/components/I18n/LanguageProvider";

/**
 * Owner-supplied terms adapted for DC Organizer. Keep legal/operational promises
 * aligned with actual services and review the text before production use.
 */
const terms = {
  id: {
    title: "Syarat & Ketentuan",
    introduction: "Ketentuan Umum",
    opening: [
      "Syarat dan Ketentuan Pengguna ini mengatur penggunaan layanan DC Organizer, termasuk situs web, fitur undangan digital, RSVP, manajemen tamu, dan layanan acara yang tersedia melalui platform DC Organizer. Dalam dokumen ini, “DC Organizer” merujuk pada penyedia platform, sementara “Pengguna” atau “Anda” merujuk pada pihak yang mengakses atau menggunakan layanan.",
      "Dengan mendaftar dan/atau menggunakan layanan DC Organizer, Anda menyatakan telah membaca serta memahami ketentuan ini. Apabila Anda tidak menyetujuinya, Anda dapat menghentikan penggunaan layanan dan menghubungi layanan pelanggan melalui kanal yang tersedia pada situs untuk menanyakan penutupan akun.",
      "Pengguna bertanggung jawab memastikan bahwa dirinya memiliki kecakapan hukum untuk menggunakan layanan dan mengadakan perjanjian yang mengikat, termasuk memperoleh persetujuan orang tua atau wali apabila dipersyaratkan oleh hukum yang berlaku.",
    ],
    sections: [
      {
        title: "Definisi",
        points: [
          "“Akun Pengguna” adalah akun yang dibuat setelah proses pendaftaran pada DC Organizer.",
          "“Biaya Layanan” adalah harga atau biaya yang diinformasikan untuk paket atau fitur berbayar sebelum pengguna menyelesaikan transaksi.",
          "“Kebijakan Privasi” adalah ketentuan pemrosesan data pribadi yang tersedia pada halaman Kebijakan Privasi DC Organizer.",
          "“Konten Pengguna” mencakup data, teks, foto, gambar, video, musik, dan berkas lain yang diunggah atau dimasukkan oleh pengguna ke layanan.",
          "“Pengguna” adalah pihak yang mengunjungi, mendaftar, atau menggunakan DC Organizer maupun undangan digital yang dipublikasikan melalui platform.",
          "“Transaksi” adalah pembelian paket atau layanan melalui mekanisme pembayaran yang tersedia pada DC Organizer.",
          "“Undangan Digital” adalah halaman undangan acara yang dibuat dan/atau dipublikasikan menggunakan layanan DC Organizer.",
        ],
      },
      {
        title: "Ketentuan Penggunaan",
        points: [
          "Pengguna bertanggung jawab menjaga keamanan akun, kata sandi, dan akses yang diberikan kepada pihak lain. Jangan menggunakan akun atau identitas milik orang lain tanpa kewenangan.",
          "Pengguna wajib memberikan informasi yang akurat ketika mendaftar, melakukan transaksi, atau menggunakan fitur yang memerlukannya, dan memperbarui informasi tersebut apabila berubah.",
          "Pengguna dilarang memakai layanan untuk penipuan, tindakan melanggar hukum, mengganggu orang lain, merusak sistem, atau mengakses layanan secara tidak sah.",
          "Akses ke sejumlah fitur dapat bergantung pada paket, status pembayaran, jenis acara, atau ketentuan khusus yang ditampilkan pada fitur terkait.",
          "Penggunaan data pribadi sehubungan dengan layanan ini dijelaskan lebih lanjut dalam Kebijakan Privasi DC Organizer.",
        ],
      },
      {
        title: "Konten Pengguna",
        points: [
          "Pengguna tidak boleh mengunggah atau menyebarkan konten yang melanggar hukum, mengandung ancaman, penipuan, diskriminasi, pelanggaran privasi, atau pelanggaran hak pihak lain.",
          "Pengguna bertanggung jawab atas kebenaran informasi acara, izin penggunaan foto, video, musik, nama, data tamu, dan konten lain yang dimasukkan ke platform. Pastikan Anda memiliki hak atau izin yang diperlukan untuk menggunakannya.",
          "Pengguna mempertahankan hak atas Konten Pengguna miliknya. Sepanjang diperlukan untuk menyediakan fitur yang dipilih pengguna, pengguna mengizinkan DC Organizer menyimpan, mengolah, menampilkan, dan menyampaikan konten tersebut kepada tamu yang diberi akses. Izin ini terbatas pada penyediaan dan pengoperasian layanan sesuai pengaturan publikasi pengguna dan Kebijakan Privasi.",
          "DC Organizer dapat membatasi akses atau menghapus konten apabila terdapat alasan yang sah, termasuk laporan pelanggaran hak, penyalahgunaan layanan, atau permintaan berdasarkan ketentuan hukum yang berlaku.",
          "Pengguna bertanggung jawab atas dampak dari pengunggahan atau pembagian Konten Pengguna yang dilakukan tanpa hak. Ketentuan ini tidak menghapus kewajiban DC Organizer yang tetap berlaku berdasarkan hukum.",
        ],
      },
      {
        title: "Biaya Layanan",
        points: [
          "Sebagian fitur atau paket DC Organizer dapat dikenakan biaya. Harga, cakupan fitur, dan syarat pembayaran yang relevan ditampilkan pada halaman paket atau proses transaksi sebelum pembelian diselesaikan.",
          "Akses terhadap layanan berbayar mengikuti paket yang dibeli, status transaksi, serta ketentuan khusus yang diberitahukan pada saat pembelian. Biaya tambahan, apabila ada, harus diinformasikan sebelum transaksi terkait dikonfirmasi.",
          "Ketentuan pembatalan, pengembalian dana, atau perubahan paket—jika tersedia—mengikuti informasi yang ditampilkan pada penawaran atau transaksi terkait serta ketentuan hukum yang berlaku.",
        ],
      },
      {
        title: "Jaminan dan Ketersediaan Layanan",
        points: [
          "DC Organizer berupaya menyediakan layanan sesuai fitur dan cakupan paket yang diinformasikan. Akses dapat terpengaruh oleh pemeliharaan, gangguan jaringan, perangkat pengguna, atau layanan pihak ketiga.",
          "DC Organizer tidak menjamin bahwa layanan akan selalu tersedia tanpa gangguan atau bahwa setiap perangkat, browser, dan koneksi akan bekerja secara identik. Apabila terjadi gangguan, pengguna dapat menghubungi layanan pelanggan melalui kanal yang tersedia.",
          "Informasi acara dan Konten Pengguna berasal dari pengguna yang membuat atau mengunggahnya; pengguna bertanggung jawab memastikan keakuratan informasi tersebut. Ketentuan ini tidak mengurangi hak konsumen atau tanggung jawab yang tidak dapat dikecualikan menurut hukum yang berlaku.",
        ],
      },
      {
        title: "Pembatasan Tanggung Jawab",
        points: [
          "DC Organizer tidak membuat atau memverifikasi setiap Konten Pengguna secara otomatis. Kebenaran detail acara, hak atas media, dan informasi yang dipublikasikan menjadi tanggung jawab pengguna yang memasukkannya, sejauh diperbolehkan oleh hukum.",
          "Kami berupaya menjaga keamanan layanan, tetapi penggunaan layanan daring tetap memiliki risiko, termasuk akses tidak sah, penipuan melalui pihak lain, gangguan jaringan, dan perangkat yang terinfeksi. Pengguna disarankan menjaga kredensial akun dan berhati-hati terhadap tautan atau permintaan data yang mencurigakan.",
          "Setiap pembatasan tanggung jawab dalam ketentuan ini berlaku hanya sejauh diperbolehkan hukum dan tidak mengesampingkan hak konsumen, kewajiban perlindungan data pribadi, maupun tanggung jawab yang menurut hukum wajib dipenuhi oleh DC Organizer.",
        ],
      },
      {
        title: "Hak Kekayaan Intelektual",
        points: [
          "Nama, logo, desain, perangkat lunak, dan konten platform yang dimiliki oleh DC Organizer atau pemberi lisensinya dilindungi oleh hak kekayaan intelektual yang berlaku. Pengguna memperoleh hak untuk memakai layanan sesuai paket dan ketentuan yang diberikan, bukan kepemilikan atas kode atau aset platform.",
          "Hak atas Konten Pengguna tetap berada pada pemegang hak masing-masing. Pengguna tidak boleh menggunakan aset platform atau konten pihak lain untuk kepentingan di luar izin yang telah diberikan.",
        ],
      },
      {
        title: "Kebijakan Privasi",
        points: [
          "Pengumpulan, penggunaan, penyimpanan, serta pembagian informasi pribadi dalam penggunaan DC Organizer dijelaskan pada Kebijakan Privasi. Pengguna dapat membacanya sebelum menggunakan layanan dan ketika diperlukan.",
          "Publikasi undangan yang memuat nama, foto, informasi lokasi, atau data tamu harus dilakukan dengan memperhatikan privasi dan izin pihak yang datanya dicantumkan.",
        ],
      },
      {
        title: "Komisi dan Program Mitra",
        points: [
          "Ketentuan komisi hanya berlaku bagi pengguna yang secara terpisah mengikuti program mitra resmi DC Organizer, apabila program tersebut tersedia.",
          "Hak atas komisi, besaran, persyaratan identitas, metode pembayaran, jadwal penarikan, dan prosedur verifikasi—apabila berlaku—akan dijelaskan pada perjanjian atau ketentuan program mitra tersendiri. Tidak ada jadwal pencairan atau nilai komisi yang dijanjikan oleh dokumen pengguna umum ini.",
        ],
      },
      {
        title: "Lain-lain",
        points: [
          "Syarat dan Ketentuan Pengguna ini mengikuti hukum yang berlaku di Republik Indonesia. Penanganan keluhan atau sengketa dilakukan sesuai mekanisme penyelesaian dan kewenangan yang diatur oleh hukum yang berlaku.",
          "DC Organizer dapat memperbarui ketentuan ini sesuai perkembangan layanan atau kewajiban hukum. Perubahan yang memerlukan pemberitahuan atau persetujuan pengguna akan ditangani sesuai ketentuan hukum dan pemberitahuan yang relevan.",
          "Pengguna yang tidak bersedia menerima ketentuan yang diperbarui dapat berhenti menggunakan layanan dan menghubungi layanan pelanggan yang tercantum pada situs untuk menanyakan penutupan akun dan pengelolaan data terkait.",
        ],
      },
    ],
    privacy: "Baca Kebijakan Privasi",
  },
  en: {
    title: "Terms & Conditions",
    introduction: "General Terms",
    opening: [
      "These User Terms and Conditions govern use of DC Organizer, including its website, digital invitations, RSVP, guest management, and event services offered through the DC Organizer platform. In this document, “DC Organizer” refers to the platform provider, and “User” or “you” refers to anyone accessing or using its services.",
      "By registering for and/or using DC Organizer, you acknowledge that you have read and understood these terms. If you do not agree, you may stop using the services and contact customer support through the channels listed on the website to ask about closing your account.",
      "Users are responsible for ensuring that they have the legal capacity to use the services and enter into a binding agreement, including obtaining a parent’s or guardian’s consent where required by applicable law.",
    ],
    sections: [
      {
        title: "Definitions",
        points: [
          "“User Account” means an account created following registration with DC Organizer.",
          "“Service Fees” means the prices or fees disclosed for paid packages or features before a user completes a transaction.",
          "“Privacy Policy” means the personal-data policy available on DC Organizer’s Privacy Policy page.",
          "“User Content” includes data, text, photos, images, video, music, and other files uploaded or entered by a user.",
          "“User” means anyone visiting, registering for, or using DC Organizer or a digital invitation published through the platform.",
          "“Transaction” means the purchase of a package or service through DC Organizer’s available payment flow.",
          "“Digital Invitation” means an event invitation page created and/or published using DC Organizer.",
        ],
      },
      {
        title: "Use of the Services",
        points: [
          "Users are responsible for keeping their accounts, passwords, and any access granted to others secure. Do not use another person’s account or identity without authorization.",
          "Users must provide accurate information when registering, making transactions, or using features that require it, and update that information when it changes.",
          "Users must not use the services for fraud, unlawful conduct, harassment, system interference, or unauthorized access.",
          "Access to certain features may depend on the selected package, payment status, event type, or feature-specific terms displayed in the service.",
          "The Privacy Policy explains how personal data is handled in connection with the services.",
        ],
      },
      {
        title: "User Content",
        points: [
          "Users must not upload or distribute content that violates the law, contains threats or fraud, discriminates against others, violates privacy, or infringes the rights of third parties.",
          "Users are responsible for event-information accuracy and for having the necessary rights or permissions to use photos, videos, music, names, guest data, and other content submitted to the platform.",
          "Users retain the rights to their own User Content. To the extent needed to provide a user’s chosen features, users permit DC Organizer to store, process, display, and deliver that content to invited guests. This permission is limited to providing and operating the service in accordance with the user’s publication settings and the Privacy Policy.",
          "DC Organizer may restrict access to or remove content where there are lawful grounds, including rights-infringement reports, service misuse, or requests made under applicable law.",
          "Users are responsible for the consequences of uploading or sharing content without permission. This term does not remove obligations that DC Organizer has under applicable law.",
        ],
      },
      {
        title: "Service Fees",
        points: [
          "Some DC Organizer features or packages may be paid. Prices, included features, and relevant payment terms are displayed on package pages or during checkout before purchase.",
          "Access to paid services follows the purchased package, transaction status, and specific conditions disclosed at purchase. Any additional fees must be disclosed before the related transaction is confirmed.",
          "Cancellation, refund, or package-change terms, if offered, follow the information shown with the relevant offer or transaction and applicable law.",
        ],
      },
      {
        title: "Service Availability and Warranties",
        points: [
          "DC Organizer aims to provide the services according to the described features and package scope. Access may be affected by maintenance, network issues, user devices, or third-party services.",
          "DC Organizer does not guarantee uninterrupted availability or identical operation across all devices, browsers, and connections. Users may contact customer support through the channels provided when an issue occurs.",
          "Event details and User Content originate from the users who create or upload them; those users are responsible for the accuracy of that information. This does not limit consumer rights or liabilities that cannot be excluded under applicable law.",
        ],
      },
      {
        title: "Limitation of Liability",
        points: [
          "DC Organizer does not automatically create or verify every item of User Content. Subject to applicable law, users are responsible for event details, media rights, and information they publish.",
          "We work to secure the service, but online services can carry risks, including unauthorized access, third-party fraud, network disruption, and infected devices. Users should protect their account credentials and be cautious with suspicious links and data requests.",
          "Any limitation of liability in these terms applies only to the extent permitted by law and does not waive consumer rights, personal-data obligations, or responsibilities that DC Organizer must meet under applicable law.",
        ],
      },
      {
        title: "Intellectual Property Rights",
        points: [
          "The name, logo, designs, software, and platform content owned by DC Organizer or its licensors are protected by applicable intellectual-property laws. Users receive permission to use the service under the purchased package and applicable terms, not ownership of its code or platform assets.",
          "Rights in User Content remain with their respective owners. Users must not use platform assets or third-party content beyond the permission granted.",
        ],
      },
      {
        title: "Privacy Policy",
        points: [
          "DC Organizer’s Privacy Policy explains how personal information is collected, used, stored, and shared when using the service. Users may review it before using the service and whenever needed.",
          "When publishing invitations containing names, photos, venue details, or guest data, users should respect the privacy and permissions of the people concerned.",
        ],
      },
      {
        title: "Commissions and Partner Programs",
        points: [
          "Commission terms apply only to users who separately join an official DC Organizer partner program, if such a program is available.",
          "Commission eligibility, amounts, identity requirements, payment methods, withdrawal schedules, and verification procedures, where relevant, will be set out in separate partner-program terms or agreements. These general user terms do not promise a specific payment schedule or commission rate.",
        ],
      },
      {
        title: "Other Provisions",
        points: [
          "These User Terms and Conditions are governed by the laws of the Republic of Indonesia. Complaints or disputes will be addressed through procedures and competent authorities established by applicable law.",
          "DC Organizer may update these terms as its services or legal obligations change. Changes requiring user notice or consent will be handled according to applicable law and the relevant notifications.",
          "Users who do not wish to accept updated terms may stop using the service and contact customer support via the website to ask about account closure and related data handling.",
        ],
      },
    ],
    privacy: "Read the Privacy Policy",
  },
} as const;

export default function TermsAndConditionsPage() {
  const { locale } = useLanguage();
  const copy = terms[locale];

  return (
    <article className="relative left-1/2 my-10 w-[calc(100vw-32px)] max-w-[920px] -translate-x-1/2 rounded-[32px] border border-primary/25 bg-background/95 px-5 py-9 text-foreground shadow-[0_18px_65px_rgba(75,35,47,0.09)] sm:my-16 sm:w-full sm:px-10 sm:py-12 lg:px-14">
      <header className="mb-8 border-b border-primary/20 pb-7 sm:mb-10">
        <span aria-hidden="true" className="mb-5 block h-1 w-12 rounded-full bg-primary/70" />
        <h1 className="font-[family-name:var(--font-dc-heading)] text-3xl leading-tight text-primary sm:text-4xl">
          {copy.title}
        </h1>
      </header>

      <div className="space-y-9 font-[family-name:var(--font-dc-body)] text-sm leading-8 text-foreground/85 sm:text-base sm:leading-8">
        <section aria-labelledby="dc-terms-general" className="space-y-4">
          <h2 id="dc-terms-general" className="font-[family-name:var(--font-dc-heading)] text-xl text-primary sm:text-2xl">{copy.introduction}</h2>
          {copy.opening.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </section>
        {copy.sections.map((section, index) => (
          <section key={index} aria-labelledby={`dc-terms-section-${index}`} className="space-y-4 border-t border-primary/15 pt-7">
            <h2 id={`dc-terms-section-${index}`} className="font-[family-name:var(--font-dc-heading)] text-xl leading-snug text-primary sm:text-2xl">{index + 1}. {section.title}</h2>
            <ol className="list-decimal space-y-3 pl-6 marker:text-primary">
              {section.points.map((point, pointIndex) => <li key={pointIndex} className="pl-1">{point}</li>)}
            </ol>
            {index === 7 && <Link href="/privacy-policy" className="inline-flex text-sm font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{copy.privacy}</Link>}
          </section>
        ))}
      </div>
    </article>
  );
}
