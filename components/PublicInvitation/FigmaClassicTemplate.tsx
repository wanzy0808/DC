import RsvpForm from "@/components/InvitationStudio/RsvpForm";
import type { PublicInvitationData } from "@/components/PublicInvitation/PublicInvitation";

function Divider() {
  return (
    <div className="flex w-full items-center justify-center gap-3 py-1 text-[#a8a29e]">
      <span className="h-px w-14 bg-[#a8a29e]" />
      <span className="grid h-4 w-4 place-items-center rounded-full border border-[#a8a29e] text-[7px]">◆</span>
      <span className="h-px w-14 bg-[#a8a29e]" />
    </div>
  );
}

function SectionHeading({ label, title, description }: { label: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a8a29e]">{label}</p>
      <h2 className="font-[Cormorant_Garamond,serif] text-4xl leading-none font-normal text-[#27272a]">{title}</h2>
      {description && <p className="font-sans text-xs leading-5 text-[#a8a29e]">{description}</p>}
    </div>
  );
}

export default function FigmaClassicTemplate({ invitation, eventKind }: { invitation: PublicInvitationData; eventKind: "wedding" | "special" }) {
  const image = invitation.assets?.find((asset) => asset.type === "IMAGE")?.url;
  const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeZone: invitation.timezone || "Asia/Jakarta" }).format(invitation.eventDate);
  const title = eventKind === "special" ? "Undangan Acara" : "Undangan Pernikahan";

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-zinc-800">
      <div className="mx-auto w-full max-w-md border border-stone-400 p-2">
        <section className="flex flex-col items-center gap-14 pt-8">
          <div className="flex w-full flex-col items-center gap-6 px-2 pb-4">
            <div className="grid h-14 w-14 place-items-center rounded-[28px] border border-stone-400">
              <span className="font-[Cormorant_Garamond,serif] text-2xl">{invitation.groomName.slice(0, 1)}&amp;{invitation.brideName.slice(0, 1)}</span>
            </div>
            <div className="w-full">
              <p className="text-center font-sans text-xs font-semibold uppercase text-stone-400">{title}</p>
              <h1 className="mt-2 text-center font-[Cormorant_Garamond,serif] text-5xl leading-none font-normal">{invitation.groomName} &amp; {invitation.brideName}</h1>
            </div>
            <div className="h-80 w-60 overflow-hidden rounded-t-[120px] border border-stone-400 p-0.5">
              {image ? <img src={image} alt="" className="h-full w-full rounded-t-[118px] object-cover" /> : <div className="h-full w-full rounded-t-[118px] bg-stone-200" />}
            </div>
            <div className="w-full">
              <p className="text-center font-[Cormorant_Garamond,serif] text-lg">{date}</p>
              <p className="mt-1 text-center font-sans text-xs text-stone-400">{invitation.venue}</p>
            </div>
          </div>

          <Divider />

          <section className="flex w-full flex-col items-center gap-10 px-2 text-center">
            <div className="flex flex-col gap-4">
              <p className="font-[Cormorant_Garamond,serif] text-base leading-6 text-stone-400">“Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di hari istimewa kami.”</p>
              <p className="font-sans text-xs leading-5">{invitation.description || "Dengan memohon rahmat dan ridho-Nya, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan kami."}</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <h2 className="font-[Cormorant_Garamond,serif] text-3xl font-normal">{invitation.brideName}</h2>
              <p className="font-sans text-xs text-stone-400">Mempelai wanita</p>
            </div>
            <p className="font-[Cormorant_Garamond,serif] text-2xl text-stone-400">&amp;</p>
            <div className="flex flex-col items-center gap-3">
              <h2 className="font-[Cormorant_Garamond,serif] text-3xl font-normal">{invitation.groomName}</h2>
              <p className="font-sans text-xs text-stone-400">Mempelai pria</p>
            </div>
          </section>

          <Divider />

          <section className="flex w-full flex-col items-center gap-8 px-2">
            <SectionHeading label="Save The Date" title="Waktu & Lokasi" description="Hari kebahagiaan kami akan diselenggarakan pada:" />
            <div className="w-full rounded-xl border border-stone-400 bg-stone-200 p-6 text-center">
              <h3 className="font-[Cormorant_Garamond,serif] text-xl">Akad Nikah</h3>
              <div className="mx-auto my-4 h-px w-10 bg-stone-400" />
              <p className="font-sans text-sm font-semibold">{invitation.ceremonyTime || "Waktu akan diumumkan"}</p>
              <p className="mt-1 font-sans text-xs text-stone-400">Khusus keluarga dan kerabat dekat</p>
            </div>
            <div className="w-full rounded-xl bg-zinc-800 p-6 text-center text-stone-50">
              <h3 className="font-[Cormorant_Garamond,serif] text-xl">Resepsi Pernikahan</h3>
              <div className="mx-auto my-4 h-px w-10 bg-stone-400" />
              <p className="font-sans text-sm font-semibold">{invitation.receptionTime || "Waktu akan diumumkan"}</p>
              <p className="mt-1 font-sans text-xs text-stone-400">Sesi umum untuk para tamu undangan</p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-stone-200 text-xs">⌖</div>
              <h3 className="font-[Cormorant_Garamond,serif] text-2xl">{invitation.venue}</h3>
              {invitation.address && <p className="font-sans text-xs leading-5 text-stone-400">{invitation.address}</p>}
              {invitation.mapUrl && <a href={invitation.mapUrl} target="_blank" rel="noreferrer" className="font-sans text-xs underline underline-offset-4">Lihat Lokasi</a>}
            </div>
          </section>

          <Divider />

          <section className="w-full px-2 pb-6">
            <SectionHeading label="Kehadiran" title="Konfirmasi RSVP" description="Silakan isi konfirmasi kehadiran Anda untuk membantu persiapan kami." />
            <div className="mt-8">
              <RsvpForm slug={invitation.slug} eventDate={invitation.eventDate} venue={invitation.venue} title={invitation.title} start={invitation.ceremonyTime || invitation.receptionTime} description={invitation.description} />
            </div>
          </section>

          <Divider />

          <section className="w-full px-2 pb-6">
            <SectionHeading label="Hadiah Pernikahan" title="Gift" description="Bantuan Anda akan membantu kami membangun kehidupan baru bersama." />
            {invitation.giftBankName && invitation.giftAccountNumber ? (
              <div className="mt-8 w-full rounded-xl border border-stone-400 bg-stone-200 p-6">
                <h3 className="text-center font-[Cormorant_Garamond,serif] text-xl">Transfer Bank</h3>
                <div className="mx-auto my-4 h-px w-10 bg-stone-400" />
                <div className="space-y-3 font-sans text-sm">
                  <div><p className="text-xs font-semibold uppercase text-stone-400">Bank</p><p className="font-semibold">{invitation.giftBankName}</p></div>
                  {invitation.giftAccountName && <div><p className="text-xs font-semibold uppercase text-stone-400">Nama Pemilik</p><p className="font-semibold">{invitation.giftAccountName}</p></div>}
                  <div><p className="text-xs font-semibold uppercase text-stone-400">Nomor Rekening</p><p className="font-semibold">{invitation.giftAccountNumber}</p></div>
                </div>
              </div>
            ) : (
              <p className="mt-8 text-center font-sans text-xs text-stone-400">Informasi hadiah akan ditampilkan di sini jika pasangan mengaktifkannya.</p>
            )}
          </section>

          <Divider />

          <footer className="w-full px-4 pb-8 text-center">
            <p className="font-sans text-xs leading-5 text-stone-400">Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.</p>
            <p className="mt-6 font-[Cormorant_Garamond,serif] text-xl">Kami yang berbahagia,</p>
            <p className="mt-4 font-[Cormorant_Garamond,serif] text-2xl">{invitation.groomName} &amp; {invitation.brideName}</p>
            <p className="mt-1 font-sans text-xs uppercase text-stone-400">Beserta Keluarga Besar</p>
          </footer>
        </section>
      </div>
    </main>
  );
}
