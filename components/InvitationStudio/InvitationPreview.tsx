"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";

const RomanticRoseTemplate = dynamic(() => import("@/components/PublicInvitation/RomanticRoseTemplate"));
import { weddingParentLine } from "@/lib/events/parents";
import { getIndonesiaTimezone } from "@/lib/events/catalog";
import {
  invitationFonts,
  invitationPalettes,
  type FontKey,
  type PaletteKey,
} from "@/lib/templates/design";
import type { InvitationSections } from "@/lib/templates/sections";
import { invitationTemplatePresets } from "@/components/InvitationStudio/designer-config";
import {
  formatInvitationEventDate,
  getInvitationEventIdentity,
} from "@/components/InvitationStudio/designer-state";
import type { InvitationDesignerInvitation } from "@/components/InvitationStudio/designer-types";

export function InvitationPreview({
  invitation,
  templateKey,
  palette,
  fontPair,
  decorUrl,
  eventTag,
  dressCode,
  sections,
}: {
  invitation: InvitationDesignerInvitation | null;
  templateKey: string;
  palette: (typeof invitationPalettes)[PaletteKey];
  fontPair: (typeof invitationFonts)[FontKey];
  decorUrl: string;
  eventTag: string;
  dressCode: string;
  sections: InvitationSections;
}) {
  if (templateKey === "romantic-rose" && invitation) {
    return <RomanticRoseTemplate invitation={invitation} preview sections={sections} coverUrl={decorUrl} />;
  }

  const layout =
    (invitationTemplatePresets[templateKey] ||
      invitationTemplatePresets["botanical-ivory"]).layout;
  const identity = getInvitationEventIdentity(invitation);
  const timezone = getIndonesiaTimezone(
    invitation?.timezone || "Asia/Jakarta",
  );

  const groomParents =
    identity.category === "WEDDING"
      ? weddingParentLine(
          invitation?.groomFatherName,
          invitation?.groomMotherName,
          invitation?.groomChildOrder,
          "putra",
        )
      : "";

  const brideParents =
    identity.category === "WEDDING"
      ? weddingParentLine(
          invitation?.brideFatherName,
          invitation?.brideMotherName,
          invitation?.brideChildOrder,
          "putri",
        )
      : "";

  const name = identity.secondary
    ? `${identity.primary} & ${identity.secondary}`
    : identity.primary;

  const hero = {
    botanical: "rounded-[120px_120px_30px_30px] border p-2",
    editorial: "rounded-[24px] border p-2 rotate-[-1deg]",
    maroon: "rounded-none border-y p-0",
    garden: "rounded-[45%_45%_14px_14px] border p-2",
    midnight: "rounded-full border p-2",
    classic: "rounded-[90px_90px_12px_12px] border p-2",
  }[layout];

  const shellRadius =
    layout === "maroon"
      ? "rounded-[8px]"
      : layout === "classic"
        ? "rounded-[18px]"
        : "rounded-[28px]";
  const dark = layout === "maroon" || layout === "midnight";

  return (
    <div
      className={`${shellRadius} overflow-hidden border shadow-[0_24px_70px_rgba(66,42,33,.16)]`}
      style={{
        background: palette.surface,
        borderColor: palette.soft,
        color: palette.ink,
        fontFamily: fontPair.body,
      }}
    >
      <section
        className={`relative overflow-hidden text-center ${
          layout === "maroon" ? "px-0 pb-10 pt-0" : "px-7 pb-9 pt-10"
        }`}
        style={{
          background: dark ? palette.ink : palette.surface,
          color: dark ? palette.surface : palette.ink,
        }}
      >
        {layout === "editorial" && (
          <div
            className="absolute left-5 top-6 h-20 w-px opacity-30"
            style={{ background: palette.accent }}
          />
        )}
        {layout === "garden" && (
          <div
            className="absolute inset-x-0 top-0 h-20 opacity-35"
            style={{
              background: `linear-gradient(180deg, ${palette.soft}, transparent)`,
            }}
          />
        )}
        {layout === "maroon" && decorUrl && (
          <img
            src={decorUrl}
            alt=""
            className="h-52 w-full object-cover opacity-75"
          />
        )}

        <div className={layout === "maroon" ? "px-7 pt-8" : ""}>
          <p
            className="text-[8px] uppercase tracking-[0.24em]"
            style={{ color: dark ? palette.soft : palette.accent }}
          >
            {identity.label}
          </p>
          <h1
            className={`mt-3 leading-tight ${
              layout === "editorial"
                ? "text-[34px] italic"
                : layout === "maroon"
                  ? "text-[38px] uppercase tracking-[0.04em]"
                  : "text-[34px]"
            }`}
            style={{ fontFamily: fontPair.heading }}
          >
            {name}
          </h1>

          {layout !== "maroon" && (
            <div
              className={`mx-auto mt-7 w-[230px] overflow-hidden ${hero}`}
              style={{ borderColor: palette.soft, background: palette.bg }}
            >
              <img
                src={decorUrl}
                alt=""
                className={`${
                  layout === "midnight" ? "aspect-square" : "aspect-[4/5]"
                } h-full w-full object-cover ${
                  layout === "botanical"
                    ? "rounded-[112px_112px_24px_24px]"
                    : layout === "garden"
                      ? "rounded-[45%_45%_10px_10px]"
                      : layout === "classic"
                        ? "rounded-[80px_80px_8px_8px]"
                        : layout === "midnight"
                          ? "rounded-full"
                          : "rounded-[18px]"
                }`}
              />
            </div>
          )}

          <p
            className="mt-6 text-[12px]"
            style={{ fontFamily: fontPair.heading }}
          >
            {formatInvitationEventDate(invitation)}
          </p>
          <p className="mt-1 text-[9px] opacity-65">
            {invitation?.venue || "Lokasi belum diatur"}
          </p>
        </div>
      </section>

      <Divider
        color={palette.soft}
        glyph={
          layout === "garden" ? "✦" : layout === "midnight" ? "✧" : "◇"
        }
      />

      <section className="px-8 text-center">
        <p className="text-[10px] leading-5 opacity-65">
          {invitation?.description ||
            "Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir dan menjadi bagian dari momen istimewa ini."}
        </p>

        {identity.secondary && (
          <div
            className={`mt-7 grid gap-5 ${
              layout === "editorial"
                ? "grid-cols-2 items-start text-left"
                : ""
            }`}
          >
            <PersonBlock
              name={identity.primary}
              parentLine={groomParents}
              font={fontPair.heading}
            />
            {layout !== "editorial" && <p className="text-xs opacity-40">&</p>}
            <PersonBlock
              name={identity.secondary}
              parentLine={brideParents}
              font={fontPair.heading}
            />
          </div>
        )}
      </section>

      <Divider
        color={palette.soft}
        glyph={layout === "garden" ? "✦" : "◇"}
      />

      <section className="px-8 text-center">
        <p
          className="text-[8px] uppercase tracking-[0.2em]"
          style={{ color: palette.accent }}
        >
          Save The Date
        </p>
        <h2
          className="mt-2 text-2xl"
          style={{ fontFamily: fontPair.heading }}
        >
          Waktu & Lokasi
        </h2>

        <div
          className={`mt-5 grid gap-3 ${
            layout === "editorial" ? "grid-cols-2" : ""
          }`}
        >
          <InfoCard
            title="Mulai"
            value={`${invitation?.ceremonyTime || "--:--"} ${timezone.label}`}
            palette={palette}
            dark={false}
          />
          {invitation?.receptionTime && (
            <InfoCard
              title="Selesai"
              value={
                invitation.receptionTime === "END"
                  ? "- end"
                  : `${invitation.receptionTime} ${timezone.label}`
              }
              palette={palette}
              dark={layout === "maroon" || layout === "midnight"}
            />
          )}
        </div>

        <p
          className="mt-5 text-lg"
          style={{ fontFamily: fontPair.heading }}
        >
          {invitation?.venue || "Lokasi belum diatur"}
        </p>
        {invitation?.address && (
          <p className="mt-1 text-[9px] leading-4 opacity-60">
            {invitation.address}
          </p>
        )}
        {dressCode && (
          <p className="mt-3 text-[9px] opacity-55">
            Dress code · {dressCode}
          </p>
        )}
      </section>

      {sections.rsvp && (
        <>
          <Divider color={palette.soft} glyph="◇" />
          <PreviewSection
            eyebrow="Kehadiran"
            title="Konfirmasi RSVP"
            description="Form konfirmasi kehadiran akan tampil di sini."
            palette={palette}
            fontPair={fontPair}
          >
            <div className="space-y-2">
              <PreviewField label="Nama Tamu" />
              <PreviewField label="Konfirmasi Kehadiran" />
              <PreviewField label="Jumlah Tamu" />
              <div
                className="rounded-lg px-3 py-2 text-center text-[9px] font-semibold"
                style={{ background: palette.ink, color: palette.surface }}
              >
                KIRIM KONFIRMASI
              </div>
            </div>
          </PreviewSection>
        </>
      )}

      {sections.wishes && (
        <>
          <Divider color={palette.soft} glyph="◇" />
          <PreviewSection
            eyebrow="Ucapan & Doa"
            title="Wishes"
            description="Tamu dapat meninggalkan ucapan untuk acara Anda."
            palette={palette}
            fontPair={fontPair}
          >
            <div
              className="rounded-xl border p-4 text-left"
              style={{ borderColor: palette.soft, background: palette.bg }}
            >
              <p className="text-[10px] font-semibold">Tulis ucapan Anda</p>
              <div
                className="mt-3 h-14 rounded-lg border opacity-55"
                style={{ borderColor: palette.soft }}
              />
            </div>
          </PreviewSection>
        </>
      )}

      {sections.gift && (
        <>
          <Divider color={palette.soft} glyph="◇" />
          <PreviewSection
            eyebrow="Tanda Kasih"
            title="Gift / E-Angpao"
            description="Informasi hadiah digital tampil hanya ketika section ini aktif."
            palette={palette}
            fontPair={fontPair}
          >
            <div
              className="rounded-xl border p-4 text-left"
              style={{ borderColor: palette.soft, background: palette.bg }}
            >
              <p className="text-[9px] uppercase tracking-[0.14em] opacity-55">
                Transfer Bank
              </p>
              <p className="mt-2 text-xs font-semibold">
                {invitation?.giftBankName || "Bank"}
              </p>
              <p className="mt-1 text-[10px] opacity-65">
                {invitation?.giftAccountName || "Nama Pemilik"}
              </p>
              <p className="mt-1 text-[10px] font-semibold">
                {invitation?.giftAccountNumber || "Nomor rekening"}
              </p>
            </div>
          </PreviewSection>
        </>
      )}

      <Divider color={palette.soft} glyph="◇" />
      <footer className="px-8 pb-9 text-center">
        {eventTag && (
          <p className="text-[10px]" style={{ color: palette.accent }}>
            {eventTag}
          </p>
        )}
        <p className="mt-3 text-[9px] opacity-50">DC Organizer</p>
      </footer>
    </div>
  );
}

