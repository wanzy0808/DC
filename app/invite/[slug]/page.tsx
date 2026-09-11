import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RsvpForm from "@/components/InvitationStudio/RsvpForm";
import { hasPaidDigitalInvitation } from "@/lib/packages/access";
import { invitationPalettes, invitationFonts, parseDesignKey } from "@/lib/templates/design";

const fallbackImage = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=85&w=1600";

export default async function InvitationPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ guestId?: string }> }) {
  const { slug } = await params; const { guestId } = await searchParams;
  const invitation = await prisma.invitation.findUnique({ where: { slug }, include: { assets: { orderBy: { createdAt: "asc" } }, payment: true } });
  if (!invitation || !invitation.isPublished) notFound();

  // Digital Invitation is purchased once for the main WEDDING invitation.
  // The included ADAT_AKAD invitation shares that entitlement and does not need a second payment.
  let hasAccess = hasPaidDigitalInvitation(invitation.payment);
  if (!hasAccess && invitation.type === "ADAT_AKAD") {
    const weddingPayment = await prisma.payment.findFirst({
      where: {
        userId: invitation.ownerId,
        status: "PAID",
        packageKey: { in: ["INVITATION_BASIC", "INVITATION_GUESTBOOK"] },
        invitation: { type: "WEDDING" },
      },
      orderBy: { createdAt: "desc" },
    });
    hasAccess = Boolean(weddingPayment);
  }
  if (!hasAccess) notFound();

  const guest = guestId ? await prisma.guest.findFirst({ where: { id: guestId, invitationId: invitation.id } }) : null;
  await prisma.invitation.update({ where: { id: invitation.id }, data: { viewCount: { increment: 1 } } });
  const images = invitation.assets.filter(a => a.type === "IMAGE"); const audio = invitation.musicUrl ?? invitation.assets.find(a => a.type === "AUDIO")?.url;
  const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(invitation.eventDate); const d = parseDesignKey(invitation.templateKey); const p = invitationPalettes[d.palette]; const f = invitationFonts[d.font];
  const heading = { fontFamily: f.heading }; const body = { fontFamily: f.body };
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitation.venue)}`;
  return <main style={{background:p.bg,color:p.ink,...body}} className="min-h-screen">
    <section className="relative flex min-h-[88vh] items-end overflow-hidden px-6 py-20 text-center"><img src={images[0]?.url ?? fallbackImage} alt="Foto pasangan" className="absolute inset-0 h-full w-full object-cover opacity-25"/><div className="absolute inset-0" style={{background:`linear-gradient(180deg,${p.bg}20,${p.bg})`}}/><div className="relative mx-auto max-w-4xl"><p className="text-xs uppercase tracking-[.4em]" style={{color:p.accent}}>The Wedding Of</p><h1 className="mt-8 text-5xl leading-tight md:text-8xl" style={heading}>{invitation.groomName}<br/><span style={{color:p.soft}}>&amp;</span><br/>{invitation.brideName}</h1><p className="mx-auto mt-8 max-w-xl text-sm leading-7 opacity-70">{invitation.description}</p><p className="mt-8 text-xs uppercase tracking-[.22em]" style={{color:p.accent}}>{date}</p>{audio&&<audio className="mx-auto mt-7 w-full max-w-xs" controls src={audio}/>}</div></section>
    <section className="mx-auto max-w-4xl space-y-16 px-6 py-20 text-center">
      <section><p className="text-xs uppercase tracking-[.3em]" style={{color:p.accent}}>Save The Date</p><h2 className="mt-3 text-3xl md:text-4xl" style={heading}>A day to remember</h2><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 opacity-65">Terima kasih telah menjadi bagian dari cerita kami. Kehadiran dan doa baik Anda adalah hadiah yang berarti.</p></section>
      <div className="grid gap-4 text-left sm:grid-cols-2">{[["Tanggal",date],["Lokasi",invitation.venue],...(invitation.ceremonyTime?[["Akad / Pemberkatan",invitation.ceremonyTime]]:[]),...(invitation.receptionTime?[["Resepsi",invitation.receptionTime]]:[])].map(([a,b])=><div key={a} className="border-b p-5" style={{borderColor:`${p.accent}30`}}><p className="text-[10px] uppercase tracking-widest opacity-50">{a}</p><p className="mt-2 text-lg" style={heading}>{b}</p></div>)}</div>
      <section className="rounded-3xl p-7" style={{background:p.surface}}><p className="text-2xl" style={heading}>Wedding Wishes</p><p className="mt-3 text-sm leading-7 opacity-65">Semoga perjalanan kalian selalu dipenuhi cinta, ketenangan, dan kebahagiaan.</p></section>
      {images.length>0&&<div className="grid grid-cols-2 gap-3 md:grid-cols-3">{images.map(i=><img key={i.id} src={i.url} alt={i.title??"Galeri pernikahan"} className="aspect-square w-full rounded-2xl object-cover"/>)}</div>}
      <section className="rounded-3xl p-7" style={{background:p.surface}}><p className="text-2xl" style={heading}>Map &amp; Venue</p><p className="mt-2 text-sm opacity-65">{invitation.venue}</p><a href={mapUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full px-5 py-2 text-xs text-white" style={{background:p.accent}}>Buka Google Maps</a></section>
      <RsvpForm slug={invitation.slug} guestId={guest?.id} guestName={guest?.name} eventDate={invitation.eventDate} venue={invitation.venue} title={invitation.title} start={invitation.ceremonyTime??invitation.receptionTime} end={invitation.receptionTime??invitation.ceremonyTime} description={invitation.description}/>
      <p className="pt-4 text-[10px] uppercase tracking-[.3em]" style={{color:p.accent,...heading}}>With love, {invitation.groomName} &amp; {invitation.brideName}</p>
    </section></main>;
}
