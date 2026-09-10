import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RsvpForm from "@/components/InvitationStudio/RsvpForm";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";

const fallbackImage = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=85&w=1600";

export default async function InvitationPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ guestId?: string }> }) {
  const { slug } = await params;
  const { guestId } = await searchParams;
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: { assets: { orderBy: { createdAt: "asc" } }, payment: true },
  });

  if (!invitation) notFound();
  if (!invitation.isPublished || !hasPaidDigitalInvitation(invitation.payment)) notFound();
  const guest = guestId ? await prisma.guest.findFirst({ where: { id: guestId, invitationId: invitation.id } }) : null;
  await prisma.invitation.update({ where: { id: invitation.id }, data: { viewCount: { increment: 1 } } });

  const images = invitation.assets.filter((asset) => asset.type === "IMAGE");
  const audio = invitation.musicUrl ?? invitation.assets.find((asset) => asset.type === "AUDIO")?.url;
  const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(invitation.eventDate);
  const hasGiftDetails = invitation.giftBankName || invitation.giftAccountName || invitation.giftAccountNumber;

  return (
    <main className="relative z-10 min-h-screen bg-[#f7f0ea]/90 text-[#2c2020]">
      <section className="relative flex min-h-screen items-end overflow-hidden px-6 py-16 text-white">
        <img src={images[0]?.url ?? fallbackImage} alt="Foto pasangan" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#24161a]/95 via-[#24161a]/45 to-[#24161a]/10" />
        <div className="relative mx-auto w-full max-w-5xl text-center">
          <p className="text-xs uppercase tracking-[0.35em] opacity-80">The Wedding Of</p>
          <h1 className="mt-5 font-serif text-6xl leading-none md:text-8xl">{invitation.groomName} <span className="text-[#eab8a2]">&amp;</span> {invitation.brideName}</h1>
          <p className="mx-auto mt-8 max-w-xl text-sm leading-7 opacity-85">{invitation.description}</p>
          <p className="mt-8 text-xs uppercase tracking-[0.2em]">{date}</p>
          <p className="mt-2 text-sm opacity-80">{invitation.venue}</p>
          {audio && <audio className="mx-auto mt-8 w-full max-w-xs" controls src={audio}>Browser tidak mendukung audio.</audio>}
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-12 px-6 py-20 text-center">
        <div><p className="text-xs uppercase tracking-[0.3em] text-[#9b5b51]">Save The Date</p><h2 className="mt-3 font-serif text-4xl">Sebuah hari untuk dikenang</h2><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 opacity-70">Terima kasih telah menjadi bagian dari cerita kami. Kehadiran dan doa baik Anda adalah hadiah paling berarti.</p></div>
        <div className="grid gap-4 text-left sm:grid-cols-2">
          <div className="border border-[#9b5b51]/20 bg-white/60 p-6"><p className="text-xs uppercase tracking-widest text-[#9b5b51]">Tanggal</p><p className="mt-3 font-serif text-2xl">{date}</p></div>
          <div className="border border-[#9b5b51]/20 bg-white/60 p-6"><p className="text-xs uppercase tracking-widest text-[#9b5b51]">Lokasi</p><p className="mt-3 font-serif text-2xl">{invitation.venue}</p></div>
          {(invitation.ceremonyTime || invitation.receptionTime) && <div className="border border-[#9b5b51]/20 bg-white/60 p-6"><p className="text-xs uppercase tracking-widest text-[#9b5b51]">Waktu acara</p>{invitation.ceremonyTime && <p className="mt-3 text-sm">Akad / pemberkatan: <strong>{invitation.ceremonyTime}</strong></p>}{invitation.receptionTime && <p className="mt-2 text-sm">Resepsi: <strong>{invitation.receptionTime}</strong></p>}</div>}
          {invitation.dressCode && <div className="border border-[#9b5b51]/20 bg-white/60 p-6"><p className="text-xs uppercase tracking-widest text-[#9b5b51]">Dress code</p><p className="mt-3 text-sm leading-6">{invitation.dressCode}</p></div>}
        </div>
        {(invitation.weddingHashtag || invitation.eventNotes || invitation.liveStreamUrl) && <div className="space-y-4 border border-[#9b5b51]/20 bg-white/60 p-6 text-left"><p className="text-xs uppercase tracking-widest text-[#9b5b51]">Informasi untuk tamu</p>{invitation.weddingHashtag && <p className="font-serif text-2xl text-[#9b5b51]">{invitation.weddingHashtag}</p>}{invitation.eventNotes && <p className="whitespace-pre-line text-sm leading-7">{invitation.eventNotes}</p>}{invitation.liveStreamUrl && <a href={invitation.liveStreamUrl} target="_blank" rel="noreferrer" className="inline-block text-sm font-medium text-[#9b5b51] underline">Tonton live streaming</a>}</div>}
        {hasGiftDetails && <div className="border border-[#9b5b51]/20 bg-white/60 p-6 text-left"><p className="text-xs uppercase tracking-widest text-[#9b5b51]">Amplop digital</p><p className="mt-3 text-sm leading-7">Doa dan kehadiran Anda adalah hadiah terindah. Jika berkenan mengirim tanda kasih secara cashless:</p>{invitation.giftBankName && <p className="mt-4 font-medium">{invitation.giftBankName}</p>}{invitation.giftAccountName && <p className="text-sm">a.n. {invitation.giftAccountName}</p>}{invitation.giftAccountNumber && <p className="mt-1 font-serif text-2xl tracking-wide">{invitation.giftAccountNumber}</p>}</div>}
        {images.length > 0 && <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{images.map((image) => <img key={image.id} src={image.url} alt={image.title ?? "Galeri pernikahan"} className="aspect-square w-full object-cover" />)}</div>}
        <RsvpForm slug={invitation.slug} guestId={guest?.id} guestName={guest?.name} eventDate={invitation.eventDate} venue={invitation.venue} title={invitation.title} start={invitation.ceremonyTime ?? invitation.receptionTime} end={invitation.receptionTime ?? invitation.ceremonyTime} description={invitation.description} />
        <p className="pt-8 text-xs uppercase tracking-[0.3em] text-[#9b5b51]">With love, {invitation.groomName} &amp; {invitation.brideName}</p>
      </section>
    </main>
  );
}