function PersonBlock({
  name,
  parentLine,
  font,
}: {
  name: string;
  parentLine: string;
  font: string;
}) {
  return (
    <div>
      <h2 className="text-2xl" style={{ fontFamily: font }}>
        {name}
      </h2>
      {parentLine && (
        <p className="mt-1 text-[9px] leading-4 opacity-60">{parentLine}</p>
      )}
    </div>
  );
}

function InfoCard({
  title,
  value,
  palette,
  dark,
}: {
  title: string;
  value: string;
  palette: (typeof invitationPalettes)[PaletteKey];
  dark: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: palette.soft,
        background: dark ? palette.ink : palette.bg,
        color: dark ? palette.surface : palette.ink,
      }}
    >
      <p className="text-xs font-semibold">{title}</p>
      <p className="mt-1 text-[10px] opacity-70">{value}</p>
    </div>
  );
}

function Divider({ color, glyph }: { color: string; glyph: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6 opacity-60">
      <span className="h-px w-12" style={{ background: color }} />
      <span className="text-[8px]">{glyph}</span>
      <span className="h-px w-12" style={{ background: color }} />
    </div>
  );
}

function PreviewSection({
  eyebrow,
  title,
  description,
  palette,
  fontPair,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  palette: (typeof invitationPalettes)[PaletteKey];
  fontPair: (typeof invitationFonts)[FontKey];
  children?: ReactNode;
}) {
  return (
    <section className="px-8 py-3 text-center">
      <p
        className="text-[8px] uppercase tracking-[0.2em]"
        style={{ color: palette.accent }}
      >
        {eyebrow}
      </p>
      <h2
        className="mt-2 text-2xl"
        style={{ fontFamily: fontPair.heading }}
      >
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-[270px] text-[10px] leading-4 opacity-60">
        {description}
      </p>
      {children && <div className="mt-5">{children}</div>}
    </section>
  );
}

function PreviewField({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/65 px-3 py-2 text-left text-[9px] text-black/45">
      {label}
    </div>
  );
}
